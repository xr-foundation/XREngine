import assert from 'assert'
import { v4 as uuidv4 } from 'uuid'

import { botPath, BotType } from '@xrengine/common/src/schemas/bot/bot.schema'
import { instancePath, InstanceType } from '@xrengine/common/src/schemas/networking/instance.schema'
import { LocationID, LocationType, RoomCode } from '@xrengine/common/src/schemas/social/location.schema'
import { avatarPath } from '@xrengine/common/src/schemas/user/avatar.schema'
import { UserName, userPath, UserType } from '@xrengine/common/src/schemas/user/user.schema'
import { destroyEngine } from '@xrengine/ecs/src/Engine'

import { Application } from '../../../declarations'
import { createTestLocation } from '../../../tests/util/createTestLocation'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'

describe('bot.service', () => {
  let app: Application
  let testInstance: InstanceType
  let testLocation: LocationType
  let testUser: UserType
  let testBot: BotType

  const params = { isInternal: true }

  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()
  })
  after(async () => {
    await tearDownAPI()
    destroyEngine()
  })

  before(async () => {
    testLocation = await createTestLocation(app, params)

    testInstance = await app
      .service(instancePath)
      .create({ locationId: testLocation.id as LocationID, roomCode: '' as RoomCode, currentUsers: 0 })
  })

  before(async () => {
    const name = ('test-bot-user-name-' + uuidv4()) as UserName
    const avatarName = 'test-bot-avatar-name-' + uuidv4()

    const avatar = await app.service(avatarPath).create({
      name: avatarName
    })

    testUser = await app.service(userPath).create({
      name,
      avatarId: avatar.id,
      isGuest: false,
      scopes: []
    })
  })

  it('should create bot', async () => {
    const name = 'test-bot-' + uuidv4()
    const description = uuidv4() + '-' + uuidv4()
    testBot = await app.service(botPath).create({
      name,
      instanceId: testInstance.id,
      userId: testUser.id,
      botCommands: [],
      description,
      locationId: testLocation.id as LocationID
    })

    assert.ok(testBot.id)
    assert.equal(testBot.name, name)
    assert.equal(testBot.description, description)
    assert.equal(testBot.instanceId, testInstance.id)
    assert.equal(testBot.userId, testUser.id)
    assert.equal(testBot.locationId, testLocation.id)
  })

  it('should create bot with botCommands', async () => {
    const name = 'test-bot-' + uuidv4()
    const description = uuidv4() + '-' + uuidv4()

    const botCommands = [
      { name: 'test-bot-command-' + uuidv4(), description: 'bot-command-description-' + uuidv4() },
      { name: 'test-bot-command-' + uuidv4(), description: 'bot-command-description-' + uuidv4() }
    ]

    const createdBot = await app.service(botPath).create({
      name,
      instanceId: testInstance.id,
      userId: testUser.id,
      botCommands,
      description,
      locationId: testLocation.id as LocationID
    })

    assert.ok(createdBot.id)
    createdBot.botCommands.forEach((botCommand, idx) => {
      assert.equal(botCommand.botId, createdBot.id)
      assert.equal(botCommand.name, botCommands[idx].name)
      assert.equal(botCommand.description, botCommands[idx].description)
    })
  })

  it('should find the bot', async () => {
    const foundBots = await app.service(botPath).find({ isInternal: true })
    assert.ok(foundBots.data.find((bot) => bot.id === testBot.id))
  })

  it('should patch the bot', async () => {
    const name = 'test-bot-' + uuidv4()
    const patchedBot = await app.service(botPath).patch(testBot.id, { name }, { isInternal: true })
    assert.equal(patchedBot.name, name)
    testBot = patchedBot
  })

  it('should remove bot', async () => {
    await app.service(botPath).remove(testBot.id, { isInternal: true })
    const foundBots = await app.service(botPath).find({ isInternal: true })
    assert.ok(!foundBots.data.find((bot) => bot.id === testBot.id))
  })
})
