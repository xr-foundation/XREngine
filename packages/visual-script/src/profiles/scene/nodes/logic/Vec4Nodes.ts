
import { makeInNOutFunctionDesc } from '../../../../VisualScriptModule'
import {
  Vec4,
  vec4Add,
  vec4Dot,
  vec4Equals,
  vec4Length,
  vec4Mix,
  vec4MultiplyByScalar,
  vec4Negate,
  vec4Normalize,
  vec4Subtract
} from '../../values/internal/Vec4'

export const Constant = makeInNOutFunctionDesc({
  name: 'math/vec4/constant',
  label: 'Vec4',
  in: ['vec4'],
  out: 'vec4',
  exec: (a) => a
})

export const Create = makeInNOutFunctionDesc({
  name: 'math/float/convert/toVec4',
  label: 'Float to Vec4',
  in: [{ x: 'float' }, { y: 'float' }, { z: 'float' }, { w: 'float' }],
  out: 'vec4',
  exec: (x: number, y: number, z: number, w: number) => new Vec4(x, y, z, w)
})

export const Elements = makeInNOutFunctionDesc({
  name: 'math/vec4/convert/toFloat',
  label: 'Vec4 to Float',
  in: ['vec4'],
  out: [{ x: 'float' }, { y: 'float' }, { z: 'float' }, { w: 'float' }],
  exec: (a: Vec4) => {
    return { x: a.x, y: a.y, z: a.z, w: a.z }
  }
})

export const Add = makeInNOutFunctionDesc({
  name: 'math/vec4/basic/add',
  label: '+',
  in: ['vec4', 'vec4'],
  out: 'vec4',
  exec: vec4Add
})

export const Subtract = makeInNOutFunctionDesc({
  name: 'math/vec4/basic/subtract',
  label: '-',
  in: ['vec4', 'vec4'],
  out: 'vec4',
  exec: vec4Subtract
})

export const Negate = makeInNOutFunctionDesc({
  name: 'math/vec4/negate',
  label: '-',
  in: ['vec4'],
  out: 'vec4',
  exec: vec4Negate
})

export const Scale = makeInNOutFunctionDesc({
  name: 'math/vec4/basic/scale',
  label: '×',
  in: ['vec4', 'float'],
  out: 'vec4',
  exec: vec4MultiplyByScalar
})

export const Length = makeInNOutFunctionDesc({
  name: 'math/vec4/length',
  label: 'Length',
  in: ['vec4'],
  out: 'float',
  exec: vec4Length
})

export const Normalize = makeInNOutFunctionDesc({
  name: 'math/vec4/normalize',
  label: 'Normalize',
  in: ['vec4'],
  out: 'vec4',
  exec: vec4Normalize
})

export const Dot = makeInNOutFunctionDesc({
  name: 'math/vec4/basic/dot',
  label: 'Dot Product',
  in: ['vec4', 'vec4'],
  out: 'float',
  exec: vec4Dot
})

export const Mix = makeInNOutFunctionDesc({
  name: 'math/vec4/basic/mix',
  label: '÷',
  in: [{ a: 'vec4' }, { b: 'vec4' }, { t: 'float' }],
  out: 'vec4',
  exec: vec4Mix
})

export const Equal = makeInNOutFunctionDesc({
  name: 'math/vec4/compare/equal',
  label: '=',
  in: [{ a: 'vec4' }, { b: 'vec4' }, { tolerance: 'float' }],
  out: 'boolean',
  exec: vec4Equals
})
