import { getCollection, type CollectionEntry } from 'astro:content';

/** Prefix an internal path with the site base ("/StudyPack/"). */
export function url(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const clean = path.replace(/^\//, '');
  return `${base}/${clean}`;
}

export const weekSlug = (n: number) => `week-${String(n).padStart(2, '0')}`;
export const weekUrl = (courseId: string, n: number) => url(`${courseId}/${weekSlug(n)}/`);

/** Course id is the folder name: "cse242/week-01" -> "cse242" */
export const courseIdOf = (note: CollectionEntry<'notes'>) => note.id.split('/')[0];

/** All notes for one course, sorted by week. */
export async function notesFor(courseId: string) {
  const all = await getCollection('notes', (n) => courseIdOf(n) === courseId);
  return all.sort((a, b) => a.data.week - b.data.week);
}

export async function sortedCourses() {
  const all = await getCollection('courses');
  return all.sort((a, b) => a.data.order - b.data.order || a.data.code.localeCompare(b.data.code));
}
