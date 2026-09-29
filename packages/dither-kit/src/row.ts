/**
 * The public generic constraint every chart root takes for its row type.
 *
 * `object` rather than `Record<string, unknown>`: interfaces don't get an
 * implicit index signature, so an interface-typed row failed to satisfy a
 * `Record` constraint. The controllers re-cast to their own indexing `Row`
 * because they only ever read the configured series keys.
 *
 * Shared so the constraint and this note have one home instead of a copy in
 * every chart entrypoint.
 */
export type ChartRow = object
