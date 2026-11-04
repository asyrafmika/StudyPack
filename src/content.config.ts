import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * courses — one entry per course, all in src/content/courses.json.
 * Add a course = add one object to that file + a folder in src/content/notes/.
 * Everything except code/title is optional, so a course can start minimal.
 */
const courses = defineCollection({
  loader: file('src/content/courses.json'),
  schema: z.object({
    code: z.string(), // e.g. "CST435"
    title: z.string(),
    description: z.string().optional(),
    lecturer: z.string().optional(),
    semester: z.string().optional(),
    totalWeeks: z.number().int().positive().default(14),
    color: z.string().default('#4f7cff'), // accent colour for the course
    order: z.number().default(0),
    outcomes: z.array(z.string()).default([]),
    topics: z.array(z.string()).default([]), // course syllabus topics, if the course is organised by topic
    assessments: z
      .array(z.object({ name: z.string(), weight: z.string(), detail: z.string().optional() }))
      .default([]),
    /** Planned topic per week, from the course planner. Shown even before notes exist. */
    schedule: z
      .array(
        z.object({
          week: z.number().int().positive(),
          topic: z.string(),
          isBreak: z.boolean().default(false),
          events: z.array(z.string()).default([]), // e.g. "Assignment 1 given"
        }),
      )
      .default([]),
  }),
});

/**
 * notes — one MDX file per page: src/content/notes/<course-id>/week-NN[-name].mdx
 * The id becomes "<course-id>/<file-name>"; the file name is also the URL slug.
 * A week can have several pages — use `order` and `part` to sequence them.
 */
const notes = defineCollection({
  loader: glob({ pattern: '*/week-*.mdx', base: './src/content/notes' }),
  schema: z.object({
    week: z.number().int().positive(),
    /** Several pages in one week? Give each an order (1, 2 …) and a short part label. */
    order: z.number().default(1),
    part: z.string().optional(), // e.g. "Part 2"
    title: z.string(),
    summary: z.string().optional(),
    tags: z.array(z.string()).default([]),
    /** Which assessments this week is examined in, e.g. ["Test 1", "Final"] */
    examinedIn: z.array(z.string()).default([]),
  }),
});

/**
 * exam — last-minute revision sheet per note page: src/content/exam/<course-id>/<note-file>.json
 * The id matches the note id (e.g. "cst435/week-04"). Items are inline markdown.
 */
const exam = defineCollection({
  loader: glob({ pattern: '*/*.json', base: './src/content/exam' }),
  schema: z.object({
    must: z.array(z.string()).default([]), // must-know points
    formulas: z.array(z.string()).default([]), // formulas, numbers, sequences
    traps: z.array(z.string()).default([]), // common mistakes
    likely: z.array(z.string()).default([]), // likely exam questions
    tricks: z.array(z.string()).default([]), // memory tricks
  }),
});

export const collections = { courses, notes, exam };
