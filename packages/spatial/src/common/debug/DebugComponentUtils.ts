import { useEffect } from 'react'
import { Object3D } from 'three'

import { createEntity, Entity, generateEntityUUID, removeEntity, setComponent, UUIDComponent } from '@xrengine/ecs'
import { State, useHookstate } from '@xrengine/hyperflux'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import { addObjectToGroup } from '@xrengine/spatial/src/renderer/components/GroupComponent'
import { ObjectLayerMaskComponent } from '@xrengine/spatial/src/renderer/components/ObjectLayerComponent'
import { setVisibleComponent } from '@xrengine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayerMasks } from '@xrengine/spatial/src/renderer/constants/ObjectLayers'
import { EntityTreeComponent } from '@xrengine/spatial/src/transform/components/EntityTree'

export function useHelperEntity<
  TObject extends Object3D,
  TComponent extends State<Partial<{ name: string; entity: Entity }>>
>(
  entity: Entity,
  component: TComponent,
  helper: TObject | undefined = undefined,
  layerMask = ObjectLayerMasks.NodeHelper
): Entity {
  const helperEntityState = useHookstate<Entity>(createEntity)

  useEffect(() => {
    const helperEntity = helperEntityState.value
    if (helper) {
      helper.name = `${component.name.value}-${entity}`
      addObjectToGroup(helperEntity, helper)
      setComponent(helperEntity, NameComponent, helper.name)
    }
    setComponent(helperEntity, EntityTreeComponent, { parentEntity: entity })
    setComponent(helperEntity, UUIDComponent, generateEntityUUID())
    setComponent(helperEntity, ObjectLayerMaskComponent, layerMask)
    setVisibleComponent(helperEntity, true)
    component.entity.set(helperEntity)

    return () => {
      removeEntity(helperEntity)
    }
  }, [])

  return helperEntityState.value
}
