
import Modal from '@xrengine/ui/src/primitives/tailwind/Modal'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { PopoverState } from '../../../common/services/PopoverState'
import { ProjectHistory } from './ProjectHistory'

export const ProjectHistoryModal = ({ projectId, projectName }: { projectId: string; projectName: string }) => {
  const { t } = useTranslation()
  return (
    <Modal
      className="relative max-h-full w-[75vw] p-4"
      title={t('admin:components.project.projectHistory')}
      onClose={() => {
        PopoverState.hidePopupover()
      }}
    >
      <ProjectHistory projectId={projectId} projectName={projectName} />
    </Modal>
  )
}
