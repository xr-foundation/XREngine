// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { dataValidator, queryValidator } from '../validators'

export const zendeskSettingPath = 'zendesk-setting'

export const zendeskSettingMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const zendeskSettingSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    name: Type.String(),
    secret: Type.String(),
    kid: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'ZendeskSetting', additionalProperties: false }
)
export interface ZendeskSettingType extends Static<typeof zendeskSettingSchema> {}

// Schema for creating new entries
export const zendeskSettingDataSchema = Type.Pick(zendeskSettingSchema, ['name', 'secret', 'kid'], {
  $id: 'ZendeskSettingData'
})
export interface ZendeskSettingData extends Static<typeof zendeskSettingDataSchema> {}

// Schema for updating existing entries
export const zendeskSettingPatchSchema = Type.Partial(zendeskSettingSchema, {
  $id: 'ZendeskSettingPatch'
})
export interface ZendeskSettingPatch extends Static<typeof zendeskSettingPatchSchema> {}

// Schema for allowed query properties
export const zendeskSettingQueryProperties = Type.Pick(zendeskSettingSchema, ['id', 'name'])

export const zendeskSettingQuerySchema = Type.Intersect(
  [
    querySyntax(zendeskSettingQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface ZendeskSettingQuery extends Static<typeof zendeskSettingQuerySchema> {}

export const zendeskSettingValidator = /* @__PURE__ */ getValidator(zendeskSettingSchema, dataValidator)
export const zendeskSettingDataValidator = /* @__PURE__ */ getValidator(zendeskSettingDataSchema, dataValidator)
export const zendeskSettingPatchValidator = /* @__PURE__ */ getValidator(zendeskSettingPatchSchema, dataValidator)
export const zendeskSettingQueryValidator = /* @__PURE__ */ getValidator(zendeskSettingQuerySchema, queryValidator)
