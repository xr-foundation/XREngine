
// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { dataValidator, queryValidator } from '../validators'

export const helmSettingPath = 'helm-setting'
export const helmMainVersionPath = 'helm-main-version'
export const helmBuilderVersionPath = 'helm-builder-version'

export const helmSettingMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const helmSettingSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    main: Type.String(),
    builder: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'HelmSetting', additionalProperties: false }
)
export interface HelmSettingType extends Static<typeof helmSettingSchema> {}

// Schema for creating new entries
export const helmSettingDataSchema = Type.Pick(helmSettingSchema, ['main', 'builder'], {
  $id: 'HelmSettingData'
})
export interface HelmSettingData extends Static<typeof helmSettingDataSchema> {}

// Schema for updating existing entries
export const helmSettingPatchSchema = Type.Partial(helmSettingSchema, {
  $id: 'HelmSettingPatch'
})
export interface HelmSettingPatch extends Static<typeof helmSettingPatchSchema> {}

// Schema for allowed query properties
export const helmSettingQueryProperties = Type.Pick(helmSettingSchema, ['id'])
export const helmSettingQuerySchema = Type.Intersect(
  [
    querySyntax(helmSettingQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface HelmSettingQuery extends Static<typeof helmSettingQuerySchema> {}

export const helmSettingValidator = /* @__PURE__ */ getValidator(helmSettingSchema, dataValidator)
export const helmSettingDataValidator = /* @__PURE__ */ getValidator(helmSettingDataSchema, dataValidator)
export const helmSettingPatchValidator = /* @__PURE__ */ getValidator(helmSettingPatchSchema, dataValidator)
export const helmSettingQueryValidator = /* @__PURE__ */ getValidator(helmSettingQuerySchema, queryValidator)
