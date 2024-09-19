import { VALID_SCENE_NAME_REGEX, WINDOWS_RESERVED_NAME_REGEX } from '@xrengine/common/src/regex'

export default function isValidSceneName(sceneName: string) {
  return !WINDOWS_RESERVED_NAME_REGEX.test(sceneName) && VALID_SCENE_NAME_REGEX.test(sceneName)
}
