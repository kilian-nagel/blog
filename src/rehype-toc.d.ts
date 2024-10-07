declare module '@microflash/rehype-toc' {
  import type { Plugin } from 'unified'
  import type { Node } from 'unist'

  interface RehypeTocOptions {
    matcher?: RegExp
    id?: string
    toc?: (headings: { id: string, title: string, depth: number }[]) => Node
  }

  const rehypeToc: Plugin<[RehypeTocOptions?]>

  export default rehypeToc
}
