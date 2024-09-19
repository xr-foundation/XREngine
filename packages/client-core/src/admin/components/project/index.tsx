import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'

import { isDev } from '@xrengine/common/src/config'
import { useHookstate, useMutableState } from '@xrengine/hyperflux'
import Badge from '@xrengine/ui/src/primitives/tailwind/Badge'
import Tabs from '@xrengine/ui/src/primitives/tailwind/Tabs'

import SearchBar from '@xrengine/ui/src/components/tailwind/SearchBar'
import { ProjectService, ProjectState } from '../../../common/services/ProjectService'
import { AuthState } from '../../../user/services/AuthService'
import ProjectTable from './ProjectTable'
import ProjectTopMenu from './ProjectTopMenu'
import BuildStatusTable from './build-status/BuildStatusTable'

export default function AdminProject() {
  const { t } = useTranslation()
  const search = useHookstate({ local: '', query: '' })

  const projectState = useMutableState(ProjectState)
  const authState = useMutableState(AuthState)
  const user = authState.user

  ProjectService.useAPIListeners()

  useEffect(() => {
    if (user?.scopes?.value?.find((scope) => scope.type === 'projects:read')) {
      ProjectService.getBuilderInfo()
    }
  }, [user])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    ProjectService.checkReloadStatus()

    if (projectState.rebuilding.value) {
      interval = setInterval(ProjectService.checkReloadStatus, 10000)
    } else {
      if (interval) clearInterval(interval)
      ProjectService.fetchProjects()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [projectState.rebuilding.value])

  return (
    <>
      <div className="mb-2 flex justify-start gap-3">
        {projectState.builderInfo.engineVersion.value && (
          <Badge
            label={t('admin:components.project.currentEngineVersion', {
              version: projectState.builderInfo.engineVersion.value
            })}
            variant="neutral"
            className="py-2"
          />
        )}

        {projectState.builderInfo.engineCommit.value && (
          <Badge
            label={t('admin:components.project.currentEngineCommit', {
              commit: projectState.builderInfo.engineCommit.value
            })}
            variant="neutral"
            className="py-2"
          />
        )}
      </div>
      <Tabs
        tabsData={[
          {
            title: t('admin:components.project.project'),
            tabLabel: t('admin:components.common.all'),
            rightComponent: <ProjectTopMenu />,
            bottomComponent: <ProjectTable search={search.query.value} />,
            topComponent: (
              <div className="mb-4 flex justify-between">
                <SearchBar search={search} />
              </div>
            )
          },
          {
            title: t('admin:components.buildStatus.buildStatus'),
            tabLabel: (
              <span className="flex items-center gap-5">
                {t('admin:components.project.buildStatus')}
                {!isDev && (
                  <div
                    className={twMerge(
                      'inline h-3 w-3 rounded-full',
                      projectState.succeeded.value === true
                        ? 'bg-green-500'
                        : projectState.failed.value === true
                        ? 'bg-red-500'
                        : projectState.rebuilding.value === true
                        ? 'bg-yellow-500'
                        : 'hidden'
                    )}
                  />
                )}
              </span>
            ),
            bottomComponent: <BuildStatusTable />,
            disabled: false //config.client.localBuildOrDev
          }
        ]}
        tabcontainerClassName="bg-theme-primary"
      />
    </>
  )
}
