import { Paginated, Params } from '@feathersjs/feathers'
import { AvatarType, avatarPath } from '@xrengine/common/src/schemas/user/avatar.schema'
import { UserApiKeyType, userApiKeyPath } from '@xrengine/common/src/schemas/user/user-api-key.schema'
import { InviteCode, UserName, UserType, userPath } from '@xrengine/common/src/schemas/user/user.schema'
import { Application } from '@xrengine/server-core/declarations'
import crypto from 'crypto'
import { random } from 'lodash'
import { v1 } from 'uuid'

/**
 * Method to get random avatar id
 * @param app
 * @returns
 */
const getAvatarId = async (app: Application) => {
  const avatars = (await app
    .service(avatarPath)
    .find({ isInternal: true, query: { isPublic: true, $limit: 10 } })) as Paginated<AvatarType>

  return avatars.data[random(avatars.data.length - 1)].id
}

/**
 * Method to get client params with user api key in headers
 * @param app
 * @returns
 */
export const getAuthParams = (userApiKey: UserApiKeyType) => {
  const params = {
    provider: 'rest',
    headers: {
      authorization: `Bearer ${userApiKey.token}`
    }
  } as Params

  return params
}

/**
 * Method to create user api key
 * @param app
 * @param user
 * @returns
 */
export const createUserApiKey = async (app: Application, user: UserType) => {
  const userApiKey = await app.service(userApiKeyPath).create({ userId: user.id })
  return userApiKey
}

/**
 * Method to create user
 * @param app
 * @returns
 */
export const createUser = async (app: Application) => {
  const avatarId = await getAvatarId(app)
  const code = crypto.randomBytes(4).toString('hex') as InviteCode

  const user = await app.service(userPath).create({
    name: `User ${v1()}` as UserName,
    inviteCode: code,
    avatarId
  })

  return user
}

/**
 * Method used to get user from id
 * @param app
 * @param userId
 * @returns
 */
export const getUser = async (app: Application, userId: string) => {
  const user = await app.service(userPath).get(userId)
  return user
}
