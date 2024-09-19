
import { useMemo } from 'react'

import { useFind } from '@xrengine/common'
import { podsPath, PodsType, ServerPodInfoType } from '@xrengine/common/src/schema.type.module'

export const useServerInfoFind = () => {
  const serverInfoQuery = useFind(podsPath)
  const serverInfo = useMemo(() => {
    const allPods: ServerPodInfoType[] = []
    for (const item of serverInfoQuery.data as PodsType[]) {
      allPods.push(...item.pods)
    }

    return [
      {
        id: 'all',
        label: 'All',
        pods: allPods
      },
      ...serverInfoQuery.data
    ]
  }, [serverInfoQuery.data])

  return {
    ...serverInfoQuery,
    data: serverInfo
  }
}
