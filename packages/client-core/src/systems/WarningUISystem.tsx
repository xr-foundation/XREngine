import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MeshBasicMaterial } from 'three'

import { getComponent, removeComponent, setComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { ECSState } from '@xrengine/ecs/src/ECSState'
import { Engine } from '@xrengine/ecs/src/Engine'
import { removeEntity } from '@xrengine/ecs/src/EntityFunctions'
import { defineSystem } from '@xrengine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@xrengine/ecs/src/SystemGroups'
import { defineState, getMutableState, getState, useMutableState } from '@xrengine/hyperflux'
import { EngineState } from '@xrengine/spatial/src/EngineState'
import { CameraComponent } from '@xrengine/spatial/src/camera/components/CameraComponent'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import { createTransitionState } from '@xrengine/spatial/src/common/functions/createTransitionState'
import { VisibleComponent, setVisibleComponent } from '@xrengine/spatial/src/renderer/components/VisibleComponent'
import { ComputedTransformComponent } from '@xrengine/spatial/src/transform/components/ComputedTransformComponent'
import { XRUIComponent } from '@xrengine/spatial/src/xrui/components/XRUIComponent'
import { ObjectFitFunctions } from '@xrengine/spatial/src/xrui/functions/ObjectFitFunctions'
import { createXRUI } from '@xrengine/spatial/src/xrui/functions/createXRUI'
import type { WebLayer3D } from '@xrengine/xrui'

export const WarningUIState = defineState({
  name: 'WarningUIState',
  initial: {
    open: false,
    title: '',
    body: '',
    timeRemaining: 0,
    action: null as null | ((clicked: boolean) => void)
  }
})

const executeAction = async (timeout: boolean) => {
  const action = getState(WarningUIState).action
  if (action) action(timeout)
  WarningUIService.closeWarning()
}

export const WarningUIService = {
  openWarning: async (args: { title: string; body: string; timeout?: number; action?: (timeout: boolean) => void }) => {
    const state = getMutableState(WarningUIState)
    state.open.set(true)
    state.title.set(args.title)
    state.body.set(args.body)
    state.timeRemaining.set(args.timeout ?? -1)
    state.merge({ action: args.action ?? null })
  },
  closeWarning: () => {
    const state = getMutableState(WarningUIState)
    state.open.set(false)
  }
}

const WarningSystemXRUI = function () {
  const { t } = useTranslation()

  const state = useMutableState(WarningUIState)
  const { title, body, timeRemaining } = state.value

  return (
    <>
      <div xr-layer="true" className={'z-1'} style={{ zIndex: '-1', fontFamily: 'Roboto, sans-serif' }}>
        <div
          xr-layer="true"
          className={'max-w-sm pl-6 pr-8'}
          style={{
            paddingLeft: '24px',
            paddingRight: '32px',
            maxWidth: '400px',
            background: 'var(--popupBackground)',
            color: 'var(--textColor)',
            borderRadius: '20px',
            padding: '12px'
          }}
          onClick={() => executeAction(false)}
        >
          <div
            xr-layer="true"
            className={'justify-space-between align-center flex'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div />
            <div
              xr-layer="true"
              className={'font-size 20px'}
              style={{ fontSize: '24px', width: '100%', textAlign: 'center' }}
            >
              {title}
            </div>
            {/* <IconButton
            xr-layer="true"
            aria-label="close"
            className={'bg lightgrey'}
            style={{ backgroundColor: 'lightgrey' }}
            onClick={executeAction}
            size="large"
            icon={<Icon type="Close" />}
          /> */}
          </div>
          <div xr-layer="true" className={'font-size 16px center'} style={{ fontSize: '16px', textAlign: 'center' }}>
            {body}
            {timeRemaining > 0 && (
              <>
                <div xr-layer="true">
                  <span xr-layer="true">{timeRemaining}</span> {t('common:alert.seconds')}
                </div>
                <div className={'margin-top 20px font-size 12px'} style={{ marginTop: '20px', fontSize: '12px' }}>
                  {t('common:alert.cancelCountdown')}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export const WarningUISystemState = defineState({
  name: 'WarningUISystemState',
  initial: () => {
    const transitionPeriodSeconds = 0.2
    const transition = createTransitionState(transitionPeriodSeconds, 'OUT')

    return {
      ui: null as null | ReturnType<typeof createXRUI>,
      transition
    }
  }
})

function TransitionReactor() {
  const state = useMutableState(WarningUIState)

  useEffect(() => {
    if (state.open.value) {
      getState(WarningUISystemState).transition.setState('IN')
    } else {
      getState(WarningUISystemState).transition.setState('OUT')
    }
  }, [state.open])

  return null
}

let accumulator = 0

const execute = () => {
  const { transition, ui } = getState(WarningUISystemState)
  if (!ui) return

  const state = getState(WarningUIState)

  const deltaSeconds = getState(ECSState).deltaSeconds

  if (state.timeRemaining > 0) {
    accumulator += deltaSeconds
    if (state.open && accumulator > 1) {
      const timeRemaining = Math.max(0, state.timeRemaining - 1)
      getMutableState(WarningUIState).timeRemaining.set(timeRemaining)
      if (timeRemaining === 0) {
        executeAction(true)
        WarningUIService.closeWarning()
      }
      accumulator = 0
    }
  }

  if (transition.state === 'OUT' && transition.alpha === 0) {
    removeComponent(ui.entity, ComputedTransformComponent)
    return
  }

  const xrui = getComponent(ui.entity, XRUIComponent)

  if (transition.state === 'IN') {
    setComponent(ui.entity, ComputedTransformComponent, {
      referenceEntities: [Engine.instance.viewerEntity],
      computeFunction: () => {
        const camera = getComponent(Engine.instance.viewerEntity, CameraComponent)
        const distance = camera.near * 1.1 // 10% in front of camera
        ObjectFitFunctions.attachObjectInFrontOfCamera(ui.entity, 0.3, distance)
      }
    })
  }

  transition.update(deltaSeconds, (opacity) => {
    xrui.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
      const mat = layer.contentMesh.material as MeshBasicMaterial
      mat.opacity = opacity
      mat.visible = opacity > 0
      layer.visible = opacity > 0
    })
    setVisibleComponent(ui.entity, opacity > 0)
  })
}

const Reactor = () => {
  useEffect(() => {
    const ui = createXRUI(WarningSystemXRUI)
    removeComponent(ui.entity, VisibleComponent)
    setComponent(ui.entity, NameComponent, 'Warning XRUI')
    getMutableState(WarningUISystemState).ui.set(ui)

    return () => {
      removeEntity(ui.entity)
    }
  }, [])
  return <TransitionReactor />
}

export const WarningUISystem = defineSystem({
  uuid: 'xrengine.client.WarningUISystem',
  insert: { after: PresentationSystemGroup },
  execute,
  reactor: () => {
    if (!useMutableState(EngineState).viewerEntity.value) return null
    return <Reactor />
  }
})
