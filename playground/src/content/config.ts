import { defineCollection } from 'astro:content'
import { pagesSchema } from 'astro-antfu.me/schema'

export const collections = {
  pages: defineCollection({
    schema: pagesSchema(),
  }),
}
