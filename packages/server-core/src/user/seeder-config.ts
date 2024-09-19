import { KnexSeed } from '@xrengine/common/src/interfaces/KnexSeed'

import * as userRelationshipTypeSeed from './user-relationship-type/user-relationship-type.seed'

export const userSeeds: Array<KnexSeed> = [userRelationshipTypeSeed]
