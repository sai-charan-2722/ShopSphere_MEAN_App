/** Convert an arbitrary string into a URL-friendly slug. */
export function slugify(input: string): string {
  return input
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // strip non-alphanumerics
    .replace(/[\s_-]+/g, '-') // collapse whitespace/underscores to single dash
    .replace(/^-+|-+$/g, ''); // trim leading/trailing dashes
}
