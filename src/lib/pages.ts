// Reads every row of a query by paging with .range(), because PostgREST
// silently caps a single response (1000 rows by default on Supabase).
// The caller must give the query a stable, unique sort (e.g. created_at then id)
// so pages neither overlap nor skip rows.

export type Page<T> = { data: T[] | null; error: unknown; count?: number | null };

/** Fetches rows [from, to] inclusive, like PostgREST's .range(from, to). */
export type PageSource<T> = (from: number, to: number) => PromiseLike<Page<T>>;

export const PAGE_SIZE = 1000;

/**
 * Keeps requesting pages until one comes back shorter than pageSize.
 * Throws if any page errors, so callers never get a partial result.
 * If the source reports a total `count`, it also throws when fewer rows were
 * read than that total (e.g. the server's row cap is below pageSize, which
 * would otherwise make the first page look "short" and end early).
 */
export async function fetchAllPages<T>(source: PageSource<T>, pageSize = PAGE_SIZE): Promise<T[]> {
  const rows: T[] = [];
  let total: number | null = null;
  for (let from = 0; ; from += pageSize) {
    const { data, error, count } = await source(from, from + pageSize - 1);
    if (error) throw new Error(`page starting at row ${from} failed`, { cause: error });
    const page = data ?? [];
    rows.push(...page);
    if (typeof count === "number") total = count;
    if (page.length < pageSize) break;
  }
  if (total !== null && rows.length < total) {
    throw new Error(`read ${rows.length} of ${total} rows`);
  }
  return rows;
}
