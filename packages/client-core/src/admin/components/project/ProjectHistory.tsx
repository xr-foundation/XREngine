
import { useFind } from '@xrengine/common'
import { projectHistoryPath } from '@xrengine/common/src/schema.type.module'
import { ProjectHistoryType } from '@xrengine/common/src/schemas/projects/project-history.schema'

import { toDisplayDateTime } from '@xrengine/common/src/utils/datetime-sql'
import AvatarImage from '@xrengine/ui/src/primitives/tailwind/AvatarImage'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import { TablePagination } from '@xrengine/ui/src/primitives/tailwind/Table'
import Text from '@xrengine/ui/src/primitives/tailwind/Text'
import Tooltip from '@xrengine/ui/src/primitives/tailwind/Tooltip'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FaSortAmountDown, FaSortAmountUpAlt } from 'react-icons/fa'
import { FiRefreshCw } from 'react-icons/fi'

const PROJECT_HISTORY_PAGE_LIMIT = 10

const getRelativeURLFromProject = (projectName: string, url: string) => {
  const prefix = `projects/${projectName}/`
  if (url.startsWith(prefix)) {
    return url.replace(prefix, '')
  }
  return url
}

const getResourceURL = (projectName: string, url: string, resourceType: 'resource' | 'scene') => {
  const relativeURL = getRelativeURLFromProject(projectName, url)
  const resourceURL =
    resourceType === 'resource'
      ? `/projects/${projectName}/${relativeURL}`
      : `/studio?project=${projectName}&scenePath=${url}`
  return {
    relativeURL,
    resourceURL
  }
}

