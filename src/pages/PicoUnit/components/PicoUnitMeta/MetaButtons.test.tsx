import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { makePicoUnit, renderWithProviders } from '../../../../test/fixtures';
import { MetaButtons } from './MetaButtons';

const mockRefetch = vi.fn();

// The real PicoUnitProvider memoizes its context value and `pico` is stable
// React Query cache data. Build the mock context lazily once inside the hook
// closure (not at the factory top level) so every hook call returns the same
// object — a fresh object per call would re-trigger consumers' memos and
// effects and wipe interactions. The lazy cache dodges vi.mock-hoisting TDZ
// over the `makePicoUnit` and `mockRefetch` references, which are only
// evaluated during render.
vi.mock('~ctx/PicoUnit', () => {
  let ctx:
    | {
        pico: ReturnType<typeof makePicoUnit>;
        isLoading: boolean;
        refetch: typeof mockRefetch;
      }
    | undefined;

  return {
    usePicoUnitContext: () => {
      if (!ctx) {
        ctx = { pico: makePicoUnit(), isLoading: false, refetch: mockRefetch };
      }
      return ctx;
    },
  };
});

function renderMetaButtons() {
  return renderWithProviders(
    <MemoryRouter>
      <MetaButtons
        setEditOpen={vi.fn()}
        setDeleteOpen={vi.fn()}
        onReconnect={vi.fn()}
        onRebootPico={vi.fn()}
      />
    </MemoryRouter>,
  );
}

describe('MetaButtons', () => {
  it('does not render a Back action at any width', () => {
    renderMetaButtons();
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
  });

  it('renames the refresh action to Ping and keeps the other icon actions', () => {
    renderMetaButtons();
    expect(screen.queryByRole('button', { name: 'Refresh' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ping' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Readings' })).toBeInTheDocument();
  });

  it('renders Edit and Delete through the shared ItemActions pair, resolvable by visible text', () => {
    renderMetaButtons();
    const editButton = screen.getByRole('button', { name: 'Edit' });
    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    expect(editButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
    // The names come from the visible button labels, not aria-label overrides.
    expect(editButton).not.toHaveAttribute('aria-label');
    expect(deleteButton).not.toHaveAttribute('aria-label');
  });

  it('emits unit actions before the Edit/Delete pair in DOM order', () => {
    renderMetaButtons();
    const names = screen
      .getAllByRole('button')
      .map((button) => button.getAttribute('aria-label') ?? button.textContent?.trim());
    // Healthy monitored unit fixture: Reconnect hidden (status not 'offline'),
    // Reboot shown (monitored). This pins the regular-screen order — DOM order,
    // unit actions first, then Edit/Delete. The phone-first visual swap is CSS
    // `order`, which jsdom cannot assert (no layout engine): manual browser check.
    expect(names).toEqual(['Ping', 'Readings', 'Reboot', 'Edit', 'Delete']);
  });

  it('colours Ping green and Reboot red', () => {
    renderMetaButtons();
    expect(screen.getByRole('button', { name: 'Ping' })).toHaveClass('MuiIconButton-colorSuccess');
    expect(screen.getByRole('button', { name: 'Reboot' })).toHaveClass('MuiIconButton-colorError');
  });
});
