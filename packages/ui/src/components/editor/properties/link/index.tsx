import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { PiLinkBreak } from 'react-icons/pi'

import { getComponent, hasComponent, useComponent, UUIDComponent } from '@xrengine/ecs'
import { commitProperty, EditorComponentType, updateProperty } from '@xrengine/editor/src/components/properties/Util'
import { EditorControlFunctions } from '@xrengine/editor/src/functions/EditorControlFunctions'
import {
  InteractableComponent,
  XRUIActivationType
} from '@xrengine/engine/src/interaction/components/InteractableComponent'
import { getEntityErrors } from '@xrengine/engine/src/scene/components/ErrorComponent'
import { LinkComponent } from '@xrengine/engine/src/scene/components/LinkComponent'
import BooleanInput from '../../input/Boolean'
import InputGroup from '../../input/Group'
import { ControlledStringInput } from '../../input/String'
import NodeEditor from '../nodeEditor'

/**
 * LinkNodeEditor component used to provide the editor view to customize link properties.
 */
export const LinkNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const linkComponent = useComponent(props.entity, LinkComponent)
  const errors = getEntityErrors(props.entity, LinkComponent)

  useEffect(() => {
    if (!hasComponent(props.entity, InteractableComponent)) {
      EditorControlFunctions.addOrRemoveComponent([props.entity], InteractableComponent, true, {
        label: LinkComponent.interactMessage,
        uiInteractable: false,
        clickInteract: true,
        uiActivationType: XRUIActivationType.hover,
        callbacks: [
          {
            callbackID: LinkComponent.linkCallbackName,
            target: getComponent(props.entity, UUIDComponent)
          }
        ]
      })
    }
  }, [])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.linkComp.title')}
      description={t('editor:properties.linkComp.description')}
      icon={<LinkNodeEditor.iconComponent />}
    >
      {errors
        ? Object.entries(errors).map(([err, message]) => (
            <div key={err} style={{ marginTop: 2, color: '#FF8C00' }}>
              {'Error: ' + err + '--' + message}
            </div>
          ))
        : null}
      <InputGroup name="Navigate Path" label={t('editor:properties.linkComp.lbl-navigateScene')}>
        <BooleanInput value={linkComponent.sceneNav.value} onChange={commitProperty(LinkComponent, 'sceneNav')} />
      </InputGroup>

      {linkComponent.sceneNav.value ? (
        <InputGroup name="Location" label={t('editor:properties.linkComp.lbl-locaiton')}>
          <ControlledStringInput
            value={linkComponent.location.value}
            onChange={updateProperty(LinkComponent, 'location')}
            onRelease={commitProperty(LinkComponent, 'location')}
          />
        </InputGroup>
      ) : (
        <InputGroup name="LinkUrl" label={t('editor:properties.linkComp.lbl-url')}>
          <ControlledStringInput
            value={linkComponent.url.value}
            onChange={updateProperty(LinkComponent, 'url')}
            onRelease={commitProperty(LinkComponent, 'url')}
          />
        </InputGroup>
      )}
    </NodeEditor>
  )
}

LinkNodeEditor.iconComponent = PiLinkBreak

export default LinkNodeEditor
