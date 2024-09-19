import { useFind } from '@xrengine/common'
import { instancePath, locationPath } from '@xrengine/common/src/schema.type.module'

/** @todo reimplement realtime connections with instances in studio */
export const useEditorActiveInstances = (sceneID: string) => {
  const locationQuery = useFind(locationPath, { query: { sceneId: sceneID, paginate: false } })

  const instanceQuery = useFind(instancePath, {
    query: {
      ended: false,
      locationId: {
        $in: locationQuery.data.map((location) => location.id)
      },
      paginate: false
    }
  })

  return instanceQuery.data
    .filter((a) => !!a)
    .map((instance) => {
      return {
        id: instance.id,
        locationId: instance.locationId,
        currentUsers: instance.currentUsers
      }
    })
}
