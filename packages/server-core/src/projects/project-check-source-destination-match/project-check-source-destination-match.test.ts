import assert from 'assert'
import nock from 'nock'
import { v4 as uuidv4 } from 'uuid'

import { projectCheckSourceDestinationMatchPath } from '@xrengine/common/src/schemas/projects/project-check-source-destination-match.schema'
import { projectPath, ProjectType } from '@xrengine/common/src/schemas/projects/project.schema'
import { ScopeType } from '@xrengine/common/src/schemas/scope/scope.schema'
import { avatarPath } from '@xrengine/common/src/schemas/user/avatar.schema'
import { identityProviderPath } from '@xrengine/common/src/schemas/user/identity-provider.schema'
import { userApiKeyPath, UserApiKeyType } from '@xrengine/common/src/schemas/user/user-api-key.schema'
import { UserName, userPath } from '@xrengine/common/src/schemas/user/user.schema'
import { destroyEngine } from '@xrengine/ecs/src/Engine'

import { Application, HookContext } from '../../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'
import { identityProviderDataResolver } from '../../user/identity-provider/identity-provider.resolvers'
import { getRepoManifestJson1, getRepoManifestJson2 } from '../../util/mockOctokitResponses'

describe('project-check-source-destination-match.test', () => {
  let app: Application
  let testUserApiKey: UserApiKeyType

  const getTestSourceDestinationUrlQuery1 = () => ({
    sourceURL: 'https://github.com/MyOrg/my-first-project',
    destinationURL: 'https://github.com/MyOrg/my-first-project'
  })

  const getTestSourceDestinationUrlQuery2 = () => ({
    sourceURL: 'https://github.com/MyOrg/my-first-project',
    destinationURL: 'https://github.com/MyOrg/my-second-project'
  })

  const getParams = () => ({
    provider: 'rest',
    headers: {
      authorization: `Bearer ${testUserApiKey.token}`
    }
  })

  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()

    const name = ('test-project-check-source-destination-match-user-name-' + uuidv4()) as UserName

    const avatar = await app.service(avatarPath).create({
      name: 'test-project-check-source-destination-match-avatar-name-' + uuidv4()
    })

    const testUser = await app.service(userPath).create({
      name,
      avatarId: avatar.id,
      isGuest: false,
      scopes: [{ type: 'projects:read' as ScopeType }]
    })

    testUserApiKey = await app.service(userApiKeyPath).create({ userId: testUser.id })

    await app.service(identityProviderPath)._create(
      await identityProviderDataResolver.resolve(
        {
          type: 'github',
          token: `test-token-${Math.round(Math.random() * 1000)}`,
          userId: testUser.id
        },
        {} as HookContext
      ),
      getParams()
    )
  })

  after(async () => {
    await tearDownAPI()
    destroyEngine()
  })

  it('should match source and destination contents with same repos', async () => {
    nock('https://api.github.com')
      .get(/\/repos.*\/contents\/.*/)
      .reply(200, getRepoManifestJson1())
      .get(/\/repos.*\/contents\/.*/)
      .reply(200, getRepoManifestJson1())

    const result = await app
      .service(projectCheckSourceDestinationMatchPath)
      .find({ query: getTestSourceDestinationUrlQuery1(), ...getParams() }, undefined as any)

    assert.ok(result)
    assert.ok(result.projectName)
    assert.equal(result.sourceProjectMatchesDestination, true)
  })

  it('should not match source and destination contents with different repos', async () => {
    nock('https://api.github.com')
      .get(/\/repos.*\/contents\/.*/)
      .reply(200, getRepoManifestJson1())
      .get(/\/repos.*\/contents\/.*/)
      .reply(200, getRepoManifestJson2())

    const result = await app
      .service(projectCheckSourceDestinationMatchPath)
      .find({ query: getTestSourceDestinationUrlQuery2(), ...getParams() }, undefined as any)

    assert.ok(result)
    assert.ok(result.error)
    assert.ok(result.text)
    assert.ok(!result.sourceProjectMatchesDestination)
  })

  it('should match if destination manifest.json is empty', async () => {
    nock('https://api.github.com')
      .get(/\/repos.*\/contents\/.*/)
      .reply(200, getRepoManifestJson1())
      .get(/\/repos.*\/contents\/.*/)
      .reply(404)
      .get(/\/repos.*\/contents\/.*/)
      .reply(404)

    const result = await app
      .service(projectCheckSourceDestinationMatchPath)
      .find({ query: getTestSourceDestinationUrlQuery1(), ...getParams() }, undefined as any)

    assert.ok(result)
    assert.equal(result.sourceProjectMatchesDestination, true)
  })

  describe('installed project check', () => {
    let createdProject: ProjectType

    before(async () => {
      createdProject = await app.service(projectPath).create({
        name: 'myorg/my-first-project'
      })
    })

    after(async () => {
      await app.service(projectPath).remove(createdProject.id)
    })

    it('should check if project is already installed', async () => {
      nock('https://api.github.com')
        .get(/\/repos.*\/contents\/.*/)
        .reply(200, getRepoManifestJson1())
        .get(/\/repos.*\/contents\/.*/)
        .reply(200, getRepoManifestJson1())

      const result = await app
        .service(projectCheckSourceDestinationMatchPath)
        .find({ query: getTestSourceDestinationUrlQuery1(), ...getParams() }, undefined as any)

      assert.ok(result)
      assert.ok(result.error)
    })
  })
})
