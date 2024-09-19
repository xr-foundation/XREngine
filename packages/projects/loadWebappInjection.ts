import { API } from '@xrengine/common'
import { projectsPath } from '@xrengine/common/src/schema.type.module'

import { loadConfigForProject } from './loadConfigForProject'

export const loadWebappInjection = async () => {
  if (window.location.pathname.startsWith('/auth/oauth')) return []
  const projects = await API.instance.service(projectsPath).find()
  return (
    await Promise.all(
      projects.map(async (project) => {
        try {
          const projectConfig = (await loadConfigForProject(project))!
          if (typeof projectConfig.webappInjection !== 'function') return null!
          return (await projectConfig.webappInjection()).default
        } catch (e) {
          console.error(`Failed to import webapp load event for project ${project} with reason ${e}`)
          return null!
        }
      })
    )
  ).filter(($) => !!$)
}
