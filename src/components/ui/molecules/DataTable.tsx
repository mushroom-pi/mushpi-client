import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export interface DataTableColumn<TRow> {
  key: string;
  label: string;
  hidden?: boolean;
  /** Providing a sortValue enables sorting for this column. */
  sortValue?: (row: TRow) => string | number;
  renderCell: (row: TRow) => ReactNode;
}

export interface DataTableProps<TRow extends { id: number }> {
  columns: DataTableColumn<TRow>[];
  rows: TRow[];
  onRowClick: (id: number) => void;
  activeId?: number;
  disablePaper?: boolean;
  emptyMessage?: string;
  initialSortKey?: string;
  initialSortOrder?: 'asc' | 'desc';
}

export function DataTable<TRow extends { id: number }>({
  columns,
  rows,
  onRowClick,
  activeId,
  disablePaper,
  emptyMessage = 'No data.',
  initialSortKey,
  initialSortOrder = 'asc',
}: DataTableProps<TRow>) {
  const [sortKey, setSortKey] = useState<string | undefined>(initialSortKey);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);

  const visibleColumns = useMemo(() => columns.filter((col) => !col.hidden), [columns]);

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find((c) => c.key === sortKey);
    // If the sort column is hidden or has no sortValue, return as-is
    if (!col?.sortValue || col.hidden) return rows;
    return [...rows].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      const cmp =
        typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [rows, columns, sortKey, sortOrder]);

  function handleSort(key: string) {
    if (key === sortKey) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  }

  return (
    <TableContainer component={disablePaper ? 'div' : Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {visibleColumns.map((col) => (
              <TableCell
                key={col.key}
                sortDirection={col.sortValue && sortKey === col.key ? sortOrder : false}
              >
                {col.sortValue ? (
                  <TableSortLabel
                    active={sortKey === col.key}
                    direction={sortKey === col.key ? sortOrder : 'asc'}
                    onClick={() => handleSort(col.key)}
                  >
                    {col.label}
                  </TableSortLabel>
                ) : (
                  col.label
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={visibleColumns.length}>
                <Typography variant="body2" color="text.secondary">
                  {emptyMessage}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            sortedRows.map((row) => (
              <TableRow
                key={row.id}
                hover
                onClick={() => onRowClick(row.id)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: activeId === row.id ? 'action.selected' : undefined,
                }}
              >
                {visibleColumns.map((col) => (
                  <TableCell key={col.key}>{col.renderCell(row)}</TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
