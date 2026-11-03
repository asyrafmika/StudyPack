import { getCollection, type CollectionEntry } from 'astro:content';

export type Note = CollectionEntry<'notes'>;

/** Prefix an internal path with the site base ("/StudyPack/"). */
export function url(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const clean = path.replace(/^\//, '');
  return `${base}/${clean}`;
}

/** Course id is the folder name: "cst435/week-01" -> "cst435" */
export const courseIdOf = (note: Note) => note.id.split('/')[0];

/**
 * URL slug is the file name: "cst435/week-03-processor" -> "week-03-processor".
 * A week can have several pages (week-03-a.mdx, week-03-b.mdx …).
 */
export const noteSlug = (note: Note) => note.id.split('/')[1];
export const noteUrl = (note: Note) => url(`${courseIdOf(note)}/${noteSlug(note)}/`);

/** Progress key for the "done" checkbox — the note id is unique and stable. */
export const progressId = (note: Note) => note.id;

/** "W3" or "W3 · Part 2" */
export const noteLabel = (note: Note) => `W${note.data.week}${note.data.part ? ` · ${note.data.part}` : ''}`;

const byWeekThenOrder = (a: Note, b: Note) => a.data.week - b.data.week || a.data.order - b.data.order;

/** All notes for one course, sorted by week, then by order within the week. */
export async function notesFor(courseId: string) {
  const all = await getCollection('notes', (n) => courseIdOf(n) === courseId);
  return all.sort(byWeekThenOrder);
}

export async function sortedCourses() {
  const all = await getCollection('courses');
  return all.sort((a, b) => a.data.order - b.data.order || a.data.code.localeCompare(b.data.code));
}
