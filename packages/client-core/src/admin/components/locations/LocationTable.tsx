
import React from 'react'
import { useTranslation } from 'react-i18next'
import { HiPencil, HiTrash } from 'react-icons/hi2'
import { validate as isValidUUID } from 'uuid'

import { PopoverState } from '@xrengine/client-core/src/common/services/PopoverState'
import { useFind, useMutation, useSearch } from '@xrengine/common'
import { locationPath, LocationType } from '@xrengine/common/src/schema.type.module'
import ConfirmDialog from '@xrengine/ui/src/components/tailwind/ConfirmDialog'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'

import { userHasAccess } from '../../../user/userHasAccess'
import { locationColumns, LocationRowType } from '../../common/constants/location'
import DataTable from '../../common/Table'
import AddEditLocationModal from './AddEditLocationModal'

const transformLink = (link: string) => link.toLowerCase().replace(' ', '-')

export default function LocationTable({ search }: { search: string }) {
  const { t } = useTranslation()

  const adminLocationQuery = useFind(locationPath, {
    query: {
      action: 'admin',
      $limit: 20,
      $sort: {
        name: 1
      }
    }
  })

  useSearch(
    adminLocationQuery,
    {
      $or: [
        {
          id: isValidUUID(search) ? search : undefined
        },
        {
          name: {
            $like: `%${search}%`
          }
        },
        {
          sceneId: isValidUUID(search) ? search : undefined
        }
      ]
    },
    search
  )

  const adminLocationRemove = useMutation(locationPath).remove

  const createRows = (rows: readonly LocationType[]): LocationRowType[] =>
    rows.map((row) => ({
      name: <a href={`/location/${transformLink(row.name)}`}>{row.name}</a>,
      sceneId: (
        <a href={`/studio?projectName=${row.sceneAsset.project!}&scenePath=${row.sceneAsset.key}`}>{row.sceneId}</a>
      ),
      maxUsersPerInstance: row.maxUsersPerInstance.toString(),
      scene: row.slugifiedName,
      locationType: row.locationSetting.locationType,
      videoEnabled: row.locationSetting.videoEnabled
        ? t('admin:components.common.yes')
        : t('admin:components.common.no'),
      action: (
        <div className="flex items-center justify-start gap-3">
          <Button
            rounded="full"
            variant="outline"
            className="h-8 w-8"
            disabled={!userHasAccess('location:write')}
            title={t('admin:components.common.view')}
            onClick={() => PopoverState.showPopupover(<AddEditLocationModal location={row} />)}
          >
            <HiPencil className="place-self-center text-theme-iconGreen" />
          </Button>
          <Button
            rounded="full"
            variant="outline"
            className="h-8 w-8"
            title={t('admin:components.common.delete')}
            onClick={() =>
              PopoverState.showPopupover(
                <ConfirmDialog
                  text={`${t('admin:components.location.confirmLocationDelete')} '${row.name}'?`}
                  onSubmit={async () => {
                    await adminLocationRemove(row.id)
                  }}
                />
              )
            }
          >
            <HiTrash className="place-self-center text-theme-iconRed" />
          </Button>
        </div>
      )
    }))

  return <DataTable query={adminLocationQuery} columns={locationColumns} rows={createRows(adminLocationQuery.data)} />
}
