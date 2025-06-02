import { z } from 'astro/zod'

export function PostSchemas(): PostSchemasOutput {
  return z.object({
    id: z.string(),
    title: z.string(),
    content: z.object({
      html: z.string(),
    }),
    excerpt: z.string(),
    dates: z.string(),
    coverImage: z.string().optional(),
    slug: z.string().optional().nullable(),
    tags: z.array(z.string()).optional(),
  })
}

export function PostsSchemas(): PostsSchemasOutput {
  return z.array(PostSchemas())
}

export type PostSchemasOutput = z.output<ReturnType<typeof PostSchemas>>
export type PostsSchemasOutput = z.input<ReturnType<typeof PostsSchemas>>
