import type { ZodSchema } from 'astro/zod'
import { z } from 'astro/zod'

export function ProjectSchemas(): ZodSchema {
  return z.object({
    id: z.string(),
    title: z.string(),
    content: z.object({
      html: z.string(),
    }),
    excerpt: z.string(),
    isCompleted: z.boolean().nullable(),
    dates: z.string(),
    coverImage: z.string().optional(),
    slug: z.string().optional().nullable(),
    tags: z.array(z.string()).optional(),
  })
}

export function ProjectsSchemas(): ZodSchema {
  return z.array(ProjectSchemas())
}

export type ProjectSchemaOutput = z.output<ReturnType<typeof ProjectSchemas>>
export type ProjectsSchemaOutput = z.output<ReturnType<typeof ProjectsSchemas>>
