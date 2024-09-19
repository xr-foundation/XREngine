// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { dataValidator, queryValidator } from '../validators'

export const chargebeeSettingPath = 'chargebee-setting'

export const chargebeeSettingMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const chargebeeSettingSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    url: Type.String(),
    apiKey: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'ChargebeeSetting', additionalProperties: false }
)
export interface ChargebeeSettingType extends Static<typeof chargebeeSettingSchema> {}

// Schema for creating new entries
export const chargebeeSettingDataSchema = Type.Pick(chargebeeSettingSchema, ['url', 'apiKey'], {
  $id: 'ChargebeeSettingData'
})
export interface ChargebeeSettingData extends Static<typeof chargebeeSettingDataSchema> {}

// Schema for updating existing entries
export const chargebeeSettingPatchSchema = Type.Partial(chargebeeSettingSchema, {
  $id: 'ChargebeeSettingPatch'
})
export interface ChargebeeSettingPatch extends Static<typeof chargebeeSettingPatchSchema> {}

// Schema for allowed query properties
export const chargebeeSettingQueryProperties = Type.Pick(chargebeeSettingSchema, ['id', 'url', 'apiKey'])
export const chargebeeSettingQuerySchema = Type.Intersect(
  [
    querySyntax(chargebeeSettingQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface ChargebeeSettingQuery extends Static<typeof chargebeeSettingQuerySchema> {}

export const chargebeeSettingValidator = /* @__PURE__ */ getValidator(chargebeeSettingSchema, dataValidator)
export const chargebeeSettingDataValidator = /* @__PURE__ */ getValidator(chargebeeSettingDataSchema, dataValidator)
export const chargebeeSettingPatchValidator = /* @__PURE__ */ getValidator(chargebeeSettingPatchSchema, dataValidator)
export const chargebeeSettingQueryValidator = /* @__PURE__ */ getValidator(chargebeeSettingQuerySchema, queryValidator)
