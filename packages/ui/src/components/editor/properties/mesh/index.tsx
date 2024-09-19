import React from 'react'
import { useTranslation } from 'react-i18next'

import { getComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Entity, EntityUUID } from '@xrengine/ecs/src/Entity'
import { EditorComponentType } from '@xrengine/editor/src/components/properties/Util'
import { MeshComponent } from '@xrengine/spatial/src/renderer/components/MeshComponent'
import { GiMeshBall } from 'react-icons/gi'
import { HiMinus, HiPlusSmall } from 'react-icons/hi2'
import { Material } from 'three'
import Accordion from '../../../../primitives/tailwind/Accordion'
import MaterialEditor from '../../panels/Properties/material'
import NodeEditor from '../nodeEditor'
import GeometryEditor from './geometryEditor'

const MeshNodeEditor: EditorComponentType = (props: { entity: Entity }) => {
  const entity = props.entity
  const { t } = useTranslation()
  const meshComponent = getComponent(entity, MeshComponent)
  return (
    <NodeEditor
      name={t('editor:properties.mesh.name')}
      description={t('editor:properties.mesh.description')}
      icon={<MeshNodeEditor.iconComponent />}
      {...props}
    >
      <Accordion
        title={t('editor:properties.mesh.geometryEditor')}
        expandIcon={<HiPlusSmall />}
        shrinkIcon={<HiMinus />}
      >
        <GeometryEditor geometry={meshComponent?.geometry ?? null} />
      </Accordion>
      <Accordion
        title={t('editor:properties.mesh.materialEditor')}
        expandIcon={<HiPlusSmall />}
        shrinkIcon={<HiMinus />}
      >
        <MaterialEditor materialUUID={((meshComponent?.material as Material).uuid as EntityUUID) ?? null} />
      </Accordion>
    </NodeEditor>
  )
}

MeshNodeEditor.iconComponent = GiMeshBall

export default MeshNodeEditor
