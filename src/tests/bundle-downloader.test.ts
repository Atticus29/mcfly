/**
 * Tests for downloadBundles()
 *
 * AC-01: at most maxBundles (default 10, modifiable) bundles downloaded per run.
 * AC-02: orchestrator accepts candidate articles as input.
 * AC-03: actual download is performed by an injectable downloadBundle fn.
 * AC-04: each returned bundle is linked to its source articleId + articleTitle.
 */
import { describe, it, expect, vi, beforeEach, type MockedFunction } from 'vitest'
import {
  downloadBundles,
  DEFAULT_MAX_BUNDLES,
} from '../lib/bundle-downloader.js'
import type { Article, DownloadBundleFn, SupplementaryBundle } from '../lib/types.js'

// ─── helpers ────────────────────────────────────────────────────────────────

function makeArticle(id: string): Article {
  return {
    id,
    title: `Article ${id}`,
    abstract: 'code available',
    fullText: '',
    supplementaryUrl: `https://example.com/supp/${id}`,
  }
}

function makeBundle(article: Article): SupplementaryBundle {
  return {
    articleId: article.id,
    articleTitle: article.title,
    files: [
      { name: 'analysis.py', localPath: `/tmp/${article.id}/analysis.py`, sizeBytes: 1024 },
    ],
    tempDir: `/tmp/${article.id}`,
  }
}

// ─── tests ───────────────────────────────────────────────────────────────────

describe('downloadBundles()', () => {
  let downloadBundle: MockedFunction<DownloadBundleFn>

  beforeEach(() => {
    downloadBundle = vi.fn()
  })

  // AC-03: downloadBundle is injected ─────────────────────────────────────────

  describe('dependency injection (AC-03)', () => {
    it('calls the injected downloadBundle once per candidate (up to the limit)', async () => {
      const candidates = [makeArticle('a1'), makeArticle('a2')]
      downloadBundle.mockImplementation(async (article) => makeBundle(article))

      await downloadBundles({ candidates, downloadBundle })

      expect(downloadBundle).toHaveBeenCalledTimes(2)
    })

    it('calls downloadBundle with the exact article object for each candidate', async () => {
      const art = makeArticle('a1')
      downloadBundle.mockResolvedValue(makeBundle(art))

      await downloadBundles({ candidates: [art], downloadBundle })

      expect(downloadBundle).toHaveBeenCalledWith(art)
    })

    it('propagates errors thrown by downloadBundle', async () => {
      const candidates = [makeArticle('bad')]
      downloadBundle.mockRejectedValue(new Error('Network failure'))

      await expect(
        downloadBundles({ candidates, downloadBundle }),
      ).rejects.toThrow('Network failure')
    })
  })

  // AC-01: maxBundles cap ─────────────────────────────────────────────────────

  describe('maxBundles cap (AC-01)', () => {
    it(`DEFAULT_MAX_BUNDLES is ${DEFAULT_MAX_BUNDLES}`, () => {
      expect(DEFAULT_MAX_BUNDLES).toBe(10)
    })

    it('downloads all candidates when count is below the default cap', async () => {
      const candidates = Array.from({ length: 5 }, (_, i) => makeArticle(`a${i}`))
      downloadBundle.mockImplementation(async (a) => makeBundle(a))

      const results = await downloadBundles({ candidates, downloadBundle })

      expect(results).toHaveLength(5)
      expect(downloadBundle).toHaveBeenCalledTimes(5)
    })

    it('stops at the default cap (10) when more candidates are supplied', async () => {
      const candidates = Array.from({ length: 15 }, (_, i) => makeArticle(`a${i}`))
      downloadBundle.mockImplementation(async (a) => makeBundle(a))

      const results = await downloadBundles({ candidates, downloadBundle })

      expect(results).toHaveLength(10)
      expect(downloadBundle).toHaveBeenCalledTimes(10)
    })

    it('respects a custom maxBundles value smaller than the default', async () => {
      const candidates = Array.from({ length: 8 }, (_, i) => makeArticle(`a${i}`))
      downloadBundle.mockImplementation(async (a) => makeBundle(a))

      const results = await downloadBundles({ candidates, downloadBundle, maxBundles: 3 })

      expect(results).toHaveLength(3)
      expect(downloadBundle).toHaveBeenCalledTimes(3)
    })

    it('respects a custom maxBundles value larger than the default', async () => {
      const candidates = Array.from({ length: 20 }, (_, i) => makeArticle(`a${i}`))
      downloadBundle.mockImplementation(async (a) => makeBundle(a))

      const results = await downloadBundles({ candidates, downloadBundle, maxBundles: 15 })

      expect(results).toHaveLength(15)
      expect(downloadBundle).toHaveBeenCalledTimes(15)
    })

    it('downloads all candidates when count exactly equals maxBundles', async () => {
      const candidates = Array.from({ length: 10 }, (_, i) => makeArticle(`a${i}`))
      downloadBundle.mockImplementation(async (a) => makeBundle(a))

      const results = await downloadBundles({ candidates, downloadBundle, maxBundles: 10 })

      expect(results).toHaveLength(10)
    })

    it('returns empty array when candidates list is empty', async () => {
      const results = await downloadBundles({ candidates: [], downloadBundle })

      expect(results).toEqual([])
      expect(downloadBundle).not.toHaveBeenCalled()
    })

    it('throws when maxBundles is zero', async () => {
      await expect(
        downloadBundles({ candidates: [makeArticle('a1')], downloadBundle, maxBundles: 0 }),
      ).rejects.toThrow()
    })

    it('throws when maxBundles is negative', async () => {
      await expect(
        downloadBundles({ candidates: [makeArticle('a1')], downloadBundle, maxBundles: -1 }),
      ).rejects.toThrow()
    })
  })

  // AC-02: accepts candidate articles as input ────────────────────────────────

  describe('input (AC-02)', () => {
    it('processes candidates in order (first N candidates are downloaded)', async () => {
      const candidates = Array.from({ length: 5 }, (_, i) => makeArticle(`a${i}`))
      downloadBundle.mockImplementation(async (a) => makeBundle(a))

      await downloadBundles({ candidates, downloadBundle, maxBundles: 3 })

      const calledIds = downloadBundle.mock.calls.map((c) => c[0].id)
      expect(calledIds).toEqual(['a0', 'a1', 'a2'])
    })
  })

  // AC-04: bundles are linked to their source article ─────────────────────────

  describe('returned bundles (AC-04)', () => {
    it('each bundle has the correct articleId matching the source article', async () => {
      const candidates = [makeArticle('nat-42'), makeArticle('sci-7')]
      downloadBundle.mockImplementation(async (a) => makeBundle(a))

      const results = await downloadBundles({ candidates, downloadBundle })

      expect(results.map((b) => b.articleId)).toEqual(['nat-42', 'sci-7'])
    })

    it('each bundle has the correct articleTitle matching the source article', async () => {
      const art = makeArticle('nat-42')
      downloadBundle.mockResolvedValue(makeBundle(art))

      const [bundle] = await downloadBundles({ candidates: [art], downloadBundle })

      expect(bundle.articleTitle).toBe(art.title)
    })

    it('passes through all files returned by downloadBundle unchanged', async () => {
      const art = makeArticle('x1')
      const expectedBundle = makeBundle(art)
      downloadBundle.mockResolvedValue(expectedBundle)

      const [bundle] = await downloadBundles({ candidates: [art], downloadBundle })

      expect(bundle.files).toEqual(expectedBundle.files)
    })
  })
})
