
import React from 'react'
import { useTranslation } from 'react-i18next'
import { GrGithub } from 'react-icons/gr'
import {
  HiOutlineArrowPath,
  HiOutlineClock,
  HiOutlineCommandLine,
  HiOutlineExclamationCircle,
  HiOutlineFolder,
  HiOutlineTrash,
  HiOutlineUsers
} from 'react-icons/hi2'

import { NotificationService } from '@xrengine/client-core/src/common/services/NotificationService'
import { PopoverState } from '@xrengine/client-core/src/common/services/PopoverState'
import { ProjectService } from '@xrengine/client-core/src/common/services/ProjectService'
import { useFind, useSearch } from '@xrengine/common'
import config from '@xrengine/common/src/config'
import multiLogger from '@xrengine/common/src/logger'
import { ProjectType, projectPath } from '@xrengine/common/src/schema.type.module'
import { getMutableState, useHookstate } from '@xrengine/hyperflux'
import ConfirmDialog from '@xrengine/ui/src/components/tailwind/ConfirmDialog'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import CopyText from '@xrengine/ui/src/primitives/tailwind/CopyText'
import Toggle from '@xrengine/ui/src/primitives/tailwind/Toggle'
import Tooltip from '@xrengine/ui/src/primitives/tailwind/Tooltip'

import { toDisplayDateTime } from '@xrengine/common/src/utils/datetime-sql'
import DataTable from '../../common/Table'
import { ProjectRowType, projectsColumns } from '../../common/constants/project'
import { ProjectUpdateState } from '../../services/ProjectUpdateService'
import AddEditProjectModal from './AddEditProjectModal'
import ManageUserPermissionModal from './ManageUserPermissionModal'
import { ProjectHistoryModal } from './ProjectHistoryModal'

const logger = multiLogger.child({ component: 'client-core:ProjectTable' })

