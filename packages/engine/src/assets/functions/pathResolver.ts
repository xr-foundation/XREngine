
/**
 * Captures org name, project name and asset path from a URL.
 * For eg: `/path/to/projects/project123/assets/images/logo.png` will capture following groups
 * - `@org123` => Group 1
 * - `project123` => Group 2
 * - `assets/images/logo.png` => Group 3
 */
export const STATIC_ASSET_REGEX = /^(?:.*\/(?:projects|static-resources)\/([^\/]*)\/([^\/]*)\/((?:assets\/|).*)$)/

export function getBasePath(path: string) {
  const regex = new RegExp(`(.*/(?:projects|static-resources)/[^/]*)`)
  return regex.exec(path)![0]
}

export function getFileName(path: string) {
  return /[^\\/]+$/.exec(path)?.[0] ?? ''
}

export function getRelativeURI(path: string) {
  return STATIC_ASSET_REGEX.exec(path)?.[3] ?? ''
}

export function getProjectName(path: string) {
  const match = STATIC_ASSET_REGEX.exec(path)
  if (!match?.length) return ''
  const [, orgName, projectName] = match!
  return `${orgName}/${projectName}`
}

export function modelResourcesPath(modelName: string) {
  return `model-resources/${modelName.split('.').at(-2)!}`
}
