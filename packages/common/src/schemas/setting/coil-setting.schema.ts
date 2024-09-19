// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { dataValidator, queryValidator } from '../validators'

export const coilSettingPath = 'coil-setting'

export const coilSettingMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const coilSettingSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    paymentPointer: Type.String(),
    clientId: Type.String(),
    clientSecret: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'CoilSetting', additionalProperties: false }
)
export interface CoilSettingType extends Static<typeof coilSettingSchema> {}

// Schema for creating new entries
export const coilSettingDataSchema = Type.Pick(coilSettingSchema, ['paymentPointer', 'clientId', 'clientSecret'], {
  $id: 'CoilSettingData'
})
export interface CoilSettingData extends Static<typeof coilSettingDataSchema> {}

// Schema for updating existing entries
export const coilSettingPatchSchema = Type.Partial(coilSettingSchema, {
  $id: 'CoilSettingPatch'
})
export interface CoilSettingPatch extends Static<typeof coilSettingPatchSchema> {}

// Schema for allowed query properties
export const coilSettingQueryProperties = Type.Pick(coilSettingSchema, [
  'id',
  'paymentPointer',
  'clientId',
  'clientSecret'
])
export const coilSettingQuerySchema = Type.Intersect(
  [
    querySyntax(coilSettingQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface CoilSettingQuery extends Static<typeof coilSettingQuerySchema> {}

export const coilSettingValidator = /* @__PURE__ */ getValidator(coilSettingSchema, dataValidator)
export const coilSettingDataValidator = /* @__PURE__ */ getValidator(coilSettingDataSchema, dataValidator)
export const coilSettingPatchValidator = /* @__PURE__ */ getValidator(coilSettingPatchSchema, dataValidator)
export const coilSettingQueryValidator = /* @__PURE__ */ getValidator(coilSettingQuerySchema, queryValidator)
