
import { makeInNOutFunctionDesc } from '../../../../VisualScriptModule'
import {
  Vec2,
  vec2Add,
  vec2Dot,
  vec2Equals,
  vec2Length,
  vec2Mix,
  vec2MultiplyByScalar,
  vec2Negate,
  vec2Normalize,
  vec2Subtract,
  vec2ToArray
} from '../../values/internal/Vec2'

export const Constant = makeInNOutFunctionDesc({
  name: 'math/vec2/constant',
  label: 'Vec2',
  in: ['vec2'],
  out: 'vec2',
  exec: (a: Vec2) => a
})

export const Create = makeInNOutFunctionDesc({
  name: 'math/float/convert/toVec2',
  label: 'Float to Vec2',
  in: [{ x: 'float' }, { y: 'float' }],
  out: 'vec2',
  exec: (x: number, y: number) => new Vec2(x, y)
})

export const Elements = makeInNOutFunctionDesc({
  name: 'math/vec2/convert/toFloat',
  label: 'Vec2 To Float',
  in: ['vec2'],
  out: [{ x: 'float' }, { y: 'float' }],
  exec: vec2ToArray
})

export const Add = makeInNOutFunctionDesc({
  name: 'math/vec2/basic/add',
  label: '+',
  in: ['vec2', 'vec2'],
  out: 'vec2',
  exec: vec2Add
})

export const Subtract = makeInNOutFunctionDesc({
  name: 'math/vec2/basic/subtract',
  label: '-',
  in: ['vec2', 'vec2'],
  out: 'vec2',
  exec: vec2Subtract
})

export const Negate = makeInNOutFunctionDesc({
  name: 'math/vec2/negate',
  label: '-',
  in: ['vec2'],
  out: 'vec2',
  exec: vec2Negate
})

export const Scale = makeInNOutFunctionDesc({
  name: 'math/vec2/basic/scale',
  label: '×',
  in: ['vec2', 'float'],
  out: 'vec2',
  exec: vec2MultiplyByScalar
})

export const Length = makeInNOutFunctionDesc({
  name: 'math/vec2/length',
  label: 'Length',
  in: ['vec2'],
  out: 'float',
  exec: vec2Length
})

export const Normalize = makeInNOutFunctionDesc({
  name: 'math/vec2/normalize',
  label: 'Normalize',
  in: ['vec2'],
  out: 'vec2',
  exec: vec2Normalize
})

export const Dot = makeInNOutFunctionDesc({
  name: 'math/vec2/basic/dot',
  label: 'Dot Product',
  in: ['vec2', 'vec2'],
  out: 'float',
  exec: vec2Dot
})

export const Mix = makeInNOutFunctionDesc({
  name: 'math/vec2/basic/mix',
  label: '÷',
  in: [{ a: 'vec2' }, { b: 'vec2' }, { t: 'float' }],
  out: 'vec2',
  exec: vec2Mix
})

export const Equal = makeInNOutFunctionDesc({
  name: 'math/vec2/compare/equal',
  label: '=',
  in: [{ a: 'vec2' }, { b: 'vec2' }, { tolerance: 'float' }],
  out: 'boolean',
  exec: vec2Equals
})
