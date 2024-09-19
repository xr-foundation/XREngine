
import { BadRequest, Forbidden, NotAuthenticated, NotFound } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers/lib'
import assert from 'assert'

import { AvatarID } from '@xrengine/common/src/schemas/user/avatar.schema'
import { InviteCode, UserName, userPath, UserType } from '@xrengine/common/src/schemas/user/user.schema'
import { destroyEngine } from '@xrengine/ecs/src/Engine'

import { projectPath, projectPermissionPath } from '@xrengine/common/src/schema.type.module'
import { deleteFolderRecursive } from '@xrengine/common/src/utils/fsHelperFunctions'
import appRootPath from 'app-root-path'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { Application } from '../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../createApp'
import verifyProjectPermission from './verify-project-permission'

const mockHookContext = (
  app: Application,
  params?: Partial<{ isInternal: boolean; query: unknown; user: UserType }>
) => {
  return {
    app,
    params
  } as unknown as HookContext<Application>
}

describe('verify-project-permission', () => {
  let app: Application
  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()
  })

  after(async () => {
    await tearDownAPI()
    destroyEngine()
  })

  it('should fail if user is not authenticated', async () => {
    const verifyPermission = verifyProjectPermission(['owner'])
    const hookContext = mockHookContext(app)
    assert.rejects(() => verifyPermission(hookContext), NotAuthenticated)
  })

  it('should fail if project id is missing', async () => {
    const user = await app.service(userPath).create({
      name: `Test #${Math.random()}` as UserName,
      isGuest: true,
      avatarId: '' as AvatarID,
      inviteCode: '' as InviteCode,
      scopes: []
    })
    const verifyPermission = verifyProjectPermission(['owner'])
    const hookContext = mockHookContext(app, { user })
    assert.rejects(async () => await verifyPermission(hookContext), BadRequest)
    // cleanup
    await app.service(userPath).remove(user.id)
  })

  it('should fail if project is not found', async () => {
    const user = await app.service(userPath).create({
      name: `Test #${Math.random()}` as UserName,
      isGuest: true,
      avatarId: '' as AvatarID,
      inviteCode: '' as InviteCode,
      scopes: []
    })

    const verifyPermission = verifyProjectPermission(['owner'])
    const hookContext = mockHookContext(app, {
      user,
      query: {
        projectId: uuidv4()
      }
    })
    assert.rejects(async () => await verifyPermission(hookContext), NotFound)

    // cleanup
    await app.service(userPath).remove(user.id)
  })

  it('should fail if user does not have required permission', async () => {
    const user = await app.service(userPath).create({
      name: `Test #${Math.random()}` as UserName,
      isGuest: true,
      avatarId: '' as AvatarID,
      inviteCode: '' as InviteCode,
      scopes: []
    })
    const project = await app.service(projectPath).create({
      name: `@org/project #${Math.random()}`
    })

    await app.service(projectPermissionPath).create({
      type: 'reviewer',
      userId: user.id,
      projectId: project.id
    })

    const verifyPermission = verifyProjectPermission(['owner'])
    const hookContext = mockHookContext(app, { user, query: { projectId: project.id } })
    assert.rejects(async () => await verifyPermission(hookContext), Forbidden)

    // cleanup
    await app.service(userPath).remove(user.id)
    await app.service(projectPath).remove(project.id)
    const projectDir = path.resolve(appRootPath.path, `packages/projects/projects/${project.name}/`)
    deleteFolderRecursive(projectDir)
  })

  it('should verify if user has required permission', async () => {
    const user = await app.service(userPath).create({
      name: `Test #${Math.random()}` as UserName,
      isGuest: true,
      avatarId: '' as AvatarID,
      inviteCode: '' as InviteCode,
      scopes: []
    })
    const project = await app.service(projectPath).create({
      name: `@org/project #${Math.random()}`
    })

    await app.service(projectPermissionPath).create({
      type: 'owner',
      userId: user.id,
      projectId: project.id
    })

    const verifyPermission = verifyProjectPermission(['owner'])
    const hookContext = mockHookContext(app, { user, query: { projectId: project.id } })
    assert.doesNotThrow(async () => await verifyPermission(hookContext))

    // cleanup
    await app.service(userPath).remove(user.id)
    await app.service(projectPath).remove(project.id)
    const projectDir = path.resolve(appRootPath.path, `packages/projects/projects/${project.name}/`)
    deleteFolderRecursive(projectDir)
  })

  it('should verify if isInternal', () => {
    const verifyPermission = verifyProjectPermission(['owner'])
    const hookContext = mockHookContext(app, { isInternal: true })
    assert.doesNotThrow(() => verifyPermission(hookContext))
  })
})
