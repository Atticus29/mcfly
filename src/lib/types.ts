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

// ─── Slice 2: supplementary bundle types ─────────────────────────────────────

/** A single file within a supplementary material bundle. */
export interface SupplementaryFile {
  /** Filename including extension, e.g. "analysis.py" */
  name: string
  /** Absolute path to the temporarily downloaded file on disk */
  localPath: string
  /** File size in bytes */
  sizeBytes: number
}

/** A downloaded supplementary material bundle for one article. */
export interface SupplementaryBundle {
  /** ID of the article this bundle belongs to */
  articleId: string
  /** Title of the article this bundle belongs to */
  articleTitle: string
  /** All files extracted into the temp directory */
  files: SupplementaryFile[]
  /** Absolute path to the temporary directory holding extracted files */
  tempDir: string
}

/**
 * Injectable function that downloads and extracts the supplementary bundle
 * for a single article. Keeps network/filesystem I/O out of business logic.
 */
export type DownloadBundleFn = (article: Article) => Promise<SupplementaryBundle>
