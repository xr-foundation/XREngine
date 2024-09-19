
/**
 * This method perform different actions on filename to ensure it meets all requirements.
 * @param fileName File name to be processed
 */
export const processFileName = (fileName: string): string => {
  let name = fileName

  try {
    // Change file extension to lowercase
    const nameSplit = name.split('.')
    if (nameSplit.length === 1) return name
    const extension = nameSplit.pop()
    if (extension) {
      nameSplit.push(extension.toLowerCase())
      name = nameSplit.join('.')
    }
  } catch (e) {
    return name
  }

  return name
}
