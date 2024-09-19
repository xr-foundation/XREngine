import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { isClient } from '@xrengine/common/src/utils/getEnvironment'
import { getComponent, hasComponent, UUIDComponent } from '@xrengine/ecs'
import { EditorComponentType } from '@xrengine/editor/src/components/properties/Util'
import { EditorControlFunctions } from '@xrengine/editor/src/functions/EditorControlFunctions'
import { GrabbableComponent } from '@xrengine/engine/src/interaction/components/GrabbableComponent'
import { InteractableComponent } from '@xrengine/engine/src/interaction/components/InteractableComponent'
import { grabbableInteractMessage } from '@xrengine/engine/src/interaction/functions/grabbableFunctions'
import { GiGrab } from 'react-icons/gi'
import NodeEditor from '../nodeEditor'

export const GrabbableComponentNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  useEffect(() => {
    if (isClient) {
      if (!hasComponent(props.entity, InteractableComponent)) {
        EditorControlFunctions.addOrRemoveComponent([props.entity], InteractableComponent, true, {
          label: grabbableInteractMessage,
          callbacks: [
            {
              callbackID: GrabbableComponent.grabbableCallbackName,
              target: getComponent(props.entity, UUIDComponent)
            }
          ]
        })
      }
    }
  }, [])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.grabbable.name')}
      description={t('editor:properties.grabbable.description')}
      icon={<GrabbableComponentNodeEditor.iconComponent />}
    >
      <div id={'grabbable-component'}></div>
    </NodeEditor>
  )
}

GrabbableComponentNodeEditor.iconComponent = GiGrab

export default GrabbableComponentNodeEditor
