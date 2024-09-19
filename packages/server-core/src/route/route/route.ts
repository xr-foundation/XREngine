
import { Params } from '@feathersjs/feathers'
import fs from 'fs'
import path from 'path'

import { InstalledRoutesInterface } from '@xrengine/common/src/interfaces/Route'
import { routeMethods, routePath, RouteType } from '@xrengine/common/src/schemas/route/route.schema'
import { ProjectConfigInterface } from '@xrengine/projects/ProjectConfigInterface'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { RouteService } from './route.class'
import routeDocs from './route.docs'
import hooks from './route.hooks'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    [routePath]: RouteService
  }

  interface ServiceTypes {
    'route-activate': {
      create: ReturnType<typeof activateRoute>
    }
  }

  interface ServiceTypes {
    'routes-installed': {
      find: ReturnType<typeof getInstalledRoutes>
    }
  }
}

export const getInstalledRoutes = () => {
  return async () => {
    const rootPath = path.resolve(__dirname, '../../../../projects/projects/')
    const projects = fs
      .readdirSync(rootPath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)
      .map((orgname) => {
        return fs
          .readdirSync(path.join(rootPath, orgname), { withFileTypes: true })
          .filter((dirent) => dirent.isDirectory())
          .map((dirent) => `${orgname}/${dirent.name}`)
      })
      .flat()
    const data: InstalledRoutesInterface[] = []
    await Promise.all(
      projects.map(async (project) => {
        try {
          if (fs.existsSync(path.resolve(__dirname, `../../../../projects/projects/${project}/xrengine.config.ts`))) {
            const projectConfig: ProjectConfigInterface = (
              await import(`@xrengine/projects/projects/${project}/xrengine.config.ts`)
            ).default
            if (!projectConfig.routes) return
            data.push({
              routes: Object.keys(projectConfig.routes!),
              project
            })
          }
        } catch (e) {
          logger.error(e, `[getProjects]: Failed to read config for project "${project}" with error: ${e.message}`)
          return
        }
      })
    )
    return data
  }
}

export const activateRoute = (routeService: RouteService) => {
  return async (data: { project: string; route: string; activate: boolean }, params: Params = {}) => {
    const activatedRoutes = (await routeService.find({
      paginate: false
    })) as RouteType[]
    const installedRoutes = await getInstalledRoutes()()
    if (data.activate) {
      const routeToActivate = installedRoutes.find((r) => r.project === data.project && r.routes.includes(data.route))
      if (routeToActivate) {
        // if any projects already have this route, deactivate them
        for (const route of activatedRoutes) {
          if (route.route === data.route) await routeService.remove(route.id)
        }
        await routeService.create({
          route: data.route,
          project: data.project
        })
        return true
      }
    } else {
      const routeToDeactivate = activatedRoutes.find((r) => r.project === data.project && r.route === data.route)
      if (routeToDeactivate) {
        await routeService.remove(routeToDeactivate.id)
        return true
      }
    }
    return false
  }
}

export default (app: Application): void => {
  const options = {
    name: routePath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(routePath, new RouteService(options), {
    // A list of all methods this service exposes externally
    methods: routeMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: routeDocs
  })

  const service = app.service(routePath)
  service.hooks(hooks)

  app.use('routes-installed', {
    find: getInstalledRoutes()
  })

  app.use('route-activate', {
    create: activateRoute(service)
  })
}
