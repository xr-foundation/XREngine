import { useFind } from '@xrengine/common'
import { ProjectPermissionType, projectPermissionPath } from '@xrengine/common/src/schema.type.module'
import { HyperFlux } from '@xrengine/hyperflux'

/**
 *
 * @param path
 * @param queryParams
 * @param options
 * @returns
 */
export const useProjectPermissions = (project: string): ProjectPermissionType => {
  const { data } = useFind(projectPermissionPath, {
    query: {
      project,
      userId: HyperFlux.store.userID,
      paginate: false
    }
  })
  const [permission] = data
  return permission
}

/**
 *
 * @param {ProjectPermissionType} userPermission current user permission
 * @param {string | string[]} required required permission
 * @returns {boolean} whether the user has or not the required permission
 */
export const userHasProjectPermission = (
  userPermission: ProjectPermissionType,
  required: string[] | string
): boolean => {
  if (!userPermission?.type) {
    return false
  }

  if (!Array.isArray(required)) {
    return userPermission.type === required
  }
  return required.includes(userPermission.type)
}
