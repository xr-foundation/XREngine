
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { GoDownload } from 'react-icons/go'
import { HiOutlineRefresh } from 'react-icons/hi'

import { useGet } from '@xrengine/common'
import { podsPath } from '@xrengine/common/src/schema.type.module'
import { useHookstate } from '@xrengine/hyperflux'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import Modal from '@xrengine/ui/src/primitives/tailwind/Modal'
import Select from '@xrengine/ui/src/primitives/tailwind/Select'
import Text from '@xrengine/ui/src/primitives/tailwind/Text'

import { PopoverState } from '../../../common/services/PopoverState'
import { serverAutoRefreshOptions } from '../../common/constants/server'
import { useServerInfoFind } from '../../services/ServerInfoQuery'

export default function ServerLogsModal({ podName, containerName }: { podName: string; containerName?: string }) {
  const logsEndRef = useRef<HTMLPreElement>(null)
  const { t } = useTranslation()

  const selectedContainerName = useHookstate(containerName)
  const serverLogsQuery = useGet(podsPath, `${podName}/${selectedContainerName.value}`)
  const serverLogs = serverLogsQuery.data

  const serverInfo = useServerInfoFind().data
  const containersOptions =
    serverInfo
      .find((info) => info.id === 'all')
      ?.pods.find((pod) => pod.name === podName)
      ?.containers.map((container) => ({ label: container.name, value: container.name })) || []

  useEffect(() => {
    if (serverLogs) {
      logsEndRef.current?.scrollIntoView()
    }
  }, [serverLogs])

  const handleDownloadServerLogs = () => {
    if (!serverLogs) return
    const blob = new Blob([serverLogs], { type: 'text/plain;charset=utf-8' })
    window.open(URL.createObjectURL(blob), `${serverLogs}.log.txt`)
  }

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const autoRefresh = useHookstate('60')

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    const refreshValue = parseInt(autoRefresh.value, 10)
    if (!refreshValue) return
    intervalRef.current = setInterval(serverLogsQuery.refetch, refreshValue * 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [autoRefresh])

  return (
    <Modal
      className="w-[50vw] max-w-[50vw]"
      title={t('admin:components.server.serverLogs')}
      onClose={() => PopoverState.hidePopupover()}
    >
      <div className="space-y-4">
        <div className="space-between mb-2 flex w-full items-center">
          <Text fontSize="xl" component="h2">
            {t('admin:components.server.logs')}: {podName}
          </Text>
          <Button
            startIcon={<GoDownload />}
            title={t('admin:components.server.downloadLogs')}
            variant="outline"
            className="ml-auto border-0"
            onClick={handleDownloadServerLogs}
          />
        </div>
        <div className="flex items-end">
          <Select
            label={t('admin:components.server.container')}
            options={containersOptions}
            currentValue={selectedContainerName.value || ''}
            onChange={(value) => selectedContainerName.set(value)}
          />
          <div className="ml-auto flex items-center">
            <Button
              title={t('admin:components.common.refresh')}
              onClick={() => serverLogsQuery.refetch()}
              startIcon={<HiOutlineRefresh />}
              variant="outline"
              className="border-0"
            />
            <Select
              options={serverAutoRefreshOptions}
              currentValue={autoRefresh.value}
              onChange={(value) => autoRefresh.set(value)}
            />
          </div>
        </div>
        <div className="max-h-[50vh] overflow-auto">
          <pre className="bg-stone-300 text-sm font-[var(--lato)] dark:bg-stone-800">{serverLogs}</pre>
          <pre ref={logsEndRef} />
        </div>
      </div>
    </Modal>
  )
}
