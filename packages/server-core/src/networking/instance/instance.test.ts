import { Paginated } from '@feathersjs/feathers'
import assert from 'assert'

import { InstanceID, instancePath, InstanceType } from '@xrengine/common/src/schemas/networking/instance.schema'
import { LocationID, LocationType, RoomCode } from '@xrengine/common/src/schemas/social/location.schema'
import { destroyEngine } from '@xrengine/ecs/src/Engine'
import { createTestLocation } from '@xrengine/server-core/tests/util/createTestLocation'

import { Application } from '../../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'

const params = { isInternal: true } as any

describe('instance.test', () => {
  let app: Application

  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()

    testLocation = await createTestLocation(app, params)

    testInstance = {
      id: '' as InstanceID,
      locationId: testLocation.id as LocationID,
      projectId: testLocation.projectId,
      roomCode: '' as RoomCode,
      currentUsers: 0,
      ended: false,
      createdAt: '',
      updatedAt: '',
      location: testLocation
    }
  })

  after(async () => {
    await tearDownAPI()
    destroyEngine()
  })

  let testLocation: LocationType
  let testInstance: InstanceType

  it('should create an instance', async () => {
    const instance = (await app.service(instancePath).create({
      locationId: testLocation.id as LocationID,
      roomCode: testInstance.roomCode as RoomCode,
      currentUsers: testInstance.currentUsers
    })) as InstanceType

    assert.ok(instance)
    assert.equal(instance.locationId, testLocation.id)
    assert.equal(instance.currentUsers, 0)
    assert.equal(instance.ended, false)

    testInstance = instance
  })

  it('should get that instance', async () => {
    const instance = await app.service(instancePath).get(testInstance.id)

    assert.ok(instance)
    assert.ok(instance.roomCode)
    assert.equal(instance.id, testInstance.id)
  })

  it('should find instances for admin', async () => {
    const instances = (await app.service(instancePath).find({
      action: 'admin'
    } as any)) as Paginated<InstanceType>

    assert.equal(instances.total, 1)
    assert.equal(instances.data[0].id, testInstance.id)
  })

  it('should have "total" in find method', async () => {
    const item = await app.service(instancePath).find({
      action: 'admin'
    } as any)

    assert.ok('total' in item)
  })
})
