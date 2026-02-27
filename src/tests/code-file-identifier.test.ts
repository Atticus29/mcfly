/**
 * Tests for CodeFileIdentifier
 *
 * AC-05: identifies code files within a bundle by extension.
 * AC-06: the set of recognised extensions is injectable/modular.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  CodeFileIdentifier,
  DEFAULT_CODE_EXTENSIONS,
} from '../lib/code-file-identifier.js'
import type { SupplementaryBundle, SupplementaryFile } from '../lib/types.js'

// ─── helpers ────────────────────────────────────────────────────────────────

function makeFile(name: string): SupplementaryFile {
  return {
    name,
    localPath: `/tmp/bundle/${name}`,
    sizeBytes: 512,
  }
}

function makeBundle(files: SupplementaryFile[]): SupplementaryBundle {
  return {
    articleId: 'art-1',
    articleTitle: 'Test Article',
    files,
    tempDir: '/tmp/bundle',
  }
}

// ─── tests ───────────────────────────────────────────────────────────────────

describe('CodeFileIdentifier', () => {
  // AC-06: DEFAULT_CODE_EXTENSIONS covers key scientific languages ─────────────

  describe('DEFAULT_CODE_EXTENSIONS (AC-06)', () => {
    it('includes common scientific computing extensions', () => {
      const exts = DEFAULT_CODE_EXTENSIONS as string[]
      expect(exts).toContain('.py')
      expect(exts).toContain('.r')
      expect(exts).toContain('.m')
      expect(exts).toContain('.jl')
      expect(exts).toContain('.ipynb')
    })

    it('includes shell and SQL extensions', () => {
      const exts = DEFAULT_CODE_EXTENSIONS as string[]
      expect(exts).toContain('.sh')
      expect(exts).toContain('.sql')
    })

    it('all extensions start with a dot', () => {
      for (const ext of DEFAULT_CODE_EXTENSIONS) {
        expect(ext.startsWith('.')).toBe(true)
      }
    })
  })

  // AC-05: isCodeFile() ────────────────────────────────────────────────────────

  describe('isCodeFile() (AC-05)', () => {
    let identifier: CodeFileIdentifier

    beforeEach(() => {
      identifier = new CodeFileIdentifier(['.py', '.r', '.m', '.js', '.sh'])
    })

    it('returns true for a file with a recognised extension', () => {
      expect(identifier.isCodeFile('analysis.py')).toBe(true)
    })

    it('returns true for a file with a recognised extension in uppercase', () => {
      expect(identifier.isCodeFile('ANALYSIS.PY')).toBe(true)
    })

    it('returns true for a file with a recognised extension in mixed case', () => {
      expect(identifier.isCodeFile('RunMe.Py')).toBe(true)
    })

    it('returns false for a data file', () => {
      expect(identifier.isCodeFile('data.csv')).toBe(false)
    })

    it('returns false for a text/readme file', () => {
      expect(identifier.isCodeFile('README.txt')).toBe(false)
    })

    it('returns false for an image', () => {
      expect(identifier.isCodeFile('figure1.png')).toBe(false)
    })

    it('returns false for a file with no extension', () => {
      expect(identifier.isCodeFile('Makefile')).toBe(false)
    })

    it('returns false for a file whose name ends in a dot', () => {
      expect(identifier.isCodeFile('oddfile.')).toBe(false)
    })

    it('handles dotfiles correctly (hidden files with no real extension)', () => {
      // ".gitignore" – extension is "" so should not match ".py" etc.
      expect(identifier.isCodeFile('.gitignore')).toBe(false)
    })
  })

  // AC-05: identifyCodeFiles() ─────────────────────────────────────────────────

  describe('identifyCodeFiles() (AC-05)', () => {
    let identifier: CodeFileIdentifier

    beforeEach(() => {
      identifier = new CodeFileIdentifier(['.py', '.r', '.ipynb'])
    })

    it('returns only files with recognised extensions', () => {
      const bundle = makeBundle([
        makeFile('analysis.py'),
        makeFile('data.csv'),
        makeFile('notebook.ipynb'),
        makeFile('figure.png'),
        makeFile('model.r'),
      ])

      const result = identifier.identifyCodeFiles(bundle)

      expect(result.map((f) => f.name)).toEqual(['analysis.py', 'notebook.ipynb', 'model.r'])
    })

    it('returns empty array when no files are code files', () => {
      const bundle = makeBundle([
        makeFile('data.csv'),
        makeFile('figure.png'),
        makeFile('readme.txt'),
      ])

      expect(identifier.identifyCodeFiles(bundle)).toEqual([])
    })

    it('returns all files when all are code files', () => {
      const bundle = makeBundle([
        makeFile('script.py'),
        makeFile('notebook.ipynb'),
        makeFile('stats.r'),
      ])

      const result = identifier.identifyCodeFiles(bundle)
      expect(result).toHaveLength(3)
    })

    it('returns empty array for a bundle with no files', () => {
      const bundle = makeBundle([])
      expect(identifier.identifyCodeFiles(bundle)).toEqual([])
    })

    it('does not mutate the original bundle files array', () => {
      const files = [makeFile('script.py'), makeFile('data.csv')]
      const bundle = makeBundle(files)

      identifier.identifyCodeFiles(bundle)

      expect(bundle.files).toHaveLength(2)
    })
  })

  // AC-06: setExtensions() – runtime replacement ───────────────────────────────

  describe('setExtensions() (AC-06)', () => {
    it('replaces the extension set so subsequent calls use the new set', () => {
      const identifier = new CodeFileIdentifier(['.py'])

      expect(identifier.isCodeFile('model.r')).toBe(false)

      identifier.setExtensions(['.r', '.rmd'])

      expect(identifier.isCodeFile('model.r')).toBe(true)
      expect(identifier.isCodeFile('script.py')).toBe(false)
    })

    it('constructor with custom extensions overrides the defaults (AC-06)', () => {
      const custom = new CodeFileIdentifier(['.xyz'])
      expect(custom.isCodeFile('file.xyz')).toBe(true)
      expect(custom.isCodeFile('file.py')).toBe(false)
    })

    it('constructor with default extensions recognises .py', () => {
      const def = new CodeFileIdentifier()
      expect(def.isCodeFile('analysis.py')).toBe(true)
    })
  })
})
