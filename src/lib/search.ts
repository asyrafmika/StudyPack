import { getCollection } from 'astro:content';
import { courseIdOf, noteLabel, noteUrl } from './url';

export interface SearchEntry {
  t: string; // title
  c: string; // course code
  l: string; // label, e.g. "W3 · Part 2"
  u: string; // url
  s: string; // summary
  k: string; // keywords (tags)
}

/** Built once at build time and embedded in every page for the ⌘K search. */
export async function searchIndex(): Promise<SearchEntry[]> {
  const [notes, courses] = await Promise.all([getCollection('notes'), getCollection('courses')]);
  const code = new Map(courses.map((c) => [c.id, c.data.code]));
  return notes
    .sort((a, b) => courseIdOf(a).localeCompare(courseIdOf(b)) || a.data.week - b.data.week || a.data.order - b.data.order)
    .map((n) => ({
      t: n.data.title,
      c: code.get(courseIdOf(n)) ?? courseIdOf(n).toUpperCase(),
      l: noteLabel(n),
      u: noteUrl(n),
      s: n.data.summary ?? '',
      // tags + section headings, so searching a sub-topic (e.g. "barrier") finds the page
      k: [n.data.tags.join(' '), ...(n.body?.match(/^#{2,3} .+$/gm) ?? []).map((h) => h.replace(/^#+ /, ''))].join(' '),
    }));
}

/** Content stats for a set of notes, counted from the MDX source. */
export function contentStats(bodies: (string | undefined)[]) {
  let questions = 0;
  let visuals = 0;
  for (const b of bodies) {
    if (!b) continue;
    questions += (b.match(/<QA\s/g) ?? []).length;
    visuals += (b.match(/```mermaid/g) ?? []).length + (b.match(/<Figure\s/g) ?? []).length;
  }
  return { questions, visuals };
}
