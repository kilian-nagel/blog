import type { VitessePagesEntry } from '../src/utils/routing'
import { z } from 'astro/zod'
import { vi } from 'vitest'
import { i18nSchema, pagesSchema } from '../src/schema'

const frontmatterSchema = pagesSchema()({
  image: () =>
    z.object({
      src: z.string(),
      width: z.number(),
      height: z.number(),
      format: z.union([
        z.literal('png'),
        z.literal('jpg'),
        z.literal('jpeg'),
        z.literal('tiff'),
        z.literal('webp'),
        z.literal('gif'),
        z.literal('svg'),
        z.literal('avif'),
      ]),
    }),
})

function mockPage(
  id: VitessePagesEntry['id'],
  data: z.input<typeof frontmatterSchema>,
  body = '',
): VitessePagesEntry {
  return {
    id,
    slug: id.replace(/\.[^.]+$/, '').replace(/\/index$/, ''),
    body,
    collection: 'pages',
    data: frontmatterSchema.parse(data),
    render: (() => {}) as VitessePagesEntry['render'],
  }
}

function mockDict(id: string, data: z.input<ReturnType<typeof i18nSchema>>): { id: string, data: z.infer<ReturnType<typeof i18nSchema>> } {
  return {
    id,
    data: i18nSchema().parse(data),
  }
}

export async function mockedAstroContent({
  pages = [],
  i18n = [],
}: {
  pages?: Parameters<typeof mockPage>[]
  i18n?: Parameters<typeof mockDict>[]
}): Promise<ReturnType<typeof vi.importActual> & {
  getCollection: (
    collection: 'pages' | 'i18n',
    filter?: (entry: ReturnType<typeof mockPage> | ReturnType<typeof mockDict>) => unknown,
  ) => (ReturnType<typeof mockPage> | ReturnType<typeof mockDict>)[]
}> {
  const mod = await vi.importActual<typeof import('astro:content')>('astro:content')
  const mockPages = pages.map(page => mockPage(...page))
  const mockDicts = i18n.map(dict => mockDict(...dict))
  return {
    ...mod,
    getCollection: (
      collection: 'pages' | 'i18n',
      filter?: (entry: ReturnType<typeof mockPage> | ReturnType<typeof mockDict>) => unknown,
    ) => {
      const entries = collection === 'i18n' ? mockDicts : mockPages
      return filter ? entries.filter(filter) : entries
    },
  }
}

export async function mockedCollectionConfig(pagesUserSchema?: Parameters<typeof pagesSchema>[0]): Promise<{ collections: { pages: ReturnType<typeof import('astro:content')['defineCollection']>, i18n: ReturnType<typeof import('astro:content')['defineCollection']> } }> {
  const content = await vi.importActual<typeof import('astro:content')>('astro:content')
  const schemas = await vi.importActual<typeof import('../src/schema')>('../src/schema')
  return {
    collections: {
      pages: content.defineCollection({ schema: schemas.pagesSchema(pagesUserSchema) }),
      i18n: content.defineCollection({ type: 'data', schema: schemas.i18nSchema() }),
    },
  }
}
