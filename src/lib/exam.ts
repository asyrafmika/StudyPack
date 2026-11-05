import { getEntry } from 'astro:content';
import { Marked } from 'marked';
import type { Note } from './url';

const md = new Marked({ gfm: true });
const inline = (x: string) => md.parseInline(x) as string;

export interface Story {
  problem: string;
  fix: string;
  next: string;
}
export interface Term {
  term: string;
  def: string; // inline HTML
}
export interface ExamSheet {
  must: string[];
  formulas: string[];
  traps: string[];
  likely: string[];
  tricks: string[];
  story?: Story;
  terms: Term[];
}

/** A note's study aids (exam sheet, story step, glossary) with inline markdown rendered, or null. */
export async function examFor(note: Note): Promise<ExamSheet | null> {
  const entry = await getEntry('exam', note.id);
  if (!entry) return null;
  const d = entry.data;
  const r = (xs: string[]) => xs.map(inline);
  return {
    must: r(d.must),
    formulas: r(d.formulas),
    traps: r(d.traps),
    likely: r(d.likely),
    tricks: r(d.tricks),
    story: d.story,
    terms: d.terms.map((t) => ({ term: t.term, def: inline(t.def) })),
  };
}

/** Rough reading time from MDX source (code/JSX stripped), at ~220 words per minute. */
export function readingMinutes(body: string | undefined) {
  if (!body) return 1;
  const text = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<QAList>[\s\S]*?<\/QAList>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^import .*$/gm, ' ');
  return Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 220));
}
