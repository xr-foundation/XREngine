import { useQuery, UUIDComponent } from '@xrengine/ecs'
import { getComponent, useComponent } from '@xrengine/ecs/src/ComponentFunctions'
import {
  commitProperties,
  commitProperty,
  EditorComponentType,
  updateProperty
} from '@xrengine/editor/src/components/properties/Util'
import { EditorControlFunctions } from '@xrengine/editor/src/functions/EditorControlFunctions'
import { SourceComponent } from '@xrengine/engine/src/scene/components/SourceComponent'
import { NameComponent } from '@xrengine/spatial/src/common/NameComponent'
import { InputComponent } from '@xrengine/spatial/src/input/components/InputComponent'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { MdOutlinePanTool } from 'react-icons/md'
import Button from '../../../../primitives/tailwind/Button'
import InputGroup from '../../input/Group'
import NumericInput from '../../input/Numeric'
import SelectInput from '../../input/Select'
import NodeEditor from '../nodeEditor'

export const InputComponentNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const inputComponent = useComponent(props.entity, InputComponent)
  const authoringLayerEntities = useQuery([SourceComponent])

  const options = authoringLayerEntities.map((entity) => {
    return {
      label: getComponent(entity, NameComponent),
      value: getComponent(entity, UUIDComponent)
    }
  })
  options.unshift({
    label: 'Self',
    value: getComponent(props.entity, UUIDComponent)
  })

  const addSink = () => {
    const sinks = [...(inputComponent.inputSinks.value ?? []), getComponent(props.entity, UUIDComponent)]

    if (!EditorControlFunctions.hasComponentInAuthoringLayer(props.entity, InputComponent)) {
      EditorControlFunctions.addOrRemoveComponent([props.entity], InputComponent, true, {
        inputSinks: JSON.parse(JSON.stringify(sinks))
      })
    } else {
      commitProperties(InputComponent, { inputSinks: JSON.parse(JSON.stringify(sinks)) }, [props.entity])
    }
  }

  const removeSink = (index: number) => {
    const sinks = [...inputComponent.inputSinks.value]
    sinks.splice(index, 1)
    commitProperties(InputComponent, { inputSinks: JSON.parse(JSON.stringify(sinks)) }, [props.entity])
  }

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.input.name')}
      description={t('editor:properties.input.description')}
      icon={<InputComponentNodeEditor.iconComponent />}
    >
      <InputGroup name="ActivationDistance" label={t('editor:properties.input.lbl-activationDistance')}>
        <NumericInput
          value={inputComponent.activationDistance.value}
          onChange={updateProperty(InputComponent, 'activationDistance')}
          onRelease={commitProperty(InputComponent, 'activationDistance')}
        />
      </InputGroup>
      <div className="flex w-full flex-1 justify-center">
        <Button variant="outline" onClick={addSink}>
          {t('editor:properties.input.lbl-addSinkTarget')}
        </Button>
      </div>
      <div id={`inputSinks-list`}>
        {options.length > 1 && inputComponent.inputSinks.value?.length > 0
          ? inputComponent.inputSinks.value.map((sink, index) => {
              return (
                <div key={index}>
                  <InputGroup name="Target" label={t('editor:properties.input.lbl-sinkTarget')}>
                    <SelectInput
                      key={props.entity}
                      value={sink ?? 'Self'}
                      onChange={commitProperty(InputComponent, `inputSinks.${index}` as any)}
                      options={options}
                      disabled={props.multiEdit}
                    />
                  </InputGroup>
                  <div className="flex w-full flex-1 justify-center">
                    <Button variant="outline" onClick={() => removeSink(index)}>
                      {t('editor:properties.input.lbl-removeSinkTarget')}
                    </Button>
                  </div>
                </div>
              )
            })
          : null}
      </div>
    </NodeEditor>
  )
}

InputComponentNodeEditor.iconComponent = MdOutlinePanTool

export default InputComponentNodeEditor
