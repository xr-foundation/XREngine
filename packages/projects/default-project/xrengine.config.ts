import type { ProjectConfigInterface } from '@xrengine/projects/ProjectConfigInterface'

const config: ProjectConfigInterface = {
  onEvent: './projectEventHooks.ts',
  thumbnail: '/static/XREngine_thumbnail.jpg',
  routes: {
    '/': {
      component: () => import('@xrengine/client/src/pages/index'),
      props: {
        exact: true
      }
    },
    '/admin': {
      component: () => import('@xrengine/client/src/pages/admin')
    },
    '/location': {
      component: () => import('@xrengine/client/src/pages/location/location')
    },
    '/studio': {
      component: () => import('@xrengine/client/src/pages/editor')
    },
    '/room': {
      component: () => import('@xrengine/client/src/pages/room')
    },
    '/capture': {
      component: () => import('@xrengine/client/src/pages/capture')
    },
    '/chat': {
      component: () => import('@xrengine/client/src/pages/chat/chat')
    }
  }
}

export default config
