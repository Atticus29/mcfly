/**
 * identifyCandidates – integration point for the first pipeline slice.
 *
 * Wires together JournalRegistry + KeywordScanner + an injected fetchArticles
 * function, so network I/O stays fully decoupled from business logic (AC-05).
 */
import type { Article, FetchArticlesFn } from './types.js'
import { JournalRegistry } from './registry.js'
import { KeywordScanner } from './keyword-scanner.js'

export interface IdentifyCandidatesOptions {
  /** Registry of journals to scan */
  registry: JournalRegistry
  /** Scanner to use for keyword matching */
  scanner: KeywordScanner
  /** Injectable: fetches one page of articles for a given journal id */
  fetchArticles: FetchArticlesFn
  /**
   * Which page to fetch (1-based).
   * In later slices this will be driven by pagination/resumption logic.
   */
  page?: number
}

/** Result for one journal */
export interface JournalCandidateResult {
  journalId: string
  candidates: Article[]
}

/**
 * For every journal in the registry, fetch one page of articles using
 * the injected fetchArticles function, then return only the candidate articles.
 *
 * Throws if the registry contains no journals.
 */
export async function identifyCandidates(
  options: IdentifyCandidatesOptions,
): Promise<JournalCandidateResult[]> {
  const { registry, scanner, fetchArticles, page = 1 } = options

  if (!registry.hasAny()) {
    throw new Error('JournalRegistry is empty — register at least one journal before scanning.')
  }

  const journals = registry.list()

  const results = await Promise.all(
    journals.map(async (journal): Promise<JournalCandidateResult> => {
      const articles = await fetchArticles(journal.id, page)
      return {
        journalId: journal.id,
        candidates: scanner.filterCandidates(articles),
      }
    }),
  )

  return results
}
