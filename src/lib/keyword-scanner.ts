/**
 * KeywordScanner – determines whether an article is a code candidate.
 *
 * Satisfies AC-02, AC-03, AC-04, AC-06: keywords are injected (not hardcoded),
 * matching is case-insensitive across title/abstract/fullText, and only
 * candidates are returned.
 */
import type { Article } from './types.js'

export class KeywordScanner {
  private keywords: string[]

  /**
   * @param keywords - list of terms to search for; injected so they can be
   *   swapped or extended without changing this class (AC-02, AC-06).
   */
  constructor(keywords: string[]) {
    this.keywords = keywords
  }

  /**
   * Replace the keyword list at runtime (AC-06).
   * Allows callers to swap the full list without constructing a new scanner.
   */
  setKeywords(keywords: string[]): void {
    this.keywords = keywords
  }

  /**
   * Returns true if the article's title, abstract, or fullText contains
   * at least one keyword (case-insensitive match) (AC-03).
   */
  isCandidate(article: Article): boolean {
    if (this.keywords.length === 0) return false
    const haystack = `${article.title} ${article.abstract} ${article.fullText}`.toLowerCase()
    return this.keywords.some((kw) => haystack.includes(kw.toLowerCase()))
  }

  /**
   * Filters an array of articles, returning only those that match
   * at least one keyword (AC-04).
   */
  filterCandidates(articles: Article[]): Article[] {
    return articles.filter((a) => this.isCandidate(a))
  }
}
