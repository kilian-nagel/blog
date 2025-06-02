import type { ProjectsSchemaOutput } from '../schemas/project'

interface ProjectFormatted {
  name: string
  desc: string
}

interface ProjectsFormatted {
  'Current projects': ProjectFormatted[]
  'Past projects': ProjectFormatted[]
}

export function convert_hygraph_projects_to_format(
  posts: ProjectsSchemaOutput,
): ProjectsFormatted {
  if (!posts)
    return { 'Current projects': [], 'Past projects': [] }

  const projects_formatted: ProjectsFormatted = {
    'Current projects': [],
    'Past projects': [],
  }
  for (const post of posts) {
    const project_post: ProjectFormatted = { name: '', desc: '' }
    project_post.name = post.title
    project_post.desc = post.excerpt

    if (post.isCompleted) {
      projects_formatted['Past projects'].push(project_post)
    }
    else {
      projects_formatted['Current projects'].push(project_post)
    }
  }

  return projects_formatted
}