function HistoryLog({ projectHistory, projectName }: { projectHistory: ProjectHistoryType; projectName: string }) {
  const { t } = useTranslation()

  const RenderAction = () => {
    if (projectHistory.action === 'LOCATION_PUBLISHED' || projectHistory.action === 'LOCATION_UNPUBLISHED') {
      const actionDetail = JSON.parse(projectHistory.actionDetail) as {
        locationName: string
        sceneURL: string
        sceneId: string
      }

      const { relativeURL, resourceURL } = getResourceURL(projectName, actionDetail.sceneURL, 'scene')

      return (
        <>
          <Text>
            {projectHistory.action === 'LOCATION_PUBLISHED'
              ? t('admin:components.history.publishedLocation')
              : t('admin:components.history.unpublishedLocation')}
          </Text>

          {projectHistory.action === 'LOCATION_PUBLISHED' ? (
            <a href={`/location/${actionDetail.locationName}`}>
              <Text className="underline-offset-4 hover:underline" fontWeight="semibold">
                {actionDetail.locationName}
              </Text>
            </a>
          ) : (
            <Text fontWeight="semibold">{actionDetail.locationName}</Text>
          )}

          <Text>{t('admin:components.history.fromScene')}</Text>

          <Text href={resourceURL} component="a" className="underline-offset-4 hover:underline" fontWeight="semibold">
            {relativeURL}.
          </Text>
        </>
      )
    } else if (projectHistory.action === 'LOCATION_MODIFIED') {
      const actionDetail = JSON.parse(projectHistory.actionDetail) as {
        locationName: string
      }

      return (
        <>
          <Text>{t('admin:components.history.modifiedLocation')}</Text>

          <a href={`/location/${actionDetail.locationName}`}>
            <Text className="underline-offset-4 hover:underline" fontWeight="semibold">
              {actionDetail.locationName}
            </Text>
          </a>
        </>
      )
    } else if (projectHistory.action === 'PERMISSION_CREATED' || projectHistory.action === 'PERMISSION_REMOVED') {
      const actionDetail = JSON.parse(projectHistory.actionDetail) as {
        userName: string
        userId: string
        permissionType: string
      }

      return (
        <>
          <Text>
            {projectHistory.action === 'PERMISSION_CREATED'
              ? t('admin:components.history.added')
              : t('admin:components.history.removed')}
          </Text>

          <Text fontWeight="semibold">{actionDetail.permissionType}</Text>

          <Text>{t('admin:components.history.accessTo')}</Text>

          <Tooltip content={`UserId: ${actionDetail.userId}`}>
            <Text>{actionDetail.userName}</Text>
          </Tooltip>
        </>
      )
    } else if (projectHistory.action === 'PERMISSION_MODIFIED') {
      const actionDetail = JSON.parse(projectHistory.actionDetail) as {
        userName: string
        userId: string
        oldPermissionType: string
        newPermissionType: string
      }

      return (
        <>
          <Text>{t('admin:components.history.updatePermission')}</Text>
          <Tooltip content={`UserId: ${actionDetail.userId}`}>
            <Text>{actionDetail.userName}</Text>
          </Tooltip>
          <Text>{t('admin:components.setting.from').toLowerCase()}</Text>
          <Text fontWeight="semibold">{actionDetail.oldPermissionType}</Text>
          <Text>{t('admin:components.setting.to').toLowerCase()}</Text>
          <Text fontWeight="semibold">{actionDetail.newPermissionType}</Text>
        </>
      )
    } else if (projectHistory.action === 'PROJECT_CREATED') {
      return <Text>created the project</Text>
    } else if (
      projectHistory.action === 'RESOURCE_CREATED' ||
      projectHistory.action === 'RESOURCE_REMOVED' ||
      projectHistory.action === 'SCENE_CREATED' ||
      projectHistory.action === 'SCENE_REMOVED'
    ) {
      const object =
        projectHistory.action === 'RESOURCE_CREATED' || projectHistory.action === 'RESOURCE_REMOVED'
          ? 'resource'
          : 'scene'

      const actionDetail = JSON.parse(projectHistory.actionDetail) as {
        url: string
      }

      const { relativeURL, resourceURL } = getResourceURL(projectName, actionDetail.url, object)

      return (
        <>
          <Text>
            {projectHistory.action.endsWith('CREATED')
              ? t('admin:components.history.created')
              : t('admin:components.history.removed')}{' '}
            {object}
          </Text>

          {projectHistory.action.endsWith('CREATED') ? (
            <Text href={resourceURL} component="a" fontWeight="semibold" className="underline-offset-4 hover:underline">
              {relativeURL}
            </Text>
          ) : (
            <Text fontWeight="semibold">{relativeURL}</Text>
          )}
        </>
      )
    } else if (projectHistory.action === 'RESOURCE_RENAMED' || projectHistory.action === 'SCENE_RENAMED') {
      const object = projectHistory.action === 'RESOURCE_RENAMED' ? 'resource' : 'scene'
      const actionDetail = JSON.parse(projectHistory.actionDetail) as {
        oldURL: string
        newURL: string
      }

      const { relativeURL: oldRelativeURL } = getResourceURL(projectName, actionDetail.oldURL, object)
      const { relativeURL: newRelativeURL, resourceURL: newResourceURL } = getResourceURL(
        projectName,
        actionDetail.newURL,
        object
      )

      return (
        <>
          <Text>
            {t('admin:components.history.renamed')} {object} {t('admin:components.setting.from').toLowerCase()}
          </Text>

          <Text fontWeight="semibold">{oldRelativeURL}</Text>
          <Text>{t('admin:components.setting.to').toLowerCase()}</Text>
          <Text
            href={newResourceURL}
            component="a"
            fontWeight="semibold"
            className="underline-offset-4 hover:underline"
          >
            {getRelativeURLFromProject(projectName, newRelativeURL)}
          </Text>
        </>
      )
    } else if (projectHistory.action === 'RESOURCE_MODIFIED' || projectHistory.action === 'SCENE_MODIFIED') {
      const object = projectHistory.action === 'RESOURCE_MODIFIED' ? 'resource' : 'scene'
      const actionDetail = JSON.parse(projectHistory.actionDetail) as {
        url: string
      }

      const { relativeURL, resourceURL } = getResourceURL(projectName, actionDetail.url, object)

      return (
        <>
          <Text>
            {t('admin:components.history.modified')} {object}
          </Text>
          <Text href={resourceURL} component="a" fontWeight="semibold" className="underline-offset-4 hover:underline">
            {relativeURL}
          </Text>
        </>
      )
    } else if (projectHistory.action === 'TAGS_MODIFIED') {
      const actionDetail = JSON.parse(projectHistory.actionDetail) as {
        url: string
      }

      const { relativeURL, resourceURL } = getResourceURL(projectName, actionDetail.url, 'resource')

      return (
        <>
          <Text>{t('admin:components.history.updatedTags')}</Text>
          <Text href={resourceURL} component="a" fontWeight="semibold" className="underline-offset-4 hover:underline">
            {relativeURL}
          </Text>
        </>
      )
    } else if (projectHistory.action === 'THUMBNAIL_CREATED') {
      const actionDetail = JSON.parse(projectHistory.actionDetail) as {
        thumbnailURL: string
        url: string
      }

      const { relativeURL: relativeThumbnailURL, resourceURL: thumbnailResourceURL } = getResourceURL(
        projectName,
        actionDetail.thumbnailURL,
        'resource'
      )

      const { relativeURL, resourceURL } = getResourceURL(projectName, actionDetail.url, 'resource')

      return (
        <>
          <Text>{t('admin:components.history.createdThumbnail')}</Text>
          <Text
            href={thumbnailResourceURL}
            component="a"
            fontWeight="semibold"
            className="underline-offset-4 hover:underline"
          >
            {relativeThumbnailURL}
          </Text>
          <Text>{t('admin:components.setting.for').toLowerCase()}</Text>
          <Text href={resourceURL} component="a" fontWeight="semibold" className="underline-offset-4 hover:underline">
            {relativeURL}
          </Text>
        </>
      )
    } else if (projectHistory.action === 'THUMBNAIL_MODIFIED') {
      const actionDetail = JSON.parse(projectHistory.actionDetail) as {
        oldThumbnailURL: string
        newThumbnailURL: string
        url: string
      }

      const { relativeURL: relativeThumbnailURL, resourceURL: thumbnailResourceURL } = getResourceURL(
        projectName,
        actionDetail.newThumbnailURL,
        'resource'
      )

      const { relativeURL, resourceURL } = getResourceURL(projectName, actionDetail.url, 'resource')

      return (
        <>
          <Text>{t('admin:components.history.updatedThumbnail')}</Text>
          <Text href={resourceURL} component="a" fontWeight="semibold" className="underline-offset-4 hover:underline">
            {relativeURL}
          </Text>
          <Text>{t('admin:components.setting.to').toLowerCase()}</Text>
          <Text
            href={thumbnailResourceURL}
            component="a"
            fontWeight="semibold"
            className="underline-offset-4 hover:underline"
          >
            {relativeThumbnailURL}
          </Text>
        </>
      )
    } else if (projectHistory.action === 'THUMBNAIL_REMOVED') {
      const actionDetail = JSON.parse(projectHistory.actionDetail) as {
        url: string
      }

      const { relativeURL, resourceURL } = getResourceURL(projectName, actionDetail.url, 'resource')

      return (
        <>
          <Text>{t('admin:components.history.removedThumbnail')}</Text>
          <Text href={resourceURL} component="a" fontWeight="semibold" className="underline-offset-4 hover:underline">
            {relativeURL}
          </Text>
        </>
      )
    }

    return null
  }

  return (
    <div className="mb-3 flex w-full items-center justify-between gap-x-2 rounded-lg bg-[#191B1F] px-5 py-2">
      <AvatarImage
        className="inline-grid min-h-10 min-w-10 rounded-full"
        src={projectHistory.userAvatarURL}
        name={projectHistory.userName}
      />

      <div className="flex w-full flex-wrap items-center justify-start gap-x-2 [&>*]:whitespace-nowrap">
        <Text>{projectHistory.userName}</Text>

        <RenderAction />
      </div>

      <Text className="text-nowrap">{toDisplayDateTime(projectHistory.createdAt)}</Text>
    </div>
  )
}

