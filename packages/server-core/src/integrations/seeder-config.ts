
import { KnexSeed } from '@xrengine/common/src/interfaces/KnexSeed'

import * as metabaseSettingSeed from './metabase/metabase-setting/metabase-setting.seed'

export const integrationsSeeds: Array<KnexSeed> = [metabaseSettingSeed]
