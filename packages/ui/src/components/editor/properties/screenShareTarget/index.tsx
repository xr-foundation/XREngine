import { TbScreenShare } from 'react-icons/tb'

import React from 'react'
import { useTranslation } from 'react-i18next'

import { EditorComponentType } from '@xrengine/editor/src/components/properties/Util'
import { ScreenshareTargetComponent } from '@xrengine/engine/src/scene/components/ScreenshareTargetComponent'
import NodeEditor from '../nodeEditor'

export const ScreenshareTargetNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  return (
    <NodeEditor
      {...props}
      component={ScreenshareTargetComponent}
      name={t('editor:properties.screenshare.name')}
      description={t('editor:properties.screenshare.description')}
      icon={<ScreenshareTargetNodeEditor.iconComponent />}
    />
  )
}

ScreenshareTargetNodeEditor.iconComponent = TbScreenShare

export default ScreenshareTargetNodeEditor
