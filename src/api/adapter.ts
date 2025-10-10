export async function unwrap<T>(p: Promise<T> | Promise<{ data: T }>): Promise<T> {
  const r = await p;
  // if it's axios-like response with 'data', return that; otherwise return r
  if (r && typeof r === 'object' && 'data' in (r as any)) {
    return (r as any).data as T;
  }
  return r as T;
}
