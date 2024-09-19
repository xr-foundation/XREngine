import { KTX2EncodeDefaultArguments } from '@xrengine/engine/src/assets/constants/CompressionParms'
import { defineState, syncStateWithLocalStorage } from '@xrengine/hyperflux'

import { defaultLODs } from '../constants/GLTFPresets'

export const ImportSettingsState = defineState({
  name: 'ImportSettingsState',
  initial: () => ({
    LODsEnabled: false,
    selectedLODS: defaultLODs,
    imageCompression: false,
    imageSettings: KTX2EncodeDefaultArguments,
    importFolder: '/assets/',
    LODFolder: 'LODs/'
  }),
  extension: syncStateWithLocalStorage([
    'LODsEnabled',
    'selectedLODS',
    'imageCompression',
    'imageSettings',
    'importFolder',
    'LODFolder'
  ])
})
