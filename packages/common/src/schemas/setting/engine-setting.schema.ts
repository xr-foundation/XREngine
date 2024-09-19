// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { StringEnum, Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '@xrengine/common/src/schemas/validators'
import { TypedString } from '../../types/TypeboxUtils'
import { UserID } from '../user/user.schema'

export const engineSettingPath = 'engine-setting'

export const engineSettingMethods = ['find', 'create', 'patch', 'remove'] as const

// Main data model schema
export const engineSettingSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    key: Type.String(),
    value: Type.String(),
    type: StringEnum(['private', 'public']),
    category: StringEnum(['aws', 'server', 'task-server']),
    updatedBy: Type.Optional(
      TypedString<UserID>({
        format: 'uuid'
      })
    ),
    updatedAt: Type.String({ format: 'date-time' }),
    createdAt: Type.String({ format: 'date-time' })
  },
  { $id: 'EngineSetting', additionalProperties: false }
)
export interface EngineSettingType extends Static<typeof engineSettingSchema> {}

// Schema for creating new entries
export const engineSettingDataSchema = Type.Pick(engineSettingSchema, ['key', 'value', 'type', 'category'], {
  $id: 'EngineSettingData'
})
export interface EngineSettingData extends Static<typeof engineSettingDataSchema> {}

// Schema for updating existing entries
export const engineSettingPatchSchema = Type.Partial(
  Type.Pick(engineSettingSchema, ['key', 'value', 'type', 'category']),
  {
    $id: 'EngineSettingPatch'
  }
)
export interface EngineSettingPatch extends Static<typeof engineSettingPatchSchema> {}

// Schema for allowed query properties
export const engineSettingQueryProperties = Type.Pick(engineSettingSchema, ['id', 'key', 'value', 'type', 'category'])
export const engineSettingQuerySchema = Type.Intersect(
  [
    querySyntax(engineSettingQueryProperties),
    // Add additional query properties here
    Type.Object(
      {
        paginate: Type.Optional(Type.Boolean())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export interface EngineSettingQuery extends Static<typeof engineSettingQuerySchema> {}

export const engineSettingValidator = /* @__PURE__ */ getValidator(engineSettingSchema, dataValidator)
export const engineSettingDataValidator = /* @__PURE__ */ getValidator(engineSettingDataSchema, dataValidator)
export const engineSettingPatchValidator = /* @__PURE__ */ getValidator(engineSettingPatchSchema, dataValidator)
export const engineSettingQueryValidator = /* @__PURE__ */ getValidator(engineSettingQuerySchema, queryValidator)
