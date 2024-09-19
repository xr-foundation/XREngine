import { UUIDComponent } from '@xrengine/ecs'
import { Component, SerializedComponentType, updateComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Entity } from '@xrengine/ecs/src/Entity'
import { getMutableState } from '@xrengine/hyperflux'

import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { EditorState } from '../../services/EditorServices'
import { SelectionState } from '../../services/SelectionServices'

export type EditorPropType = {
  entity: Entity
  component?: Component
  multiEdit?: boolean
}

export type EditorComponentType = React.FC<EditorPropType> & {
  iconComponent?: any
}

export const updateProperty = <C extends Component, K extends keyof SerializedComponentType<C>>(
  component: C,
  propName: K,
  nodes?: Entity[]
) => {
  return (value: SerializedComponentType<C>[K]) => {
    updateProperties(component, { [propName]: value } as any, nodes)
  }
}

export const updateProperties = <C extends Component>(
  component: C,
  properties: Partial<SerializedComponentType<C>>,
  nodes?: Entity[]
) => {
  const editorState = getMutableState(EditorState)

  const affectedNodes = nodes
    ? nodes
    : editorState.lockPropertiesPanel.value
    ? [UUIDComponent.getEntityByUUID(editorState.lockPropertiesPanel.value)]
    : SelectionState.getSelectedEntities()
  for (let i = 0; i < affectedNodes.length; i++) {
    const node = affectedNodes[i]
    updateComponent(node, component, properties)
  }
}

export const commitProperty = <C extends Component, K extends keyof SerializedComponentType<C>>(
  component: C,
  propName: K,
  nodes?: Entity[]
) => {
  return (value: SerializedComponentType<C>[K]) => {
    commitProperties(component, { [propName]: value } as any, nodes)
  }
}

export const commitProperties = <C extends Component>(
  component: C,
  properties: Partial<SerializedComponentType<C>>,
  nodes?: Entity[]
) => {
  const editorState = getMutableState(EditorState)

  const affectedNodes = nodes
    ? nodes
    : editorState.lockPropertiesPanel.value
    ? [UUIDComponent.getEntityByUUID(editorState.lockPropertiesPanel.value)]
    : SelectionState.getSelectedEntities()

  EditorControlFunctions.modifyProperty(affectedNodes, component, properties)
}
