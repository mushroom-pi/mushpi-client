import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useDemoMode } from '~hook/useDemoMode';
import { RELEASE_LABEL } from '~utils/buildInfo';
import { DEMO_DOCS_URL } from '~utils/externalLinks';

import { DemoNotice } from './DemoNotice';

vi.mock('~hook/useDemoMode', () => ({ useDemoMode: vi.fn() }));

const mockedUseDemoMode = vi.mocked(useDemoMode);

describe('DemoNotice', () => {
  it('renders the sanctioned copy with the chip and a new-tab link on a demo hub', () => {
    mockedUseDemoMode.mockReturnValue({ isDemo: true, isLoading: false });

    render(<DemoNotice />);

    const chip = screen.getByText('DEMO');
    const tag = screen.getByText(RELEASE_LABEL);
    // chip first, release tag beside it on the same row
    expect(chip.parentElement?.parentElement).toBe(tag.parentElement);
    expect(chip.compareDocumentPosition(tag) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    expect(screen.getByText(/Sample data, simulated pico units,/)).toBeInTheDocument();
    expect(screen.getByText('read-only functionalities')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: 'read-only functionalities' });
    expect(link).toHaveAttribute('href', DEMO_DOCS_URL);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders nothing on a non-demo hub — no chip, no copy, no DOM', () => {
    mockedUseDemoMode.mockReturnValue({ isDemo: false, isLoading: false });

    const { container } = render(<DemoNotice />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText(/Sample data, simulated pico units,/)).toBeNull();
  });
});
