
import { getState } from '@xrengine/hyperflux'
import { DomainConfigState } from '../state/DomainConfigState'

export const sceneRelativePathIdentifier = '__$project$__'
export const sceneCorsPathIdentifier = '__$cors-proxy$__'

export const parseStorageProviderURLs = (
  data: any,
  domains: { publicDomain: string; cloudDomain: string; proxyDomain: string } = getState(DomainConfigState)
) => {
  for (const [key, val] of Object.entries(data)) {
    if (val && typeof val === 'object') {
      data[key] = parseStorageProviderURLs(val, domains)
    }
    if (typeof val === 'string') {
      if (val.includes(sceneRelativePathIdentifier)) {
        data[key] = `${domains.cloudDomain}/projects` + data[key].replace(sceneRelativePathIdentifier, '')
      }
      if (val.startsWith(sceneCorsPathIdentifier)) {
        data[key] = data[key].replace(sceneCorsPathIdentifier, domains.proxyDomain)
      }
    }
  }
  return data
}

export const cleanStorageProviderURLs = (
  data: any,
  domains: { publicDomain: string; cloudDomain: string; proxyDomain: string } = getState(DomainConfigState)
) => {
  for (const [key, val] of Object.entries(data)) {
    if (val && typeof val === 'object') {
      data[key] = cleanStorageProviderURLs(val)
    }
    if (typeof val === 'string') {
      if (val.includes(domains.cloudDomain + '/projects')) {
        data[key] = val.replace(domains.cloudDomain + '/projects', sceneRelativePathIdentifier)
      } else if (val.startsWith(domains.proxyDomain)) {
        data[key] = val.replace(domains.proxyDomain, sceneCorsPathIdentifier)
      }
    }
  }
  return data
}
