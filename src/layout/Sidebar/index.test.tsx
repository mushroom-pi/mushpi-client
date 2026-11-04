import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { useDemoMode } from '~hook/useDemoMode';
import { RELEASE_LABEL } from '~utils/buildInfo';
import { DEMO_DOCS_URL } from '~utils/externalLinks';

import Sidebar from './index';

vi.mock('~hook/useDemoMode', () => ({ useDemoMode: vi.fn() }));

const mockedUseDemoMode = vi.mocked(useDemoMode);

function renderSidebar() {
  return render(
    <MemoryRouter>
      <Sidebar />
    </MemoryRouter>,
  );
}

describe('Sidebar footer', () => {
  it('demo hub: chip precedes the release tag on one row, with the notice beneath', () => {
    mockedUseDemoMode.mockReturnValue({ isDemo: true, isLoading: false });
    renderSidebar();

    // Anchor on the notice: it exists only in the drawer footer, which also
    // disambiguates the chip from the mobile AppBar slot (both render in
    // jsdom's narrow viewport).
    const notice = screen.getByText(/Sample data, simulated pico units,/);
    const group = notice.parentElement as HTMLElement;
    const chip = within(group).getByText('DEMO');
    const tag = within(group).getByText(RELEASE_LABEL);

    // chip first, release tag beside it on the same row
    expect(chip.parentElement?.parentElement).toBe(tag.parentElement);
    expect(chip.compareDocumentPosition(tag) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    // notice beneath the row, with the docs link carrying the new-tab safety attrs
    const link = within(group).getByText('read-only functionalities').closest('a');
    expect(link).not.toBeNull();
    expect(link).toHaveAttribute('href', DEMO_DOCS_URL);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('non-demo hub: the release tag renders alone — no chip, no notice', () => {
    mockedUseDemoMode.mockReturnValue({ isDemo: false, isLoading: false });
    renderSidebar();

    expect(screen.getByText(RELEASE_LABEL)).toBeInTheDocument();
    expect(screen.queryByText('DEMO')).toBeNull();
    expect(screen.queryByText(/Sample data, simulated pico units,/)).toBeNull();
  });
});
