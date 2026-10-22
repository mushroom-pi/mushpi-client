import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import type { DashboardUnitItemDto } from '~api/generated';

import { UnitCards } from './UnitCards';

/** 30-glyph batch name exercising the clipper: the card shows the first 20 graphemes + "...". */
const LONG_DESCRIPTION = '123456789012345678901234567890';
const CLIPPED_LABEL = '12345678901234567890...';

const items: DashboardUnitItemDto[] = [
  {
    id: 1,
    handle: 'unit-a',
    name: 'Unit A',
    status: 'healthy',
    api_compatibility: 'compatible',
    lastSeenSecondsAgo: 30,
    uptimeHours: 1,
    failedCalls: 0,
    failedReadings: 0,
    consecutiveEmptyReadings: 0,
    controlLoopEnabled: true,
    lastReading: { temperature: 25, humidity: 80, timestamp: '2026-01-01T00:00:00.000Z' },
    activeBatch: { id: 7, name: LONG_DESCRIPTION, status: 'in-progress', daysRemaining: 5 },
  },
  {
    id: 2,
    handle: 'unit-b',
    name: 'Unit B',
    status: 'offline',
    api_compatibility: 'compatible',
    lastSeenSecondsAgo: null,
    uptimeHours: 0,
    failedCalls: 3,
    failedReadings: 1,
    consecutiveEmptyReadings: 0,
    controlLoopEnabled: false,
    lastReading: null,
    activeBatch: null,
  },
];

/**
 * UnitCards navigates (useNavigate) but consumes no React Query, so a bare
 * MemoryRouter is the only wrapper needed — no renderWithProviders.
 */
function renderCards() {
  return render(
    <MemoryRouter>
      <UnitCards items={items} healthy={1} degraded={0} offline={1} total={2} />
    </MemoryRouter>,
  );
}

describe('UnitCards', () => {
  it('renders the clipped batch label instead of the full description', () => {
    renderCards();
    expect(screen.getByText(CLIPPED_LABEL)).toBeInTheDocument();
    // The full description must not be rendered a second time anywhere (no tooltip, no fallback copy)
    expect(screen.queryByText(LONG_DESCRIPTION)).toBeNull();
  });

  it('gives the clipped chip no title attribute and no tooltip affordance', () => {
    renderCards();
    const label = screen.getByText(CLIPPED_LABEL);
    const chip = label.closest('.MuiChip-root');
    expect(chip).not.toBeNull();
    expect(label).not.toHaveAttribute('title');
    expect(chip).not.toHaveAttribute('title');
    // A MUI Tooltip marks its trigger with aria-describedby; nothing here carries it.
    expect(label).not.toHaveAttribute('aria-describedby');
    expect(chip).not.toHaveAttribute('aria-describedby');
  });

  it('keeps the days-left chip beside the clipped batch chip', () => {
    renderCards();
    expect(screen.getByText('5d left')).toBeInTheDocument();
  });

  it('renders a "No active batch" chip for a unit without a batch', () => {
    renderCards();
    expect(screen.getByText('No active batch')).toBeInTheDocument();
  });
});