export default function ProjectTable(props: { search: string }) {
  const { t } = useTranslation()
  const activeProjectId = useHookstate<string | null>(null)
  const projectQuery = useFind(projectPath, {
    query: {
      allowed: true,
      $limit: 20,
      action: 'admin',
      $sort: {
        name: 1
      }
    }
  })

  useSearch(
    projectQuery,
    {
      $or: [
        {
          name: {
            $like: `%${props.search}%`
          }
        }
      ]
    },
    props.search
  )

  const handleEnabledChange = async (project: ProjectType) => {
    await ProjectService.setEnabled(project.id, !project.enabled)
    projectQuery.refetch()
  }

  const handleVisibilityChange = async (project: ProjectType) => {
    await ProjectService.setVisibility(project.id, project.visibility === 'private' ? 'public' : 'private')
    projectQuery.refetch()
  }

  const RowActions = ({ project }: { project: ProjectType }) => {
    const handleProjectUpdate = async () => {
      const projectUpdateStatus = getMutableState(ProjectUpdateState)[project.name].value
      await ProjectService.uploadProject({
        sourceURL: projectUpdateStatus.sourceURL,
        destinationURL: projectUpdateStatus.destinationURL,
        name: project.name,
        reset: true,
        commitSHA: projectUpdateStatus.selectedSHA,
        sourceBranch: projectUpdateStatus.selectedBranch,
        updateType: projectUpdateStatus.updateType,
        updateSchedule: projectUpdateStatus.updateSchedule
      }).catch((err) => {
        NotificationService.dispatchNotify(err.message, { variant: 'error' })
      })
      PopoverState.hidePopupover()
    }

    return (
      <div className="flex items-center justify-evenly p-1">
        <Button
          startIcon={<HiOutlineArrowPath />}
          size="small"
          className="mr-2 h-min whitespace-pre bg-theme-blue-secondary text-[#214AA6] disabled:opacity-50 dark:text-white"
          disabled={project.name === 'xrengine/default-project'}
          onClick={() =>
            PopoverState.showPopupover(
              <AddEditProjectModal update={true} inputProject={project} onSubmit={handleProjectUpdate} />
            )
          }
        >
          {t('admin:components.project.actions.update')}
        </Button>
        <Button
          startIcon={<GrGithub />}
          size="small"
          className="mr-2 h-min whitespace-pre bg-theme-blue-secondary text-[#214AA6] disabled:opacity-50 dark:text-white"
          disabled={!project || !project.repositoryPath || project.name === 'xrengine/default-project'}
          onClick={() => {
            PopoverState.showPopupover(
              <ConfirmDialog
                text={`${t('admin:components.project.confirmPushProjectToGithub')}? ${project.name} - ${
                  project.repositoryPath
                }`}
                onSubmit={async () => {
                  await ProjectService.pushProject(project.id)
                }}
              />
            )
          }}
        >
          {t('admin:components.project.actions.push')}
        </Button>

        <Button
          startIcon={<HiOutlineUsers />}
          size="small"
          className="mr-2 h-min whitespace-pre bg-theme-blue-secondary text-[#214AA6] disabled:opacity-50 dark:text-white"
          onClick={() => {
            activeProjectId.set(project.id)
            PopoverState.showPopupover(<ManageUserPermissionModal project={project} />)
          }}
        >
          {t('admin:components.project.actions.access')}
        </Button>
        <Button
          startIcon={<HiOutlineCommandLine />}
          size="small"
          className="mr-2 h-min whitespace-pre bg-theme-blue-secondary text-[#214AA6] disabled:opacity-50 dark:text-white"
          disabled={config.client.localBuildOrDev}
          onClick={() => {
            PopoverState.showPopupover(
              <ConfirmDialog
                text={`${t('admin:components.project.confirmProjectInvalidate')} '${project.name}'?`}
                onSubmit={async () => {
                  await ProjectService.invalidateProjectCache(project.name)
                }}
              />
            )
          }}
        >
          {t('admin:components.project.actions.invalidateCache')}
        </Button>
        <Button
          startIcon={<HiOutlineFolder />}
          size="small"
          className="mr-2 h-min whitespace-pre bg-theme-blue-secondary text-[#214AA6] disabled:opacity-50 dark:text-white"
        >
          {t('admin:components.common.view')}
        </Button>
        <Button
          startIcon={<HiOutlineClock />}
          size="small"
          className="mr-2 h-min whitespace-pre bg-theme-blue-secondary text-[#214AA6] disabled:opacity-50 dark:text-white"
          onClick={() => {
            PopoverState.showPopupover(<ProjectHistoryModal projectId={project.id} projectName={project.name} />)
          }}
        >
          {t('admin:components.project.actions.history')}
        </Button>
        <Button
          startIcon={<HiOutlineTrash />}
          size="small"
          className="h-min whitespace-pre bg-theme-blue-secondary text-[#214AA6] disabled:opacity-50 dark:text-white"
          disabled={project.name === 'xrengine/default-project'}
          onClick={() => {
            PopoverState.showPopupover(
              <ConfirmDialog
                text={`${t('admin:components.project.confirmProjectDelete')} '${project.name}'?`}
                onSubmit={async () => {
                  await ProjectService.removeProject(project.id).catch((err) => logger.error(err))
                }}
              />
            )
          }}
        >
          {t('admin:components.common.remove')}
        </Button>
      </div>
    )
  }

  const createRows = (rows: readonly ProjectType[]): ProjectRowType[] =>
    rows.map((row) => {
      return {
        name: (
          <div className="flex items-center gap-2">
            <a
              target="_blank"
              href={`/studio?project=${row.name}`}
              className={row.needsRebuild ? 'text-blue-400' : 'text-theme-primary'}
            >
              {row.name}
            </a>
            {!!row.needsRebuild && (
              <Tooltip content={t('admin:components.project.outdatedBuild')} position="right center">
                <HiOutlineExclamationCircle className="text-orange-400" size={22} />
              </Tooltip>
            )}
            {!!row.hasLocalChanges && (
              <Tooltip content={t('admin:components.project.hasLocalChanges')} position="right center">
                <HiOutlineExclamationCircle className="text-yellow-400" size={22} />
              </Tooltip>
            )}
          </div>
        ),
        projectVersion: row.version,
        enabled: (
          <Toggle
            disabled={row.name === 'xrengine/default-project'}
            value={row.enabled}
            onChange={() => handleEnabledChange(row)}
          />
        ),
        visibility: <Toggle value={row.visibility === 'public'} onChange={() => handleVisibilityChange(row)} />,
        commitSHA: (
          <span className="flex items-center justify-between">
            <Tooltip content={row.commitSHA || ''}>
              <>{row.commitSHA?.slice(0, 8)}</>
            </Tooltip>{' '}
            <CopyText text={row.commitSHA || ''} className="ml-1" />
          </span>
        ),
        commitDate: toDisplayDateTime(row.commitDate),
        actions: <RowActions project={row} />
      }
    })

  return <DataTable query={projectQuery} columns={projectsColumns} rows={createRows(projectQuery.data)} />
}
