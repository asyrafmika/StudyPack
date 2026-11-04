import { getEntry } from 'astro:content';
import { Marked } from 'marked';
import type { Note } from './url';

const md = new Marked({ gfm: true });
export interface ExamSheet {
  must: string[];
  formulas: string[];
  traps: string[];
  likely: string[];
  tricks: string[];
}

/** The note's exam sheet with every item rendered to inline HTML, or null if none exists. */
export async function examFor(note: Note): Promise<ExamSheet | null> {
  const entry = await getEntry('exam', note.id);
  if (!entry) return null;
  const r = (xs: string[]) => xs.map((x) => md.parseInline(x) as string);
  const d = entry.data;
  return { must: r(d.must), formulas: r(d.formulas), traps: r(d.traps), likely: r(d.likely), tricks: r(d.tricks) };
}
