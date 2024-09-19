
import getLocalServerIp from '@xrengine/server-core/src/util/get-local-server-ip'
import appRootPath from 'app-root-path'
import assert from 'assert'
import { ChildProcess } from 'child_process'
import { v4 as uuidv4 } from 'uuid'

import { API } from '@xrengine/common'
import {
  identityProviderPath,
  InstanceData,
  instancePath,
  locationPath,
  RoomCode,
  UserID
} from '@xrengine/common/src/schema.type.module'
import { destroyEngine } from '@xrengine/ecs/src/Engine'
import { getState } from '@xrengine/hyperflux'
import { NetworkState } from '@xrengine/network'
import { Application } from '@xrengine/server-core/declarations'

import { toDateTimeSql } from '@xrengine/common/src/utils/datetime-sql'
import { StartTestFileServer } from '../../server-core/src/createFileServer'
import { onConnection } from '../src/channels'
import { InstanceServerState } from '../src/InstanceServerState'
import { start } from '../src/start'

describe('InstanceLoad', () => {
  before(async () => {
    const child: ChildProcess = require('child_process').spawn('npm', ['run', 'dev-agones'], {
      cwd: appRootPath.path,
      stdio: 'inherit',
      detached: true
    })

    process.on('exit', async () => {
      process.kill(-child.pid!, 'SIGINT')
    })

    const app = await start()
    await app.setup()
    StartTestFileServer()
  })

  it('should load location', async () => {
    const app = API.instance as Application
    const loadLocation = onConnection(app)

    const type = 'guest'
    const token = uuidv4()

    const createdIdentityProvider = await app.service(identityProviderPath).create({
      type,
      token,
      userId: '' as UserID
    })

    const skyStationScene = await app.service(locationPath).find({
      query: {
        slugifiedName: 'sky-station'
      }
    })

    const localIp = await getLocalServerIp()
    console.log('localIp', localIp)
    await app.service(instancePath).create({
      ipAddress: `${localIp}:3031`,
      currentUsers: 0,
      locationId: skyStationScene.data[0].id,
      assigned: false,
      assignedAt: toDateTimeSql(new Date()),
      roomCode: '' as RoomCode
    } as InstanceData)

    const query = {
      provider: 'test',
      headers: {},
      socketQuery: {
        token: createdIdentityProvider.accessToken,
        locationId: skyStationScene.data[0].id,
        instanceID: '',
        channelId: '',
        roomCode: '',
        address: '',
        port: 0,
        EIO: '',
        transport: '',
        t: ''
      },
      instanceId: '',
      channelId: undefined
    } as any

    await loadLocation(query)

    assert.equal(NetworkState.worldNetwork.ready, true)
    assert.equal(getState(InstanceServerState).ready, true)
  })

  after(() => {
    return destroyEngine()
  })
})
