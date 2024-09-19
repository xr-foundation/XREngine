
import { t } from 'i18next'

import { ITableHeadCell } from '../Table'

type IdType =
  | 'select'
  | 'id'
  | 'name'
  | 'accountIdentifier'
  | 'lastLogin'
  | 'acceptedTOS'
  | 'isGuest'
  | 'action'
  | 'avatar'

export type UserRowType = Record<IdType, string | JSX.Element | undefined>

interface IUserColumn extends ITableHeadCell {
  id: IdType
}

export const userColumns: IUserColumn[] = [
  { id: 'id', label: t('admin:components.user.columns.id') },
  { id: 'name', sortable: true, label: t('admin:components.user.columns.name') },
  { id: 'avatar', label: t('admin:components.user.columns.avatar') },
  { id: 'accountIdentifier', label: t('admin:components.user.columns.accountIdentifier') },
  { id: 'lastLogin', label: t('admin:components.user.columns.lastLogin') },
  { id: 'acceptedTOS', sortable: true, label: t('admin:components.user.columns.acceptedTOS') },
  { id: 'isGuest', sortable: true, label: t('admin:components.user.columns.isGuest') },
  { id: 'action', label: t('admin:components.user.columns.action') }
]
