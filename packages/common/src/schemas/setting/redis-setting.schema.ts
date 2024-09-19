
// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { dataValidator, queryValidator } from '../validators'

export const redisSettingPath = 'redis-setting'

export const redisSettingMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const redisSettingSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    enabled: Type.Boolean(),
    address: Type.String(),
    port: Type.String(),
    password: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'RedisSetting', additionalProperties: false }
)
export interface RedisSettingType extends Static<typeof redisSettingSchema> {}

// Schema for creating new entries
export const redisSettingDataSchema = Type.Pick(redisSettingSchema, ['enabled', 'address', 'port', 'password'], {
  $id: 'RedisSettingData'
})
export interface RedisSettingData extends Static<typeof redisSettingDataSchema> {}

// Schema for updating existing entries
export const redisSettingPatchSchema = Type.Partial(redisSettingSchema, {
  $id: 'RedisSettingPatch'
})
export interface RedisSettingPatch extends Static<typeof redisSettingPatchSchema> {}

// Schema for allowed query properties
export const redisSettingQueryProperties = Type.Pick(redisSettingSchema, [
  'id',
  'enabled',
  'address',
  'port',
  'password'
])
export const redisSettingQuerySchema = Type.Intersect(
  [
    querySyntax(redisSettingQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface RedisSettingQuery extends Static<typeof redisSettingQuerySchema> {}

export const redisSettingValidator = /* @__PURE__ */ getValidator(redisSettingSchema, dataValidator)
export const redisSettingDataValidator = /* @__PURE__ */ getValidator(redisSettingDataSchema, dataValidator)
export const redisSettingPatchValidator = /* @__PURE__ */ getValidator(redisSettingPatchSchema, dataValidator)
export const redisSettingQueryValidator = /* @__PURE__ */ getValidator(redisSettingQuerySchema, queryValidator)
