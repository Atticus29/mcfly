/**
 * Core domain types for the mcfly pipeline.
 * All types derive from terminology in SPEC.md.
 */

/** An endpoint a journal exposes for article/supplement access. */
export interface JournalEndpoint {
  /** Human-readable label, e.g. "articles" or "supplements" */
  name: string
  /** The base URL for this endpoint */
  url: string
}

/** A single journal entry in the registry. */
export interface Journal {
  /** Unique slug, e.g. "nature", "science", "cell" */
  id: string
  /** Display name */
  displayName: string
  /** Modular API endpoints; can be added/removed without touching other logic */
  endpoints: JournalEndpoint[]
}

/** Minimal article metadata returned by a journal's articles endpoint. */
export interface Article {
  /** Journal-assigned identifier */
  id: string
  /** Article title */
  title: string
  /** Abstract text (may be empty string if not available) */
  abstract: string
  /** Full-text body (may be empty string if not available) */
  fullText: string
  /** URL to the supplementary material landing page */
  supplementaryUrl: string
}

/**
 * Dependency-injectable function that fetches a page of articles for a journal.
 * Keeps network I/O decoupled from business logic (AC-05).
 */
export type FetchArticlesFn = (journalId: string, page: number) => Promise<Article[]>
