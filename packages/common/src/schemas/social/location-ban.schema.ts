// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { TypedString } from '../../types/TypeboxUtils'
import { UserID } from '../user/user.schema'
import { dataValidator, queryValidator } from '../validators'
import { LocationID } from './location.schema'

export const locationBanPath = 'location-ban'

export const locationBanMethods = ['find', 'create', 'patch', 'remove', 'get'] as const

// Main data model schema
export const locationBanSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    userId: TypedString<UserID>({
      format: 'uuid'
    }),
    locationId: TypedString<LocationID>({
      format: 'uuid'
    }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'LocationBan', additionalProperties: false }
)
export interface LocationBanType extends Static<typeof locationBanSchema> {}

// Schema for creating new entries
export const locationBanDataSchema = Type.Pick(locationBanSchema, ['userId', 'locationId'], {
  $id: 'LocationBanData'
})
export interface LocationBanData extends Static<typeof locationBanDataSchema> {}

// Schema for updating existing entries
export const locationBanPatchSchema = Type.Partial(locationBanSchema, {
  $id: 'LocationBanPatch'
})
export interface LocationBanPatch extends Static<typeof locationBanPatchSchema> {}

// Schema for allowed query properties
export const locationBanQueryProperties = Type.Pick(locationBanSchema, ['id', 'userId', 'locationId'])
export const locationBanQuerySchema = Type.Intersect(
  [
    querySyntax(locationBanQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)

export interface LocationBanQuery extends Static<typeof locationBanQuerySchema> {}

export const locationBanValidator = /* @__PURE__ */ getValidator(locationBanSchema, dataValidator)
export const locationBanDataValidator = /* @__PURE__ */ getValidator(locationBanDataSchema, dataValidator)
export const locationBanPatchValidator = /* @__PURE__ */ getValidator(locationBanPatchSchema, dataValidator)
export const locationBanQueryValidator = /* @__PURE__ */ getValidator(locationBanQuerySchema, queryValidator)
