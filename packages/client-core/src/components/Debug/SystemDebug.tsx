import React from 'react'
import { useTranslation } from 'react-i18next'
import { JSONTree } from 'react-json-tree'
import { Color } from 'three'

import { ECSState } from '@xrengine/ecs/src/ECSState'
import { System, SystemDefinitions, SystemUUID } from '@xrengine/ecs/src/SystemFunctions'
import {
  AnimationSystemGroup,
  InputSystemGroup,
  PresentationSystemGroup,
  SimulationSystemGroup
} from '@xrengine/ecs/src/SystemGroups'
import { SystemState } from '@xrengine/ecs/src/SystemState'
import { getMutableState, getState, useHookstate } from '@xrengine/hyperflux'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import Text from '@xrengine/ui/src/primitives/tailwind/Text'

const col = new Color()
const col2 = new Color()

const convertSystemExecutionTimeToColor = (systemDuration: number, targetTimestep: number) => {
  if (systemDuration < 1) return 'darkgreen'

  // lerp from green to red based on system duration
  col.setColorName('darkgreen').lerp(col2.setColorName('darkred'), systemDuration / targetTimestep)
  return col.getStyle()
}

export const SystemDebug = () => {
  useHookstate(getMutableState(ECSState).frameTime).value
  const performanceProfilingEnabled = useHookstate(getMutableState(SystemState).performanceProfilingEnabled)
  const { t } = useTranslation()

  return (
    <div className="m-1 bg-neutral-600 p-1">
      <Text>{t('common:debug.systems')}</Text>
      <Button
        onClick={() => performanceProfilingEnabled.set((val) => !val)}
        variant={performanceProfilingEnabled.value ? 'secondary' : 'outline'}
      >
        {'Profile'}
      </Button>
      <SystemDagView uuid={InputSystemGroup} />
      <SystemDagView uuid={SimulationSystemGroup} />
      <SystemDagView uuid={AnimationSystemGroup} />
      <SystemDagView uuid={PresentationSystemGroup} />
    </div>
  )
}

export const SystemDagView = (props: { uuid: SystemUUID }) => {
  const { t } = useTranslation()

  useHookstate(getMutableState(ECSState).frameTime).value
  const performanceProfilingEnabled = useHookstate(getMutableState(SystemState).performanceProfilingEnabled)

  return (
    <JSONTree
      data={expandSystemToTree(SystemDefinitions.get(props.uuid)!)}
      labelRenderer={(raw, ...keyPath) => {
        const uuidName = props.uuid! as string
        const label = raw[0]
        const isInnerSystem = label === 'preSystems' || label === 'subSystems' || label === 'postSystems'
        const isUuid = label === 'uuid'
        const isRoot = label === 'root'
        const labelName =
          isInnerSystem || isUuid ? t(`common:debug.${isUuid ? 'avgDuration' : label}`) : isRoot ? uuidName : label

        return <span style={{ color: isInnerSystem ? 'green' : 'black' }}>{labelName}</span>
      }}
      valueRenderer={(raw, value, ...keyPath) => {
        const system = SystemDefinitions.get(value as SystemUUID)!
        const systemReactor = system ? getState(SystemState).activeSystemReactors.get(system.uuid) : undefined
        const targetTimestep = getState(ECSState).simulationTimestep / 2

        const renderSystemDuration = () => {
          const color = convertSystemExecutionTimeToColor(system.avgSystemDuration, targetTimestep)
          return (
            <span key={system.uuid} style={{ color: color }}>
              {`${Math.trunc(system.avgSystemDuration * 1000) / 1000} ms`}
            </span>
          )
        }

        return (
          <>
            {performanceProfilingEnabled.value && renderSystemDuration()}
            {systemReactor?.errors.map((e) => {
              return (
                <span style={{ color: 'red' }}>
                  {e.name.value}: {e.message.value}
                </span>
              )
            })}
          </>
        )
      }}
      shouldExpandNodeInitially={(keyName, data, level) => shouldExpandNode(data)}
    />
  )
}
function shouldExpandNode(nodeData) {
  const data = nodeData as SystemTree

  // !data.postSystems is a shorthand for whether we're on a system node that contains all 3 (sub/pre/post systems)
  return (
    !data.postSystems ||
    Object.keys(data.postSystems).length > 0 ||
    Object.keys(data.preSystems).length > 0 ||
    Object.keys(data.subSystems).length > 0
  )
}

type SystemTree = {
  uuid: SystemUUID
  preSystems: Record<SystemUUID, SystemTree>
  subSystems: Record<SystemUUID, SystemTree>
  postSystems: Record<SystemUUID, SystemTree>
}

const expandSystemToTree = (system: System): SystemTree => {
  return {
    uuid: system.uuid,
    preSystems: system.preSystems.reduce(
      (acc, uuid) => {
        acc[uuid] = expandSystemToTree(SystemDefinitions.get(uuid)!)
        return acc
      },
      {} as Record<SystemUUID, SystemTree>
    ),
    subSystems: system.subSystems.reduce(
      (acc, uuid) => {
        acc[uuid] = expandSystemToTree(SystemDefinitions.get(uuid)!)
        return acc
      },
      {} as Record<SystemUUID, SystemTree>
    ),
    postSystems: system.postSystems.reduce(
      (acc, uuid) => {
        acc[uuid] = expandSystemToTree(SystemDefinitions.get(uuid)!)
        return acc
      },
      {} as Record<SystemUUID, SystemTree>
    )
  }
}
