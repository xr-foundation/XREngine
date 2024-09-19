
import { getAllComponents, serializeComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { Entity } from '@xrengine/ecs/src/Entity'
import { ComponentJsonType } from '@xrengine/engine/src/scene/types/SceneTypes'
import { defineState, getMutableState, getState } from '@xrengine/hyperflux'

type ComponentCopyDataType = { name: string; json: Record<string, unknown> }

// fallback to avoid error at readText
export const CopyState = defineState({
  name: 'CopyState',
  initial: ''
})

export const CopyPasteFunctions = {
  _generateComponentCopyData: (entities: Entity[]) =>
    entities.map(
      (entity) =>
        getAllComponents(entity)
          .map((component) => {
            if (!component.jsonID) return
            const json = serializeComponent(entity, component)
            if (!json) return
            return {
              name: component.jsonID,
              json
            }
          })
          .filter((c) => typeof c?.json === 'object' && c.json !== null) as ComponentCopyDataType[]
    ),

  copyEntities: async (entities: Entity[]) => {
    const copyData = JSON.stringify(CopyPasteFunctions._generateComponentCopyData(entities))
    await navigator.clipboard.writeText(copyData)
    getMutableState(CopyState).set(copyData)
  },

  getPastedEntities: async () => {
    let clipboardText = ''
    try {
      clipboardText = await navigator.clipboard.readText()
    } catch {
      clipboardText = getState(CopyState)
    }

    // eslint-disable-next-line no-useless-catch
    try {
      const nodeComponentJSONs = JSON.parse(clipboardText) as ComponentCopyDataType[][]
      return nodeComponentJSONs.map(
        (nodeComponentJSON) => nodeComponentJSON.map((c) => ({ name: c.name, props: c.json })) as ComponentJsonType[]
      )
    } catch (err) {
      throw err
    }
  }
}
