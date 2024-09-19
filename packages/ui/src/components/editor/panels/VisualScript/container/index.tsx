import { getComponent, hasComponent, useQuery } from '@xrengine/ecs'
import { commitProperty } from '@xrengine/editor/src/components/properties/Util'
import { EditorControlFunctions } from '@xrengine/editor/src/functions/EditorControlFunctions'
import { SelectionState } from '@xrengine/editor/src/services/SelectionServices'
import { VisualScriptComponent } from '@xrengine/engine'
import { getState } from '@xrengine/hyperflux'
import { VisualScriptState } from '@xrengine/visual-script'
import { isEqual } from 'lodash'
import React from 'react'
import { useTranslation } from 'react-i18next'
import AutoSizer from 'react-virtualized-auto-sizer'
import { ReactFlowProvider } from 'reactflow'
import 'reactflow/dist/style.css'
import Button from '../../../../../primitives/tailwind/Button'
import { Flow } from '../flow'
import './ReactFlowStyle.css'

export const ActiveVisualScript = (props: { entity }) => {
  const { entity } = props

  // reactivity
  const visualScriptState = getState(VisualScriptState)

  // get underlying data, avoid hookstate error 202
  const visualScriptComponent = getComponent(entity, VisualScriptComponent)

  if (visualScriptComponent.visualScript === null) return null
  return (
    <ReactFlowProvider>
      <Flow
        initialVisualScript={visualScriptComponent.visualScript}
        examples={{}}
        registry={visualScriptState.registries[visualScriptComponent.domain]}
        onChangeVisualScript={(newVisualScript) => {
          if (!newVisualScript) return
          if (isEqual(visualScriptComponent.visualScript, newVisualScript)) return
          commitProperty(VisualScriptComponent, 'visualScript')(newVisualScript)
        }}
      />
    </ReactFlowProvider>
  )
}

const VisualFlow = () => {
  const entities = SelectionState.useSelectedEntities()
  const entity = entities[entities.length - 1]
  const validEntity = typeof entity === 'number' && hasComponent(entity, VisualScriptComponent)
  const { t } = useTranslation()

  const addVisualScript = () => EditorControlFunctions.addOrRemoveComponent([entity], VisualScriptComponent, true)

  // ensure reactivity of adding new visualScript
  useQuery([VisualScriptComponent])

  return (
    <AutoSizer>
      {({ width, height }) => (
        <div className="flex items-center justify-center" style={{ width, height }}>
          {entities.length && !validEntity ? (
            <Button
              variant="outline"
              onClick={() => {
                addVisualScript()
              }}
            >
              {t('editor:visualScript.panel.addVisualScript')}
            </Button>
          ) : (
            <></>
          )}
          {validEntity && <ActiveVisualScript entity={entity} />}
        </div>
      )}
    </AutoSizer>
  )
}

export const VisualScriptPanel = () => {
  return (
    <>
      <div className="flex h-full w-full flex-col">
        <div className="flex h-full w-full flex-col">
          <VisualFlow />
        </div>
      </div>
    </>
  )
}

export default VisualScriptPanel
