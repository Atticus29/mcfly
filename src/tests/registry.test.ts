/**
 * Tests for JournalRegistry
 *
 * AC-01: journals are stored in a modular registry (add / remove / swap).
 * AC-06: journal configs can be independently replaced/extended without
 *        touching scanner or pipeline logic.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { JournalRegistry } from '../lib/registry.js'
import type { Journal } from '../lib/types.js'

// ─── fixtures ───────────────────────────────────────────────────────────────

const nature: Journal = {
  id: 'nature',
  displayName: 'Nature',
  endpoints: [
    { name: 'articles', url: 'https://api.nature.com/v1/articles' },
    { name: 'supplements', url: 'https://api.nature.com/v1/supplements' },
  ],
}

const science: Journal = {
  id: 'science',
  displayName: 'Science',
  endpoints: [{ name: 'articles', url: 'https://api.sciencemag.org/v1/articles' }],
}

const cell: Journal = {
  id: 'cell',
  displayName: 'Cell',
  endpoints: [{ name: 'articles', url: 'https://api.cell.com/v1/articles' }],
}

// ─── tests ───────────────────────────────────────────────────────────────────

describe('JournalRegistry', () => {
  let registry: JournalRegistry

  beforeEach(() => {
    registry = new JournalRegistry()
  })

  // AC-01 ────────────────────────────────────────────────────────────────────

  describe('register()', () => {
    it('adds a journal that can then be retrieved by id (AC-01)', () => {
      registry.register(nature)
      expect(registry.get('nature')).toEqual(nature)
    })

    it('accepts multiple journals independently (AC-01)', () => {
      registry.register(nature)
      registry.register(science)
      expect(registry.get('nature')).toEqual(nature)
      expect(registry.get('science')).toEqual(science)
    })

    it('replaces an existing journal when re-registered with the same id (AC-01, swap)', () => {
      registry.register(nature)

      const updatedNature: Journal = {
        ...nature,
        displayName: 'Nature (updated)',
        endpoints: [{ name: 'articles', url: 'https://new-api.nature.com/v2/articles' }],
      }
      registry.register(updatedNature)

      expect(registry.get('nature')).toEqual(updatedNature)
      expect(registry.list()).toHaveLength(1)
    })
  })

  describe('remove()', () => {
    it('removes a registered journal and returns true (AC-01)', () => {
      registry.register(nature)
      const removed = registry.remove('nature')
      expect(removed).toBe(true)
      expect(registry.get('nature')).toBeUndefined()
    })

    it('returns false when trying to remove an id that was never registered (AC-01)', () => {
      expect(registry.remove('nonexistent')).toBe(false)
    })

    it('removing one journal does not affect others (AC-01)', () => {
      registry.register(nature)
      registry.register(science)
      registry.remove('nature')
      expect(registry.get('science')).toEqual(science)
    })
  })

  describe('list()', () => {
    it('returns empty array when no journals are registered', () => {
      expect(registry.list()).toEqual([])
    })

    it('returns all registered journals (AC-01)', () => {
      registry.register(nature)
      registry.register(science)
      registry.register(cell)
      expect(registry.list()).toHaveLength(3)
      const ids = registry.list().map((j) => j.id)
      expect(ids).toContain('nature')
      expect(ids).toContain('science')
      expect(ids).toContain('cell')
    })
  })

  describe('hasAny()', () => {
    it('returns false when empty', () => {
      expect(registry.hasAny()).toBe(false)
    })

    it('returns true once at least one journal is registered (AC-01)', () => {
      registry.register(nature)
      expect(registry.hasAny()).toBe(true)
    })

    it('returns false again after all journals are removed (AC-01)', () => {
      registry.register(nature)
      registry.remove('nature')
      expect(registry.hasAny()).toBe(false)
    })
  })

  // AC-06 ────────────────────────────────────────────────────────────────────

  describe('constructor – initial seed (AC-06)', () => {
    it('accepts a pre-populated array so the registry can be bootstrapped externally', () => {
      const seeded = new JournalRegistry([nature, science])
      expect(seeded.list()).toHaveLength(2)
      expect(seeded.get('nature')).toEqual(nature)
    })
  })

  describe('extensibility (AC-06)', () => {
    it('allows a new journal to be added without modifying existing entries', () => {
      registry.register(nature)
      registry.register(science)
      registry.register(cell) // extension: new entry added later
      expect(registry.list()).toHaveLength(3)
      // Previously registered entries are unaffected
      expect(registry.get('nature')).toEqual(nature)
    })
  })
})
