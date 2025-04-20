import { z } from "astro/zod";

// eslint-disable-next-line ts/explicit-function-return-type
export function ProjectSchemas() {
  return z.object({
    title: z.string(),
    content: z.string(),
    excerpt: z.string(),
    dates: z.string(),
    typeOfProject: z.string().optional(),
    typeOfApplication: z.string().optional(),
    coverImage: z.string().optional(),
    slug: z.string().optional(),
    tags: z.array(z.string()).optional(),
  });
}

export function ProjectsSchemas() {
  return z.array(ProjectSchemas());
}

export type ProjectSchemaInput = z.input<ReturnType<typeof ProjectSchema>>;
export type ProjectSchemaOutput = z.output<ReturnType<typeof ProjectSchema>>;
