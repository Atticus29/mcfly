/**
 * downloadBundles – orchestrates batched supplementary material downloads.
 *
 * AC-01: honours a configurable maxBundles cap (default 10).
 * AC-02: accepts candidate articles as input (output of Slice 1).
 * AC-03: actual download is performed by an injectable downloadBundle fn.
 * AC-04: each returned bundle is linked to its source articleId + articleTitle.
 */
import type { Article, DownloadBundleFn, SupplementaryBundle } from './types.js'

export const DEFAULT_MAX_BUNDLES = 10

export interface DownloadBundlesOptions {
  /** Candidate articles to download supplementary material for */
  candidates: Article[]
  /** Injectable download function — keeps network I/O out of business logic */
  downloadBundle: DownloadBundleFn
  /**
   * Maximum number of bundles to download in a single run (AC-01).
   * Defaults to DEFAULT_MAX_BUNDLES (10). Must be a positive integer.
   */
  maxBundles?: number
}

/**
 * Downloads supplementary bundles for up to maxBundles candidate articles.
 * Candidates beyond the limit are silently skipped.
 * Throws if maxBundles is not a positive integer.
 */
export async function downloadBundles(
  options: DownloadBundlesOptions,
): Promise<SupplementaryBundle[]> {
  const { candidates, downloadBundle, maxBundles = DEFAULT_MAX_BUNDLES } = options

  if (!Number.isInteger(maxBundles) || maxBundles < 1) {
    throw new Error(`maxBundles must be a positive integer, got: ${maxBundles}`)
  }

  const batch = candidates.slice(0, maxBundles)
  const bundles = await Promise.all(batch.map((article) => downloadBundle(article)))
  return bundles
}
