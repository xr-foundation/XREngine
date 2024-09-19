import React from 'react'
import { useTranslation } from 'react-i18next'
import { HiEye, HiTrash } from 'react-icons/hi2'

import { useFind, useSearch } from '@xrengine/common'
import { StaticResourceType, staticResourcePath } from '@xrengine/common/src/schema.type.module'
import ConfirmDialog from '@xrengine/ui/src/components/tailwind/ConfirmDialog'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'

import { API } from '@xrengine/common'
import { PopoverState } from '../../../common/services/PopoverState'
import DataTable from '../../common/Table'
import { resourceColumns } from '../../common/constants/resources'
import AddEditResourceModal from './AddEditResourceModal'

const RESOURCE_PAGE_LIMIT = 25

export default function ResourceTable({ search }: { search: string }) {
  const { t } = useTranslation()
  const resourceQuery = useFind(staticResourcePath, {
    query: {
      action: 'admin',
      $limit: RESOURCE_PAGE_LIMIT,
      $sort: {
        key: 1
      }
    }
  })

  useSearch(
    resourceQuery,
    {
      key: {
        $like: `%${search}%`
      }
    },
    search
  )

  const createData = (el: StaticResourceType) => {
    return {
      id: el.id,
      key: el.key,
      mimeType: el.mimeType,
      project: el.project,
      action: (
        <div className="flex items-center justify-start gap-3">
          <Button
            onClick={() => {
              PopoverState.showPopupover(<AddEditResourceModal selectedResource={el} />)
            }}
            rounded="full"
            className="h-8 w-8 justify-center border border-theme-primary bg-transparent p-0"
          >
            <HiEye className="place-self-center text-theme-primary" />
          </Button>
          <Button
            rounded="full"
            className="h-8 w-8 justify-center border border-theme-primary bg-transparent p-0"
            onClick={() => {
              PopoverState.showPopupover(
                <ConfirmDialog
                  text={`${t('admin:components.resources.confirmResourceDelete')} '${el.key}'?`}
                  onSubmit={async () => {
                    await API.instance.service(staticResourcePath).remove(el.id)
                  }}
                />
              )
            }}
          >
            <HiTrash className="place-self-center text-theme-iconRed" />
          </Button>
        </div>
      )
    }
  }

  const createRows = () =>
    resourceQuery.data?.map((el: StaticResourceType) => {
      return createData(el)
    })

  return <DataTable query={resourceQuery} columns={resourceColumns} rows={createRows()} />
}
