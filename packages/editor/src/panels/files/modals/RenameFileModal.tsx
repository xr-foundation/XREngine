
import React from 'react'
import { useTranslation } from 'react-i18next'

import { PopoverState } from '@xrengine/client-core/src/common/services/PopoverState'
import { useMutation } from '@xrengine/common'
import { fileBrowserPath } from '@xrengine/common/src/schema.type.module'
import { isValidFileName } from '@xrengine/common/src/utils/validateFileName'
import { useHookstate } from '@xrengine/hyperflux'
import Input from '@xrengine/ui/src/primitives/tailwind/Input'
import Modal from '@xrengine/ui/src/primitives/tailwind/Modal'
import { FileDataType } from '../../../constants/AssetTypes'

export default function RenameFileModal({ projectName, file }: { projectName: string; file: FileDataType }) {
  const { t } = useTranslation()
  const newFileName = useHookstate(file.name)
  const fileService = useMutation(fileBrowserPath)
  const isValid = isValidFileName(newFileName.value)

  const handleSubmit = async () => {
    const name = newFileName.value
    if (isValidFileName(name)) {
      fileService.update(null, {
        oldProject: projectName,
        newProject: projectName,
        oldName: file.fullName,
        newName: file.isFolder ? name : `${name}.${file.type}`,
        oldPath: file.path,
        newPath: file.path,
        isCopy: false
      })
    }
    PopoverState.hidePopupover()
  }

  return (
    <Modal
      title={t('editor:layout.filebrowser.renameFile')}
      className="w-[50vw] max-w-2xl"
      onSubmit={handleSubmit}
      onClose={PopoverState.hidePopupover}
      submitButtonDisabled={!isValid}
    >
      <Input
        value={newFileName.value}
        onChange={(event) => newFileName.set(event.target.value)}
        errorBorder={!isValid}
        description={t('editor:dialog.saveNewScene.info-name')}
        error={!isValid ? t('editor:layout.filebrowser.renameFileError') : undefined}
      />
    </Modal>
  )
}
