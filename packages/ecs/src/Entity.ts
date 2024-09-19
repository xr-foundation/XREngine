
import { matches, OpaqueType, Validator } from '@xrengine/hyperflux'

export type Entity = OpaqueType<'entity'> & number
export type EntityUUID = OpaqueType<'EntityUUID'> & string

export const UndefinedEntity = 0 as Entity

export const matchesEntity = matches.number as Validator<unknown, Entity>
export const matchesEntityUUID = matches.string as Validator<unknown, EntityUUID>
