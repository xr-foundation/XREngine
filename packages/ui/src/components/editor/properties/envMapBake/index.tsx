import React from 'react'

import { useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { EnvMapBakeComponent } from '@xrengine/engine/src/scene/components/EnvMapBakeComponent'
import { EnvMapBakeTypes } from '@xrengine/engine/src/scene/types/EnvMapBakeTypes'

import { commitProperty, updateProperty } from '@xrengine/editor/src/components/properties/Util'
import { uploadBPCEMBakeToServer } from '@xrengine/editor/src/functions/uploadEnvMapBake'
import BooleanInput from '@xrengine/ui/src/components/editor/input/Boolean'
import { useTranslation } from 'react-i18next'
import { IoMapOutline } from 'react-icons/io5'
import Button from '../../../../primitives/tailwind/Button'
import InputGroup from '../../input/Group'
import SelectInput from '../../input/Select'
import Vector3Input from '../../input/Vector3'
import NodeEditor from '../nodeEditor'
import EnvMapBakeProperties from './properties'

export const enum BakePropertyTypes {
  'Boolean',
  'BakeType',
  'RefreshMode',
  'Resolution',
  'Vector'
}

const DefaultEnvMapBakeSettings = [
  {
    label: 'Bake Settings',
    options: [
      {
        label: 'Type',
        propertyName: 'bakeType',
        type: BakePropertyTypes.BakeType
      },
      {
        label: 'Scale',
        propertyName: 'bakeScale',
        type: BakePropertyTypes.Vector
      }
    ]
  },
  {
    label: 'Realtime Settings',
    options: [
      {
        label: 'Refresh Mode',
        propertyName: 'refreshMode',
        type: BakePropertyTypes.RefreshMode
      }
    ]
  },

  {
    label: 'Settings',
    options: [
      {
        label: 'Box Projection',
        propertyName: 'boxProjection',
        type: BakePropertyTypes.Boolean
      }
    ]
  },
  {
    label: 'Capture Settings',
    options: [
      {
        label: 'Resolution',
        propertyName: 'resolution',
        type: BakePropertyTypes.Resolution
      }
    ]
  }
]

const bakeResolutionTypes = [256, 512, 1024, 2048]

const titleLabelStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'left',
  fontWeight: 'bold',
  color: 'var(--textColor)',
  padding: '0 8px 8px',
  ':last-child': {
    marginLeft: 'auto'
  }
}

const envMapBakeNodeEditorStyle = {}

export const EnvMapBakeNodeEditor = (props) => {
  const bakeComponent = useComponent(props.entity, EnvMapBakeComponent)
  const { t } = useTranslation()

  const renderEnvMapBakeProperties = () => {
    const renderedProperty = DefaultEnvMapBakeSettings.map((element, id) => {
      if (element.label == 'Realtime Settings' && bakeComponent.bakeType.value == EnvMapBakeTypes.Realtime) {
        return <div key={id + 'Realtime'} />
      }

      const renderProp = element.label
        ? [
            <div style={titleLabelStyle as React.CSSProperties} key={id + 'title'}>
              {element.label}
            </div>
          ]
        : []

      element.options?.forEach((property, propertyid) => {
        renderProp.push(
          <EnvMapBakeProperties
            key={id + '' + propertyid}
            element={property}
            bakeComponent={bakeComponent.value}
            entity={props.entity}
          />
        )
      })

      renderProp.push(<br key={id + 'break'} />)
      return renderProp
    })

    return renderedProperty
  }

  const onChangePosition = (value) => {
    bakeComponent.bakePositionOffset.value.copy(value)
  }
  const onChangeScale = (value) => {
    bakeComponent.bakeScale.value.copy(value)
  }

  return (
    <NodeEditor
      style={envMapBakeNodeEditorStyle}
      {...props}
      name={t('editor:properties.envmap.lbl-bake')}
      description="For Adding EnvMap bake in your scene"
      icon={<EnvMapBakeNodeEditor.iconComponent />}
    >
      <Button className="my-1 ml-auto px-10" onClick={() => uploadBPCEMBakeToServer(props.entity)}>
        {t(`editor.projects.bake`)}
      </Button>
      <InputGroup name="Position" label="Position Offset" className="w-auto">
        <Vector3Input
          value={bakeComponent.bakePositionOffset.value}
          onChange={updateProperty(EnvMapBakeComponent, 'bakePositionOffset')}
          onRelease={commitProperty(EnvMapBakeComponent, 'bakePositionOffset')}
        />
      </InputGroup>
      <InputGroup name="Scale" label="Scale" className="w-auto">
        <Vector3Input
          value={bakeComponent.bakeScale.value}
          onChange={updateProperty(EnvMapBakeComponent, 'bakeScale')}
          onRelease={commitProperty(EnvMapBakeComponent, 'bakeScale')}
        />
      </InputGroup>
      <InputGroup name="Type" label="Bake Type">
        <SelectInput
          options={[
            { label: 'Baked', value: 'Baked' },
            { label: 'Realtime', value: 'Realtime' }
          ]}
          key={props.entity}
          value={bakeComponent.bakeType.value}
          onChange={commitProperty(EnvMapBakeComponent, 'bakeType')}
        />
      </InputGroup>
      <InputGroup name="Bake Resolution" label="Bake Resolution">
        <SelectInput
          options={bakeResolutionTypes.map((resolution) => ({ label: resolution.toString(), value: resolution }))}
          key={props.entity}
          value={bakeComponent.resolution.value}
          onChange={commitProperty(EnvMapBakeComponent, 'resolution')}
        />
      </InputGroup>
      <InputGroup name="Box Projection" label="Box Projection">
        <BooleanInput
          value={bakeComponent.boxProjection.value}
          onChange={commitProperty(EnvMapBakeComponent, 'boxProjection')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

EnvMapBakeNodeEditor.iconComponent = IoMapOutline
export default EnvMapBakeNodeEditor
