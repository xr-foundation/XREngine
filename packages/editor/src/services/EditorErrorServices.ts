import { defineState } from '@xrengine/hyperflux'

export const EditorErrorState = defineState({
  name: 'EditorErrorState',
  initial: { error: null as string | null }
})
