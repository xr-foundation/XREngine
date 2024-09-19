
import { isApple } from '@xrengine/common/src/utils/getDeviceStats'

export function getStepSize(event, smallStep, mediumStep, largeStep) {
  if (event.altKey) {
    return smallStep
  } else if (event.shiftKey) {
    return largeStep
  }
  return mediumStep
}

export const cmdOrCtrlString = isApple() ? 'meta' : 'ctrl'
