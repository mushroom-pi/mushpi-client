import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useDocumentTitle } from '~hook/useDocumentTitle';

describe('useDocumentTitle', () => {
  beforeEach(() => {
    document.title = '';
  });

  it('sets the tab title with the site suffix', () => {
    renderHook(() => useDocumentTitle('Batches'));
    expect(document.title).toBe('Batches — Mushroom Pi');
  });

  it('updates when the title changes', () => {
    const { rerender } = renderHook(({ t }) => useDocumentTitle(t), {
      initialProps: { t: 'Batches' },
    });
    rerender({ t: 'Settings' });
    expect(document.title).toBe('Settings — Mushroom Pi');
  });
});
