// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '@xrengine/common/src/schemas/validators'

export const metabaseSettingPath = 'metabase-setting'

export const metabaseSettingMethods = ['find', 'create', 'patch'] as const

// Main data model schema
export const metabaseSettingSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    siteUrl: Type.String(),
    secretKey: Type.String(),
    environment: Type.String(),
    crashDashboardId: Type.Optional(Type.String()),
    expiration: Type.Number(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'MetabaseSetting', additionalProperties: true }
)
export interface MetabaseSettingType extends Static<typeof metabaseSettingSchema> {}

// Schema for creating new entries
export const metabaseSettingDataSchema = Type.Pick(
  metabaseSettingSchema,
  ['siteUrl', 'secretKey', 'crashDashboardId'],
  {
    $id: 'MetabaseSettingData'
  }
)
export interface MetabaseSettingData extends Static<typeof metabaseSettingDataSchema> {}

// Schema for updating existing entries
export const metabaseSettingPatchSchema = Type.Partial(metabaseSettingSchema, {
  $id: 'MetabaseSettingPatch'
})
export interface MetabaseSettingPatch extends Static<typeof metabaseSettingPatchSchema> {}

// Schema for allowed query properties
export const metabaseSettingQueryProperties = Type.Pick(metabaseSettingSchema, [
  'id',
  'siteUrl',
  'secretKey',
  'environment',
  'crashDashboardId'
])

export const metabaseSettingQuerySchema = Type.Intersect(
  [
    querySyntax(metabaseSettingQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: true })
  ],
  { additionalProperties: true }
)
export interface MetabaseSettingQuery extends Static<typeof metabaseSettingQuerySchema> {}

export const metabaseSettingValidator = /* @__PURE__ */ getValidator(metabaseSettingSchema, dataValidator)
export const metabaseSettingDataValidator = /* @__PURE__ */ getValidator(metabaseSettingDataSchema, dataValidator)
export const metabaseSettingPatchValidator = /* @__PURE__ */ getValidator(metabaseSettingPatchSchema, dataValidator)
export const metabaseSettingQueryValidator = /* @__PURE__ */ getValidator(metabaseSettingQuerySchema, queryValidator)
