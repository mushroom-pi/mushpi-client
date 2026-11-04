import { afterEach, describe, expect, it, vi } from 'vitest';

import { clipBatchDescription, formatRelativeFromNow } from './methods';

/** Count grapheme clusters the same way the clipper does (Intl.Segmenter is available in Node). */
function graphemes(text: string): number {
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  return [...segmenter.segment(text)].length;
}

describe('formatRelativeFromNow', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for a timestamp 4 seconds ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'));
    const fourSecsAgo = new Date('2026-01-01T11:59:56.000Z').toISOString();
    expect(formatRelativeFromNow(fourSecsAgo)).toBe('just now');
  });

  it('returns seconds for a timestamp 30 seconds ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'));
    const thirtySecsAgo = new Date('2026-01-01T11:59:30.000Z').toISOString();
    expect(formatRelativeFromNow(thirtySecsAgo)).toContain('seconds');
  });

  it('returns minutes for a timestamp 5 minutes ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'));
    const fiveMinsAgo = new Date('2026-01-01T11:55:00.000Z').toISOString();
    expect(formatRelativeFromNow(fiveMinsAgo)).toContain('minutes');
  });

  it('returns hours for a timestamp 2 hours ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'));
    const twoHoursAgo = new Date('2026-01-01T10:00:00.000Z').toISOString();
    expect(formatRelativeFromNow(twoHoursAgo)).toContain('hours');
  });
});

describe('clipBatchDescription', () => {
  it('passes a 23-grapheme description through unchanged (no dots)', () => {
    const text = 'a'.repeat(23);
    expect(clipBatchDescription(text)).toBe(text);
  });

  it('truncates a 24-grapheme description to the first 20 graphemes plus "..."', () => {
    const text = 'a'.repeat(24);
    expect(clipBatchDescription(text)).toBe(`${'a'.repeat(20)}...`);
  });

  it('passes 21- and 22-grapheme descriptions through unchanged (no partial truncation)', () => {
    expect(clipBatchDescription('b'.repeat(21))).toBe('b'.repeat(21));
    expect(clipBatchDescription('b'.repeat(22))).toBe('b'.repeat(22));
  });

  it('trims surrounding whitespace before deciding: a padded 23-glyph payload matches the bare one', () => {
    const text = 'c'.repeat(23);
    expect(clipBatchDescription(`   ${text}  `)).toBe(clipBatchDescription(text));
    expect(clipBatchDescription(`   ${text}  `)).toBe(text);
  });

  it('takes the 20 kept graphemes from the trimmed string, not the raw one', () => {
    expect(clipBatchDescription(`     ${'d'.repeat(24)}`)).toBe(`${'d'.repeat(20)}...`);
  });

  it('truncates emoji by grapheme: 24 thumbs-up become 20 thumbs-up plus "..." with no split surrogate pair', () => {
    const emoji = '👍';
    expect(clipBatchDescription(emoji.repeat(24))).toBe(`${emoji.repeat(20)}...`);
  });

  it('counts a flag emoji as exactly one grapheme (23 flags unchanged, 24 clipped)', () => {
    const flag = '🇧🇪';
    expect(graphemes(flag)).toBe(1);
    expect(clipBatchDescription(flag.repeat(23))).toBe(flag.repeat(23));
    expect(clipBatchDescription(flag.repeat(24))).toBe(`${flag.repeat(20)}...`);
  });

  it('counts a ZWJ family emoji as exactly one grapheme (23 families unchanged, 24 clipped)', () => {
    const family = '👨\u200d👩\u200d👧\u200d👦';
    expect(graphemes(family)).toBe(1);
    expect(clipBatchDescription(family.repeat(23))).toBe(family.repeat(23));
    expect(clipBatchDescription(family.repeat(24))).toBe(`${family.repeat(20)}...`);
  });

  it('returns empty string for empty and whitespace-only input (no dots)', () => {
    expect(clipBatchDescription('')).toBe('');
    expect(clipBatchDescription('   \t\n ')).toBe('');
  });

  it('produces a truncated result of exactly 23 graphemes', () => {
    expect(graphemes(clipBatchDescription('a'.repeat(24)))).toBe(23);
    expect(graphemes(clipBatchDescription('👍'.repeat(50)))).toBe(23);
  });
});
