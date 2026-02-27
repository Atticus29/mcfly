/**
 * JournalRegistry – modular store for journal configurations.
 *
 * Satisfies AC-01 and AC-06: journals can be added, removed, or swapped
 * without touching scanning or pipeline logic.
 */
import type { Journal } from './types.js'

export class JournalRegistry {
  private journals: Map<string, Journal>

  constructor(initial: Journal[] = []) {
    this.journals = new Map(initial.map((j) => [j.id, j]))
  }

  /** Register a journal (or replace an existing entry by id). */
  register(journal: Journal): void {
    this.journals.set(journal.id, journal)
  }

  /** Remove a journal by id. Returns true if it existed. */
  remove(id: string): boolean {
    return this.journals.delete(id)
  }

  /** Retrieve a journal by id. Returns undefined if not registered. */
  get(id: string): Journal | undefined {
    return this.journals.get(id)
  }

  /** Return all registered journals in insertion order. */
  list(): Journal[] {
    return Array.from(this.journals.values())
  }

  /** Return true if at least one journal is registered. */
  hasAny(): boolean {
    return this.journals.size > 0
  }
}
