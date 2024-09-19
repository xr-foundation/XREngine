import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiArrowPath, HiPlus } from 'react-icons/hi2'

import { NotificationService } from '@xrengine/client-core/src/common/services/NotificationService'
import { PopoverState } from '@xrengine/client-core/src/common/services/PopoverState'
import { ProjectService, ProjectState } from '@xrengine/client-core/src/common/services/ProjectService'
import config from '@xrengine/common/src/config'
import { NO_PROXY, getMutableState, useHookstate, useMutableState } from '@xrengine/hyperflux'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import LoadingView from '@xrengine/ui/src/primitives/tailwind/LoadingView'

import { AuthState } from '../../../user/services/AuthService'
import { ProjectUpdateState } from '../../services/ProjectUpdateService'
import AddEditProjectModal from './AddEditProjectModal'
import UpdateEngineModal from './UpdateEngineModal'

export default function ProjectTopMenu() {
  const { t } = useTranslation()
  const projectState = useMutableState(ProjectState)
  const modalProcessing = useHookstate(false)

  ProjectService.useAPIListeners()

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

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

  const handleSubmit = async () => {
    const projectUpdateStatus = getMutableState(ProjectUpdateState)['tempProject'].get(NO_PROXY)
    try {
      await ProjectService.uploadProject({
        sourceURL: projectUpdateStatus.sourceURL,
        destinationURL: projectUpdateStatus.destinationURL,
        name: projectUpdateStatus.projectName,
        reset: true,
        commitSHA: projectUpdateStatus.selectedSHA,
        sourceBranch: projectUpdateStatus.selectedBranch,
        updateType: projectUpdateStatus.updateType,
        updateSchedule: projectUpdateStatus.updateSchedule
      })
      PopoverState.hidePopupover()
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }

  const authState = useMutableState(AuthState)
  const user = authState.user
  const githubProvider = user.identityProviders.value?.find((ip) => ip.type === 'github')

  const refreshGithubRepoAccess = () => {
    ProjectService.refreshGithubRepoAccess()
  }

  return (
    <div className="mb-4 flex justify-between gap-2">
      <div className="flex gap-2">
        {githubProvider != null && (
          <Button
            size="small"
            disabled={projectState.refreshingGithubRepoAccess.value}
            onClick={() => refreshGithubRepoAccess()}
            className="[&>*]:m-0"
          >
            {projectState.refreshingGithubRepoAccess.value ? (
              <span className="flex items-center gap-2">
                <LoadingView spinnerOnly className="inline-block h-6 w-6" />
                {t('admin:components.project.refreshingGithubRepoAccess')}
              </span>
            ) : (
              t('admin:components.project.refreshGithubRepoAccess')
            )}
          </Button>
        )}

        <Button
          startIcon={<HiArrowPath />}
          size="small"
          onClick={() => {
            PopoverState.showPopupover(<UpdateEngineModal />)
          }}
          disabled={config.client.localBuildOrDev}
          endIcon={
            !config.client.localBuildOrDev && projectState.rebuilding.value ? (
              <LoadingView spinnerOnly className="h-6 w-6" />
            ) : undefined
          }
        >
          {!config.client.localBuildOrDev && projectState.rebuilding.value
            ? t('admin:components.project.rebuilding')
            : t('admin:components.project.updateAndRebuild')}
        </Button>
        <Button
          startIcon={<HiPlus />}
          size="small"
          onClick={() => {
            PopoverState.showPopupover(<AddEditProjectModal onSubmit={handleSubmit} update={false} />)
          }}
        >
          {t('admin:components.project.addProject')}
        </Button>
      </div>
    </div>
  )
}
