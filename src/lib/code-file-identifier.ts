/**
 * CodeFileIdentifier – filters files in a bundle to those that appear to be
 * source code, based on file extension.
 *
 * AC-05: inspects files in a bundle and returns only code files.
 * AC-06: the set of recognised extensions is injectable/modular.
 */
import type { SupplementaryBundle, SupplementaryFile } from './types.js'

/** Well-known source-code extensions, used as the default if none are supplied. */
export const DEFAULT_CODE_EXTENSIONS: ReadonlyArray<string> = [
  '.py',   // Python
  '.r',    // R
  '.rmd',  // R Markdown
  '.m',    // MATLAB / Octave
  '.jl',   // Julia
  '.js',   // JavaScript
  '.ts',   // TypeScript
  '.java', // Java
  '.c',    // C
  '.cpp',  // C++
  '.cs',   // C#
  '.go',   // Go
  '.rb',   // Ruby
  '.sh',   // Shell
  '.pl',   // Perl
  '.scala',// Scala
  '.kt',   // Kotlin
  '.rs',   // Rust
  '.swift',// Swift
  '.f90',  // Fortran 90
  '.f95',  // Fortran 95
  '.lua',  // Lua
  '.sql',  // SQL
  '.ipynb',// Jupyter notebooks
]

export class CodeFileIdentifier {
  private extensions: Set<string>

  /**
   * @param extensions - file extensions to treat as code, including the leading
   *   dot (e.g. ".py"). Injected so the list can be swapped or extended
   *   without modifying this class (AC-06).
   *   Defaults to DEFAULT_CODE_EXTENSIONS.
   */
  constructor(extensions: ReadonlyArray<string> = DEFAULT_CODE_EXTENSIONS) {
    this.extensions = new Set(extensions.map((e) => e.toLowerCase()))
  }

  /**
   * Replace the recognised extension set at runtime (AC-06).
   */
  setExtensions(extensions: ReadonlyArray<string>): void {
    this.extensions = new Set(extensions.map((e) => e.toLowerCase()))
  }

  /**
   * Returns true if the given filename has a recognised code extension (AC-05).
   * Comparison is case-insensitive.
   */
  isCodeFile(filename: string): boolean {
    const lastDot = filename.lastIndexOf('.')
    // No dot, dot at position 0 (dotfile), or dot at the very end → no real extension
    if (lastDot <= 0 || lastDot === filename.length - 1) return false
    const ext = filename.slice(lastDot).toLowerCase()
    return this.extensions.has(ext)
  }

  /**
   * Filters the files in a bundle, returning only those with recognised
   * code extensions (AC-05).
   */
  identifyCodeFiles(bundle: SupplementaryBundle): SupplementaryFile[] {
    return bundle.files.filter((f) => this.isCodeFile(f.name))
  }
}
