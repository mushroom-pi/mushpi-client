import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Helper: stub VITE_API_BASE_URL, reset the module registry so the next
 * dynamic import re-evaluates the module (picking up the new env value),
 * and return a fresh `resolveApiUrl` bound to that base.
 */
async function loadResolver(base: string | undefined) {
  if (base === undefined) {
    vi.unstubAllEnvs();
  } else {
    vi.stubEnv('VITE_API_BASE_URL', base);
  }
  vi.resetModules();
  const mod = await import('~utils/apiUrl');
  return mod.resolveApiUrl;
}

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('resolveApiUrl', () => {
  it('prefixes a relative path with the dev-style API base', async () => {
    const resolve = await loadResolver('http://localhost:3000');
    expect(resolve('/images/recipes/1.jpg')).toBe('http://localhost:3000/images/recipes/1.jpg');
  });

  it('leaves a relative path unchanged when base is "/" (prod same-origin)', async () => {
    const resolve = await loadResolver('/');
    expect(resolve('/images/recipes/1.jpg')).toBe('/images/recipes/1.jpg');
  });

  it('passes https:// hotlink URLs through untouched', async () => {
    const resolve = await loadResolver('http://localhost:3000');
    const url = 'https://example.com/img.jpg';
    expect(resolve(url)).toBe(url);
  });

  it('passes http:// hotlink URLs through untouched', async () => {
    const resolve = await loadResolver('http://localhost:3000');
    const url = 'http://example.com/img.jpg';
    expect(resolve(url)).toBe(url);
  });

  it('passes protocol-relative // URLs through untouched', async () => {
    const resolve = await loadResolver('http://localhost:3000');
    const url = '//cdn.example.com/img.jpg';
    expect(resolve(url)).toBe(url);
  });

  it('passes data: URLs through untouched', async () => {
    const resolve = await loadResolver('http://localhost:3000');
    const url = 'data:image/png;base64,abc123';
    expect(resolve(url)).toBe(url);
  });

  it('passes blob: URLs through untouched', async () => {
    const resolve = await loadResolver('http://localhost:3000');
    const url = 'blob:http://localhost:5173/abc-def';
    expect(resolve(url)).toBe(url);
  });

  it('returns undefined for null', async () => {
    const resolve = await loadResolver('http://localhost:3000');
    expect(resolve(null)).toBeUndefined();
  });

  it('returns undefined for undefined', async () => {
    const resolve = await loadResolver('http://localhost:3000');
    expect(resolve(undefined)).toBeUndefined();
  });

  it('returns undefined for empty string', async () => {
    const resolve = await loadResolver('http://localhost:3000');
    expect(resolve('')).toBeUndefined();
  });

  it('normalizes a trailing slash on the base', async () => {
    const resolve = await loadResolver('http://localhost:3000/');
    expect(resolve('/images/recipes/1.jpg')).toBe('http://localhost:3000/images/recipes/1.jpg');
  });

  it('falls back to http://localhost:3000 when env var is unset', async () => {
    const resolve = await loadResolver(undefined);
    expect(resolve('/images/recipes/1.jpg')).toBe('http://localhost:3000/images/recipes/1.jpg');
  });
});
