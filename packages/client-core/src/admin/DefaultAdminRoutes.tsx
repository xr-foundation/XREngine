import React, { lazy } from 'react'
import { HiOutlineCube } from 'react-icons/hi'
import {
  HiMapPin,
  HiMiniShieldExclamation,
  HiOutlineCog6Tooth,
  HiOutlineGlobeAlt,
  HiOutlineMegaphone,
  HiOutlineTableCells,
  HiPlay,
  HiServer,
  HiUser,
  HiUserCircle
} from 'react-icons/hi2'
import { RiSendPlaneFill } from 'react-icons/ri'

import { clientSettingPath } from '@xrengine/common/src/schema.type.module'

import { AdminRouteStateType } from './AllowedAdminRoutesState'

const Avatars = lazy(() => import('./components/avatar'))

const Invites = lazy(() => import('./components/invites'))

const Projects = lazy(() => import('./components/project'))

const Users = lazy(() => import('./components/user'))

const Locations = lazy(() => import('./components/locations'))

const Servers = lazy(() => import('./components/server'))

const Instances = lazy(() => import('./components/instance'))

const Resources = lazy(() => import('./components/resources'))

const Recordings = lazy(() => import('./components/recordings'))

const Routes = lazy(() => import('./components/routes'))

const Settings = lazy(() => import('./components/settings'))

const Channels = lazy(() => import('./components/channel'))

const CrashReport = lazy(() => import('./components/crash-report'))

export const DefaultAdminRoutes: Record<string, AdminRouteStateType> = {
  settings: {
    name: 'user:dashboard.setting',
    scope: ['settings', clientSettingPath],
    component: Settings,
    access: false,
    icon: <HiOutlineCog6Tooth />
  },
  projects: {
    name: 'user:dashboard.projects',
    scope: 'projects',
    component: Projects,
    access: false,
    icon: <HiOutlineTableCells />
  },
  locations: {
    name: 'user:dashboard.locations',
    scope: 'location',
    component: Locations,
    access: false,
    icon: <HiMapPin />
  },
  instances: {
    name: 'user:dashboard.instances',
    scope: 'instance',
    component: Instances,
    access: false,
    icon: <HiOutlineCube />
  },
  servers: {
    name: 'user:dashboard.server',
    scope: 'server',
    component: Servers,
    access: false,
    icon: <HiServer />
  },
  avatars: {
    name: 'user:dashboard.avatars',
    scope: 'globalAvatars',
    component: Avatars,
    access: false,
    icon: <HiUserCircle />
  },
  users: {
    name: 'user:dashboard.users',
    scope: 'user',
    component: Users,
    access: false,
    icon: <HiUser />
  },
  invites: {
    name: 'user:dashboard.invites',
    scope: 'invite',
    component: Invites,
    access: false,
    icon: <RiSendPlaneFill />
  },
  recordings: {
    name: 'user:dashboard.recordings',
    scope: 'recording',
    component: Recordings,
    access: false,
    icon: <HiPlay />
  },
  resources: {
    name: 'user:dashboard.resources',
    scope: 'static_resource',
    component: Resources,
    access: false,
    icon: <HiOutlineTableCells />
  },
  routes: {
    name: 'user:dashboard.routes',
    scope: 'routes',
    component: Routes,
    access: false,
    icon: <HiOutlineGlobeAlt />
  },
  channel: {
    name: 'user:dashboard.channels',
    scope: 'channel',
    component: Channels,
    access: false,
    icon: <HiOutlineMegaphone />
  },
  crashes: {
    name: 'user:dashboard.crashReport',
    scope: 'server',
    component: CrashReport,
    access: false,
    icon: <HiMiniShieldExclamation />
  }
}
