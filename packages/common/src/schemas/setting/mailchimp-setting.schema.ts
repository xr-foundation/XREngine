
// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { dataValidator, queryValidator } from '../validators'

export const mailchimpSettingPath = 'mailchimp-setting'

export const mailchimpSettingMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const mailchimpSettingSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    key: Type.String(),
    server: Type.String(),
    audienceId: Type.String(),
    defaultTags: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'MailchimpSetting', additionalProperties: false }
)
export interface MailchimpSettingType extends Static<typeof mailchimpSettingSchema> {}

// Schema for creating new entries
export const mailchimpSettingDataSchema = Type.Pick(
  mailchimpSettingSchema,
  ['key', 'server', 'audienceId', 'defaultTags'],
  {
    $id: 'MailchimpSettingData'
  }
)
export interface MailchimpSettingData extends Static<typeof mailchimpSettingDataSchema> {}

// Schema for updating existing entries
export const mailchimpSettingPatchSchema = Type.Partial(mailchimpSettingSchema, {
  $id: 'MailchimpSettingPatch'
})
export interface MailchimpSettingPatch extends Static<typeof mailchimpSettingPatchSchema> {}

// Schema for allowed query properties
export const mailchimpSettingQueryProperties = Type.Pick(mailchimpSettingSchema, ['server', 'defaultTags'])

export const mailchimpSettingQuerySchema = Type.Intersect(
  [
    querySyntax(mailchimpSettingQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface MailchimpSettingQuery extends Static<typeof mailchimpSettingQuerySchema> {}

export const mailchimpSettingValidator = /* @__PURE__ */ getValidator(mailchimpSettingSchema, dataValidator)
export const mailchimpSettingDataValidator = /* @__PURE__ */ getValidator(mailchimpSettingDataSchema, dataValidator)
export const mailchimpSettingPatchValidator = /* @__PURE__ */ getValidator(mailchimpSettingPatchSchema, dataValidator)
export const mailchimpSettingQueryValidator = /* @__PURE__ */ getValidator(mailchimpSettingQuerySchema, queryValidator)
