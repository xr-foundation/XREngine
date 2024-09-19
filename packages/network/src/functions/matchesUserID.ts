
import { matches, UserID, Validator } from '@xrengine/hyperflux'

export const matchesUserID = matches.string as Validator<unknown, UserID>
