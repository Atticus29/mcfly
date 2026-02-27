/**
 * Tests for KeywordScanner
 *
 * AC-02: keywords are stored in a modular, replaceable list.
 * AC-03: an article is a candidate if any keyword appears (case-insensitive)
 *        in title, abstract, or fullText.
 * AC-04: filterCandidates() returns ONLY matching articles.
 * AC-06: keyword list can be independently replaced at runtime.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { KeywordScanner } from '../lib/keyword-scanner.js'
import type { Article } from '../lib/types.js'

// ─── helpers ────────────────────────────────────────────────────────────────

function makeArticle(overrides: Partial<Article> = {}): Article {
  return {
    id: 'art-1',
    title: 'A Study of Things',
    abstract: 'This paper examines various things.',
    fullText: 'The detailed examination follows.',
    supplementaryUrl: 'https://example.com/supp/art-1',
    ...overrides,
  }
}

// ─── tests ───────────────────────────────────────────────────────────────────

describe('KeywordScanner', () => {
  const defaultKeywords = ['code', 'github', 'software', 'script', 'repository']

  let scanner: KeywordScanner

  beforeEach(() => {
    scanner = new KeywordScanner(defaultKeywords)
  })

  // AC-02: keywords are injected (not hardcoded) ─────────────────────────────

  describe('constructor / injection (AC-02)', () => {
    it('uses the keyword list supplied at construction, not a hardcoded set', () => {
      const custom = new KeywordScanner(['CRISPR', 'clustered'])
      const article = makeArticle({ title: 'An Assessment of CRISPR Applications' })
      expect(custom.isCandidate(article)).toBe(true)
    })

    it('does NOT match a keyword that was NOT supplied, even if that keyword appears in the article', () => {
      const custom = new KeywordScanner(['CRISPR'])
      const article = makeArticle({ title: 'Code available on GitHub' })
      // "code" and "github" are not in custom scanner's list
      expect(custom.isCandidate(article)).toBe(false)
    })
  })

  // AC-03: case-insensitive, multi-field matching ────────────────────────────

  describe('isCandidate() – field coverage (AC-03)', () => {
    it('matches a keyword found in the title', () => {
      const article = makeArticle({ title: 'Code for Reproducible Research' })
      expect(scanner.isCandidate(article)).toBe(true)
    })

    it('matches a keyword found in the abstract', () => {
      const article = makeArticle({
        abstract: 'All analysis code is available on request.',
      })
      expect(scanner.isCandidate(article)).toBe(true)
    })

    it('matches a keyword found in the fullText', () => {
      const article = makeArticle({
        fullText: 'Scripts were written in Python and are available at our GitHub repository.',
      })
      expect(scanner.isCandidate(article)).toBe(true)
    })

    it('returns false when no keyword appears in any field', () => {
      const article = makeArticle({
        title: 'A Meta-Analysis of Ice Core Data',
        abstract: 'Ice cores were collected from Antarctica.',
        fullText: 'Detailed methods for sample collection are described.',
      })
      expect(scanner.isCandidate(article)).toBe(false)
    })
  })

  describe('isCandidate() – case-insensitivity (AC-03)', () => {
    it('matches keyword in ALL CAPS', () => {
      const article = makeArticle({ title: 'Analysis CODE Available' })
      expect(scanner.isCandidate(article)).toBe(true)
    })

    it('matches keyword in Title Case', () => {
      const article = makeArticle({ abstract: 'See GitHub for details.' })
      expect(scanner.isCandidate(article)).toBe(true)
    })

    it('matches keyword in mixed case scattered through text', () => {
      const article = makeArticle({ fullText: 'The SoFtWaRe was validated.' })
      expect(scanner.isCandidate(article)).toBe(true)
    })

    it('matches when keyword supplied to scanner is uppercase but text is lower', () => {
      const upperScanner = new KeywordScanner(['CODE', 'GITHUB'])
      const article = makeArticle({ title: 'source code is available' })
      expect(upperScanner.isCandidate(article)).toBe(true)
    })
  })

  describe('isCandidate() – edge cases', () => {
    it('returns false for an article with all empty string fields', () => {
      const article = makeArticle({ title: '', abstract: '', fullText: '' })
      expect(scanner.isCandidate(article)).toBe(false)
    })

    it('returns false when the scanner is constructed with an empty keyword list', () => {
      const emptyScanner = new KeywordScanner([])
      const article = makeArticle({ title: 'Code and GitHub repository' })
      expect(emptyScanner.isCandidate(article)).toBe(false)
    })

    it('matches a keyword that appears only as part of a longer word (substring match)', () => {
      // "code" is a substring of "codebase"
      const article = makeArticle({ fullText: 'The codebase was refactored.' })
      expect(scanner.isCandidate(article)).toBe(true)
    })
  })

  // AC-04: filterCandidates returns ONLY matching articles ───────────────────

  describe('filterCandidates() (AC-04)', () => {
    const matching1 = makeArticle({ id: 'art-match-1', title: 'Code for Proteomics Analysis' })
    const matching2 = makeArticle({
      id: 'art-match-2',
      abstract: 'Scripts and repository are attached as supplementary material.',
    })
    const nonMatching1 = makeArticle({
      id: 'art-none-1',
      title: 'Ice core isotope analysis',
      abstract: 'Stable isotopes measured over 10,000 years.',
      fullText: 'Methods described in detail.',
    })
    const nonMatching2 = makeArticle({
      id: 'art-none-2',
      title: 'Survey of marine biodiversity',
      abstract: 'Field samples collected from three ocean basins.',
      fullText: 'No supplementary files were provided.',
    })

    it('returns only articles that match at least one keyword (AC-04)', () => {
      const result = scanner.filterCandidates([
        matching1,
        nonMatching1,
        matching2,
        nonMatching2,
      ])
      expect(result).toHaveLength(2)
      expect(result.map((a) => a.id)).toContain('art-match-1')
      expect(result.map((a) => a.id)).toContain('art-match-2')
    })

    it('returns empty array when no articles match (AC-04)', () => {
      const result = scanner.filterCandidates([nonMatching1, nonMatching2])
      expect(result).toEqual([])
    })

    it('returns all articles when all match (AC-04)', () => {
      const result = scanner.filterCandidates([matching1, matching2])
      expect(result).toHaveLength(2)
    })

    it('returns empty array for empty input (AC-04)', () => {
      expect(scanner.filterCandidates([])).toEqual([])
    })
  })

  // AC-06: keyword list can be replaced at runtime ───────────────────────────

  describe('setKeywords() – runtime replacement (AC-06)', () => {
    it('replaces the keyword list so subsequent calls use the new list', () => {
      const article = makeArticle({ title: 'Microbiome sequencing study' })

      // Before replacement: default keywords don't match
      expect(scanner.isCandidate(article)).toBe(false)

      // Replace keywords
      scanner.setKeywords(['microbiome', 'sequencing'])

      // After replacement: new keywords match
      expect(scanner.isCandidate(article)).toBe(true)
    })

    it('removes old keywords when list is replaced', () => {
      const article = makeArticle({ title: 'Source code on GitHub' })

      expect(scanner.isCandidate(article)).toBe(true) // "code" matches

      scanner.setKeywords(['CRISPR']) // "code" no longer in list

      expect(scanner.isCandidate(article)).toBe(false)
    })
  })
})
