import React from 'react'

import { camelCaseToSpacedString } from '@xrengine/common/src/utils/camelCaseToSpacedString'
import capitalizeFirstLetter from '@xrengine/common/src/utils/capitalizeFirstLetter'
import { generateDefaults } from '@xrengine/spatial/src/renderer/materials/constants/DefaultArgs'
import ColorInput from '../../../../primitives/tailwind/Color'
import BooleanInput from '../../input/Boolean'
import InputGroup from '../../input/Group'
import NumericInput from '../../input/Numeric'
import SelectInput from '../../input/Select'
import StringInput from '../../input/String'
import TexturePreviewInput from '../../input/Texture'

export default function ParameterInput({
  entity,
  values,
  onChange,
  defaults,
  thumbnails,
  ...rest
}: {
  entity: string
  values: object
  defaults?: object
  thumbnails?: Record<string, string>
  onChange: (k: string) => (v) => void
  onModify?: () => void
}) {
  const { onModify } = rest
  function setArgsProp(k) {
    const thisOnChange = onChange(k)
    return (value) => {
      //values[k] = value
      thisOnChange(value)
    }
  }

  function setArgsArrayProp(k, idx) {
    const thisOnChange = onChange(k)
    return (value) => {
      const nuVals = values[k].map((oldVal, oldIdx) => (idx === oldIdx ? value : oldVal))
      thisOnChange(nuVals)
    }
  }

  function setArgsObjectProp(k) {
    const thisOnChange = onChange(k)
    const oldVal = values[k]
    return (field) => {
      return (value) => {
        const nuVal = Object.fromEntries([
          ...Object.entries(oldVal).filter(([_field, _value]) => _field !== field),
          [field, value]
        ])
        thisOnChange(nuVal)
      }
    }
  }

  const _defaults = defaults ?? generateDefaults(values)
  /*
0: "boolean"
1: "string"
2: "integer"
3: "float"
4: "vec2"
5: "vec3"
6: "vec4"
7: "color"
8: "euler"
9: "quat"
10: "mat3"
11: "mat4"
12: "object"
13: "list"
14: "entity"*/
  return (
    <>
      {Object.entries(_defaults).map(([k, parms]: [string, any]) => {
        const compKey = `${entity}-${k}`
        return (
          <InputGroup key={compKey} name={k} label={camelCaseToSpacedString(capitalizeFirstLetter(k))}>
            {(() => {
              if (!(k in values)) {
                console.warn(`Key "${k}" not found in ParameterInput values object`)
                return null
              }

              switch (parms.type) {
                case 'boolean':
                  return <BooleanInput value={values[k]} onChange={setArgsProp(k)} />
                case 'entity':
                case 'integer':
                case 'float':
                  return <NumericInput value={values[k]} onChange={setArgsProp(k)} />
                case 'string':
                  return <StringInput value={values[k]} onChange={setArgsProp(k)} />
                case 'color':
                  return <ColorInput value={values[k]} onChange={setArgsProp(k)} />
                case 'texture':
                  return (
                    <TexturePreviewInput
                      preview={thumbnails?.[k]}
                      value={values[k]}
                      onRelease={setArgsProp(k)}
                      onModify={onModify}
                    />
                  )
                case 'vec2':
                case 'vec3':
                case 'vec4':
                  return (
                    typeof values[k]?.map === 'function' &&
                    (values[k] as number[]).map((arrayVal, idx) => (
                      <NumericInput key={`${compKey}-${idx}`} value={arrayVal} onChange={setArgsArrayProp(k, idx)} />
                    ))
                  )
                case 'select':
                  return (
                    <SelectInput
                      value={values[k]}
                      options={JSON.parse(JSON.stringify(parms.options))}
                      onChange={setArgsProp(k)}
                    />
                  )
                case 'object':
                  return (
                    <ParameterInput
                      entity={compKey}
                      values={values[k]}
                      onChange={setArgsObjectProp(k)}
                      defaults={parms.default}
                    />
                  )
                default:
                  return <></>
              }
            })()}
          </InputGroup>
        )
      })}
    </>
  )
}
