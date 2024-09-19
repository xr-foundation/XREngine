import { VALID_FILENAME_REGEX, WINDOWS_RESERVED_NAME_REGEX } from '@xrengine/common/src/regex'

export function isValidFileName(fileName: string) {
  return VALID_FILENAME_REGEX.test(fileName) && !WINDOWS_RESERVED_NAME_REGEX.test(fileName)
}