export const ProjectHistory = ({ projectId, projectName }: { projectId: string; projectName: string }) => {
  const { t } = useTranslation()
  const projectHistoryQuery = useFind(projectHistoryPath, {
    query: {
      projectId: projectId,
      $sort: {
        createdAt: -1
      },
      $limit: PROJECT_HISTORY_PAGE_LIMIT
    }
  })

  const sortOrder = projectHistoryQuery.sort.createdAt

  const toggleSortOrder = () => {
    projectHistoryQuery.setSort({
      createdAt: sortOrder === -1 ? 1 : -1
    })
  }

  useEffect(() => {
    projectHistoryQuery.refetch()
  }, [])

  return (
    <div className="w-full flex-row justify-between gap-5 px-2">
      <div className="mb-4 flex items-center justify-start gap-3">
        <Button onClick={toggleSortOrder} endIcon={sortOrder === -1 ? <FaSortAmountDown /> : <FaSortAmountUpAlt />}>
          {sortOrder === -1 ? t('admin:components.common.newestFirst') : t('admin:components.common.oldestFirst')}
        </Button>

        <Button startIcon={<FiRefreshCw />} onClick={projectHistoryQuery.refetch}>
          {t('admin:components.common.refresh')}
        </Button>
      </div>

      {projectHistoryQuery.data &&
        projectHistoryQuery.data.map((projectHistory, index) => (
          <HistoryLog key={index} projectHistory={projectHistory} projectName={projectName} />
        ))}

      <TablePagination
        totalPages={Math.ceil(projectHistoryQuery.total / projectHistoryQuery.limit)}
        currentPage={projectHistoryQuery.page}
        onPageChange={(newPage) => {
          projectHistoryQuery.setPage(newPage)
          projectHistoryQuery.refetch()
        }}
      />
    </div>
  )
}
