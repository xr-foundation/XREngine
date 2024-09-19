
import { useEffect } from 'react'
import { CatmullRomCurve3, Quaternion, Vector3 } from 'three'

import { defineComponent, removeComponent, setComponent, useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@xrengine/ecs/src/EntityFunctions'
import { getMutableState, useHookstate } from '@xrengine/hyperflux'
import { Vector3_Up } from '@xrengine/spatial/src/common/constants/MathConstants'
import { RendererState } from '@xrengine/spatial/src/renderer/RendererState'

import { S } from '@xrengine/ecs/src/schemas/JSONSchemas'
import { SplineHelperComponent } from './debug/SplineHelperComponent'

export const SplineComponent = defineComponent({
  name: 'SplineComponent',
  jsonID: 'XRENGINE_spline',

  schema: S.Object({
    elements: S.Array(
      S.Object({
        position: S.Vec3(),
        quaternion: S.Quaternion()
      }),
      [
        { position: new Vector3(-1, 0, -1), quaternion: new Quaternion() },
        {
          position: new Vector3(1, 0, -1),
          quaternion: new Quaternion().setFromAxisAngle(Vector3_Up, Math.PI / 2)
        },
        {
          position: new Vector3(1, 0, 1),
          quaternion: new Quaternion().setFromAxisAngle(Vector3_Up, Math.PI)
        },
        {
          position: new Vector3(-1, 0, 1),
          quaternion: new Quaternion().setFromAxisAngle(Vector3_Up, (3 * Math.PI) / 2)
        }
      ]
    ),
    curve: S.Class(() => new CatmullRomCurve3([], true))
  }),

  onSet: (entity, component, json) => {
    if (!json) return
    json.elements &&
      component.elements.set(
        json.elements.map((e) => ({
          position: new Vector3().copy(e.position),
          quaternion: new Quaternion().copy(e.quaternion)
        }))
      )
  },

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, SplineComponent)
    const debugEnabled = useHookstate(getMutableState(RendererState).nodeHelperVisibility)
    const elements = component.elements

    useEffect(() => {
      if (elements.length < 3) {
        component.curve.set(new CatmullRomCurve3([], true))
        return
      }

      const curve = new CatmullRomCurve3(
        elements.value.map((e) => e.position),
        true
      )
      curve.curveType = 'catmullrom'
      component.curve.set(curve)
    }, [
      elements.length,
      // force a unique dep change upon any position or quaternion change
      elements.value.map((e) => `${JSON.stringify(e.position)}${JSON.stringify(e.quaternion)})`).join('')
    ])

    useEffect(() => {
      if (debugEnabled.value) {
        setComponent(entity, SplineHelperComponent)
      }

      return () => {
        removeComponent(entity, SplineHelperComponent)
      }
    }, [debugEnabled])

    return null
  }
})
