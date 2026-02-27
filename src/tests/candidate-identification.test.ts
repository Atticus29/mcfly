/**
 * Integration tests for identifyCandidates()
 *
 * AC-05: pipeline accepts an injectable fetchArticles dependency; no real
 *        network calls are made from business logic under test.
 * AC-01, AC-02, AC-03, AC-04, AC-06: exercises the full slice end-to-end
 *        with controllable stubs.
 */
import { describe, it, expect, vi, beforeEach, type MockedFunction } from 'vitest'
import { identifyCandidates } from '../lib/candidate-identification.js'
import { JournalRegistry } from '../lib/registry.js'
import { KeywordScanner } from '../lib/keyword-scanner.js'
import type { Article, FetchArticlesFn } from '../lib/types.js'

// ─── helpers ────────────────────────────────────────────────────────────────

function makeArticle(id: string, titleContainsCode: boolean): Article {
  return {
    id,
    title: titleContainsCode ? `${id}: code available` : `${id}: observational study`,
    abstract: '',
    fullText: '',
    supplementaryUrl: `https://example.com/supp/${id}`,
  }
}

function makeRegistry(...ids: string[]): JournalRegistry {
  const registry = new JournalRegistry(
    ids.map((id) => ({
      id,
      displayName: id.charAt(0).toUpperCase() + id.slice(1),
      endpoints: [{ name: 'articles', url: `https://api.${id}.com/v1/articles` }],
    })),
  )
  return registry
}

// ─── tests ───────────────────────────────────────────────────────────────────

describe('identifyCandidates()', () => {
  const keywords = ['code', 'github', 'software']
  let scanner: KeywordScanner
  let fetchArticles: MockedFunction<FetchArticlesFn>

  beforeEach(() => {
    scanner = new KeywordScanner(keywords)
    fetchArticles = vi.fn()
  })

  // AC-05: fetchArticles is injected, never called by production code directly ─

  describe('dependency injection (AC-05)', () => {
    it('calls the injected fetchArticles for each registered journal', async () => {
      const registry = makeRegistry('nature', 'science')
      fetchArticles.mockResolvedValue([])

      await identifyCandidates({ registry, scanner, fetchArticles })

      expect(fetchArticles).toHaveBeenCalledTimes(2)
      expect(fetchArticles).toHaveBeenCalledWith('nature', expect.any(Number))
      expect(fetchArticles).toHaveBeenCalledWith('science', expect.any(Number))
    })

    it('does NOT call fetchArticles for journals not in the registry', async () => {
      const registry = makeRegistry('nature') // only "nature"
      fetchArticles.mockResolvedValue([])

      await identifyCandidates({ registry, scanner, fetchArticles })

      expect(fetchArticles).toHaveBeenCalledTimes(1)
      expect(fetchArticles).not.toHaveBeenCalledWith('science', expect.any(Number))
    })

    it('passes the page option through to fetchArticles (AC-05)', async () => {
      const registry = makeRegistry('nature')
      fetchArticles.mockResolvedValue([])

      await identifyCandidates({ registry, scanner, fetchArticles, page: 3 })

      expect(fetchArticles).toHaveBeenCalledWith('nature', 3)
    })

    it('defaults to page 1 when page option is omitted', async () => {
      const registry = makeRegistry('nature')
      fetchArticles.mockResolvedValue([])

      await identifyCandidates({ registry, scanner, fetchArticles })

      expect(fetchArticles).toHaveBeenCalledWith('nature', 1)
    })
  })

  // Candidate filtering via composition ──────────────────────────────────────

  describe('candidate filtering (AC-03, AC-04 via composition)', () => {
    it('returns only candidate articles for a single journal', async () => {
      const registry = makeRegistry('nature')
      fetchArticles.mockResolvedValue([
        makeArticle('art-1', true),  // candidate
        makeArticle('art-2', false), // not a candidate
        makeArticle('art-3', true),  // candidate
      ])

      const results = await identifyCandidates({ registry, scanner, fetchArticles })

      expect(results).toHaveLength(1)
      expect(results[0].journalId).toBe('nature')
      expect(results[0].candidates).toHaveLength(2)
      expect(results[0].candidates.map((a) => a.id)).toEqual(['art-1', 'art-3'])
    })

    it('returns a result entry per journal, each with their own candidates', async () => {
      const registry = makeRegistry('nature', 'science')

      fetchArticles.mockImplementation(async (journalId) => {
        if (journalId === 'nature') {
          return [makeArticle('nat-1', true), makeArticle('nat-2', false)]
        }
        if (journalId === 'science') {
          return [makeArticle('sci-1', false), makeArticle('sci-2', false)]
        }
        return []
      })

      const results = await identifyCandidates({ registry, scanner, fetchArticles })

      expect(results).toHaveLength(2)

      const natureResult = results.find((r) => r.journalId === 'nature')
      const scienceResult = results.find((r) => r.journalId === 'science')

      expect(natureResult?.candidates).toHaveLength(1)
      expect(natureResult?.candidates[0].id).toBe('nat-1')

      expect(scienceResult?.candidates).toHaveLength(0)
    })

    it('returns empty candidates array when fetchArticles returns no articles', async () => {
      const registry = makeRegistry('nature')
      fetchArticles.mockResolvedValue([])

      const results = await identifyCandidates({ registry, scanner, fetchArticles })

      expect(results).toHaveLength(1)
      expect(results[0].candidates).toEqual([])
    })
  })

  // Error handling ────────────────────────────────────────────────────────────

  describe('error handling', () => {
    it('throws when the registry contains no journals', async () => {
      const emptyRegistry = new JournalRegistry()
      fetchArticles.mockResolvedValue([])

      await expect(
        identifyCandidates({ registry: emptyRegistry, scanner, fetchArticles }),
      ).rejects.toThrow()
    })

    it('propagates errors thrown by fetchArticles', async () => {
      const registry = makeRegistry('nature')
      fetchArticles.mockRejectedValue(new Error('Network timeout'))

      await expect(
        identifyCandidates({ registry, scanner, fetchArticles }),
      ).rejects.toThrow('Network timeout')
    })
  })
})
