import React from 'react'
import { useTranslation } from 'react-i18next'

import { useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { EditorComponentType, commitProperty, updateProperty } from '@xrengine/editor/src/components/properties/Util'
import { PersistentAnchorComponent } from '@xrengine/spatial/src/xr/XRAnchorComponents'
import { MdAnchor } from 'react-icons/md'
import InputGroup from '../../input/Group'
import StringInput from '../../input/String'
import NodeEditor from '../nodeEditor'

export const PersistentAnchorNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const anchor = useComponent(props.entity, PersistentAnchorComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.persistent-anchor.name')}
      description={t('editor:properties.persistent-anchor.description')}
      icon={<PersistentAnchorNodeEditor.iconComponent />}
    >
      <InputGroup name="Volume" label={t('editor:properties.persistent-anchor.lbl-name')}>
        <StringInput
          value={anchor.name.value}
          onChange={updateProperty(PersistentAnchorComponent, 'name')}
          onRelease={commitProperty(PersistentAnchorComponent, 'name')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

PersistentAnchorNodeEditor.iconComponent = MdAnchor

export default PersistentAnchorNodeEditor
