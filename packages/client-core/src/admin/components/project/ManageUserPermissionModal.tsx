
import React from 'react'
import { useTranslation } from 'react-i18next'
import { MdOutlineRemoveCircleOutline } from 'react-icons/md'

import { NotificationService } from '@xrengine/client-core/src/common/services/NotificationService'
import { PopoverState } from '@xrengine/client-core/src/common/services/PopoverState'
import { ProjectService } from '@xrengine/client-core/src/common/services/ProjectService'
import { AuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { userHasAccess } from '@xrengine/client-core/src/user/userHasAccess'
import { useFind } from '@xrengine/common'
import {
  InviteCode,
  ProjectPermissionType,
  ProjectType,
  projectPermissionPath
} from '@xrengine/common/src/schema.type.module'
import { ImmutableObject, getMutableState, useHookstate } from '@xrengine/hyperflux'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import Input from '@xrengine/ui/src/primitives/tailwind/Input'
import Modal from '@xrengine/ui/src/primitives/tailwind/Modal'
import Text from '@xrengine/ui/src/primitives/tailwind/Text'
import Toggle from '@xrengine/ui/src/primitives/tailwind/Toggle'

export default function ManageUserPermissionModal({ project }: { project: ImmutableObject<ProjectType> }) {
  const { t } = useTranslation()
  const selfUser = useHookstate(getMutableState(AuthState)).user
  const userInviteCode = useHookstate('' as InviteCode)
  const userInviteCodeError = useHookstate(undefined)
  const selfUserPermission =
    project?.projectPermissions?.find((permission) => permission.userId === selfUser.id.value)?.type === 'owner' ||
    userHasAccess('admin:admin')
      ? 'owner'
      : 'user'

  const projectPermissionsFindQuery = useFind(projectPermissionPath, {
    query: {
      projectId: project.id,
      paginate: false
    }
  })

  const handleCreatePermission = async () => {
    if (!userInviteCode.value) {
      userInviteCodeError.set(t('admin:components.project.inviteCodeCantEmpty'))
      return
    }
    try {
      await ProjectService.createPermission(userInviteCode.value, project.id, 'reviewer')
      projectPermissionsFindQuery.refetch()
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }

  const handlePatchPermission = async (permission: ProjectPermissionType) => {
    try {
      await ProjectService.patchPermission(permission.id, permission.type === 'owner' ? 'user' : 'owner')
      projectPermissionsFindQuery.refetch()
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }

  const handleRemovePermission = async (id: string) => {
    try {
      await ProjectService.removePermission(id)
      projectPermissionsFindQuery.refetch()
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }

  return (
    <Modal
      title={t('admin:components.project.userAccess')}
      className="w-[50vw] max-w-2xl"
      onSubmit={() => {
        handleCreatePermission()
      }}
      hideFooter={selfUserPermission !== 'owner'}
      onClose={() => PopoverState.hidePopupover()}
    >
      {selfUserPermission === 'owner' && (
        <Input
          label={t('admin:components.project.userInviteCode')}
          value={userInviteCode.value}
          onChange={(event) => userInviteCode.set(event.target.value as InviteCode)}
          error={userInviteCodeError.value}
        />
      )}
      <div className="grid gap-4">
        {projectPermissionsFindQuery.data.map((permission) => (
          <div key={permission.id} className="flex items-center gap-2">
            <Text fontSize="sm">
              {permission.userId === selfUser.id.value ? `${permission.user?.name} (you)` : permission.user?.name}
            </Text>
            <Text fontSize="sm" theme="secondary">
              {permission.type}
            </Text>
            <Toggle
              value={permission.type === 'owner'}
              onChange={() => handlePatchPermission(permission)}
              disabled={
                selfUserPermission !== 'owner' ||
                selfUser.id.value === permission.userId ||
                projectPermissionsFindQuery.data.length === 1
              }
            />
            <Button
              startIcon={<MdOutlineRemoveCircleOutline />}
              title="Remove Access"
              onClick={() => handleRemovePermission(permission.id)}
            />
          </div>
        ))}
      </div>
    </Modal>
  )
}
