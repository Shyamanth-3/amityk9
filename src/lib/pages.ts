// Reads every row of a query by paging with .range(), because PostgREST
// silently caps a single response (1000 rows by default on Supabase).
// The caller must give the query a stable, unique sort (e.g. created_at then id)
// so pages neither overlap nor skip rows.

export type Page<T> = { data: T[] | null; error: unknown; count?: number | null };

/** Fetches rows [from, to] inclusive, like PostgREST's .range(from, to). */
export type PageSource<T> = (from: number, to: number) => PromiseLike<Page<T>>;

export const PAGE_SIZE = 1000;

/**
 * Each request starts where the rows received so far end. If the source reports
 * a total `count`, it keeps going until it has that many rows (so a server row
 * cap below pageSize still exports everything); otherwise it stops at the first
 * page shorter than pageSize.
 * Throws if any page errors, or if fewer rows than the total could be read,
 * so callers never get a partial result.
 */
export async function fetchAllPages<T>(source: PageSource<T>, pageSize = PAGE_SIZE): Promise<T[]> {
  const rows: T[] = [];
  let total: number | null = null;
  for (let from = 0; ; ) {
    const { data, error, count } = await source(from, from + pageSize - 1);
    if (error) throw new Error(`page starting at row ${from} failed`, { cause: error });
    const page = data ?? [];
    rows.push(...page);
    from += page.length;
    if (typeof count === "number") total = count;
    // With a total, keep going until we have it all, even if the server caps pages below pageSize.
    // Without one, a short page means the end.
    if (page.length === 0 || (total !== null ? rows.length >= total : page.length < pageSize)) break;
  }
  if (total !== null && rows.length < total) {
    throw new Error(`read ${rows.length} of ${total} rows`);
  }
  return rows;
}
