
/**
 * An object for swagger documentation configuration
 */

import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  recordingDataSchema,
  recordingPatchSchema,
  recordingQuerySchema,
  recordingSchema
} from '@xrengine/common/src/schemas/recording/recording.schema'

export default createSwaggerServiceOptions({
  schemas: {
    recordingDataSchema,
    recordingPatchSchema,
    recordingQuerySchema,
    recordingSchema
  },
  docs: {
    description: 'Recording service description',
    securities: ['all']
  }
})
