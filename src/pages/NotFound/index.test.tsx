import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import NotFound from './index';

vi.mock('~assets/SadMushroom.svg', () => ({ default: 'mock.svg' }));

/** Duplicated from the page on purpose — the test pins the user-visible wording. */
const NOT_FOUND_MESSAGE =
  "This page doesn't exist. It may have moved, or the address may be mistyped.";

/**
 * The page renders inside the app shell in production, but the shell (Sidebar,
 * ServerDownBanner) needs React Query and is out of scope here — a memory router
 * with a `/` landing and a `*` catch-all is enough to exercise the page itself.
 */
function renderAtUnknownPath() {
  const router = createMemoryRouter(
    [
      { path: '/', element: <p>Dashboard landing</p> },
      { path: '*', element: <NotFound /> },
    ],
    { initialEntries: ['/nope'] },
  );
  return render(<RouterProvider router={router} />);
}

describe('NotFound page', () => {
  it('renders the 404 heading', () => {
    renderAtUnknownPath();
    expect(screen.getByRole('heading', { level: 1, name: '404 — Not Found' })).toBeInTheDocument();
  });

  it("sets the tab title to the page's own title", () => {
    renderAtUnknownPath();
    expect(document.title).toBe('404 — Not Found — Mushroom Pi');
  });

  it('shows the friendly line', () => {
    renderAtUnknownPath();
    expect(screen.getByText(NOT_FOUND_MESSAGE)).toBeInTheDocument();
  });

  it('describes the sad-mushroom illustration with the friendly line', () => {
    renderAtUnknownPath();
    expect(screen.getByRole('img')).toHaveAttribute('alt', NOT_FOUND_MESSAGE);
  });

  it('navigates to the dashboard from its only action', async () => {
    const user = userEvent.setup();
    renderAtUnknownPath();
    await user.click(screen.getByRole('button', { name: 'Back to Dashboard' }));
    expect(await screen.findByText('Dashboard landing')).toBeInTheDocument();
  });
});
