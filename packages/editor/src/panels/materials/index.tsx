
import { useHookstate } from '@hookstate/core'
import { EntityUUID, getComponent, getOptionalComponent, useQuery, UUIDComponent } from '@xrengine/ecs'
import { SourceComponent } from '@xrengine/engine/src/scene/components/SourceComponent'
import { getMaterialsFromScene } from '@xrengine/engine/src/scene/materials/functions/materialSourcingFunctions'
import { getMutableState } from '@xrengine/hyperflux'
import { MaterialStateComponent } from '@xrengine/spatial/src/renderer/materials/MaterialComponent'
import InputGroup from '@xrengine/ui/src/components/editor/input/Group'
import StringInput from '@xrengine/ui/src/components/editor/input/String'
import { PanelDragContainer, PanelTitle } from '@xrengine/ui/src/components/editor/layout/Panel'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import { TabData } from 'rc-dock'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiFilter, HiGlobeAlt } from 'react-icons/hi'
import { SelectionState } from '../../services/SelectionServices'
import { FixedSizeListWrapper, MATERIALS_PANEL_ID, saveMaterial } from './helpers'
import MaterialLayerNode from './layernode'
import { MaterialPreviewer } from './materialpreviewer'

const MaterialsPanelTitle = () => {
  const { t } = useTranslation()
  return (
    <div>
      <PanelDragContainer>
        <PanelTitle>
          <span>{t('editor:materialLibrary.tab-materials')}</span>
        </PanelTitle>
      </PanelDragContainer>
    </div>
  )
}

export const MaterialsPanelTab: TabData = {
  id: MATERIALS_PANEL_ID,
  closable: true,
  title: <MaterialsPanelTitle />,
  content: <MaterialsLibrary />
}

function MaterialsLibrary() {
  const { t } = useTranslation()
  const srcPath = useHookstate('/mat/material-test')
  const materialQuery = useQuery([MaterialStateComponent])
  const nodes = useHookstate<EntityUUID[]>([])
  const selectedEntities = useHookstate(getMutableState(SelectionState).selectedEntities)
  const showLayers = useHookstate(false)

  useEffect(() => {
    const materials =
      selectedEntities.value.length && showLayers.value
        ? getMaterialsFromScene(UUIDComponent.getEntityByUUID(selectedEntities.value[0]))
        : materialQuery
            .map((entity) => getComponent(entity, UUIDComponent))
            .filter((uuid) => uuid !== MaterialStateComponent.fallbackMaterial)

    const materialsBySource = {} as Record<string, EntityUUID[]>
    for (const uuid of materials) {
      const source = getOptionalComponent(UUIDComponent.getEntityByUUID(uuid as EntityUUID), SourceComponent) ?? ''
      materialsBySource[source] = materialsBySource[source] ? [...materialsBySource[source], uuid] : [uuid]
    }
    const materialsBySourceArray = Object.entries(materialsBySource)
    const flattenedMaterials = materialsBySourceArray.reduce(
      (acc: (EntityUUID | string)[], [source, uuids]) => acc.concat([source], uuids),
      []
    ) as EntityUUID[]
    nodes.set(flattenedMaterials)
  }, [materialQuery.length, selectedEntities, showLayers])

  return (
    <div className="h-full overflow-scroll">
      <div className="w-full rounded-md p-3">
        <MaterialPreviewer />
        <div className="mt-4 flex h-5 items-center gap-2">
          <InputGroup name="File Path" label="Save to" className="flex-grow">
            <StringInput value={srcPath.value} onChange={srcPath.set} />
          </InputGroup>
          <Button
            className="flex w-5 flex-grow items-center justify-center text-xs"
            variant="outline"
            onClick={() => saveMaterial(srcPath.value)}
          >
            {t('common:components.save')}
          </Button>
          <div className="mx-2 h-full border-l" />
          <Button
            className="flex w-10 flex-grow items-center justify-center text-xs"
            variant="outline"
            onClick={() => {
              showLayers.set((prevValue) => !prevValue)
            }}
          >
            {showLayers.value ? <HiFilter /> : <HiGlobeAlt />}
          </Button>
        </div>
      </div>
      <FixedSizeListWrapper nodes={nodes.value}>{MaterialLayerNode}</FixedSizeListWrapper>
    </div>
  )
}
