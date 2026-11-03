import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * courses — one entry per course, all in src/content/courses.json.
 * Add a course = add one object to that file + a folder in src/content/notes/.
 */
const courses = defineCollection({
  loader: file('src/content/courses.json'),
  schema: z.object({
    code: z.string(), // e.g. "CSE242"
    title: z.string(),
    description: z.string().optional(),
    totalWeeks: z.number().int().positive().default(14),
    color: z.string().default('#4f7cff'), // accent colour for the course card
    order: z.number().default(0),
  }),
});

/**
 * notes — one MDX file per week: src/content/notes/<course-id>/week-NN.mdx
 * The id becomes "<course-id>/week-NN", which we split to find the course.
 */
const notes = defineCollection({
  loader: glob({ pattern: '*/week-*.mdx', base: './src/content/notes' }),
  schema: z.object({
    week: z.number().int().positive(),
    title: z.string(),
    summary: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { courses, notes };
