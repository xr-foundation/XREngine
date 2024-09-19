
import { ValueType } from '../../../VisualScriptModule'
import { Mat4, mat4Equals, Mat4JSON, mat4Mix, mat4Parse } from './internal/Mat4'

export const Mat4Value: ValueType = {
  name: 'mat4',
  creator: () => new Mat4(),
  deserialize: (value: string | Mat4JSON) => (typeof value === 'string' ? mat4Parse(value) : new Mat4(value)),
  serialize: (value) => value.elements as Mat4JSON,
  lerp: (start: Mat4, end: Mat4, t: number) => mat4Mix(start, end, t),
  equals: (a: Mat4, b: Mat4) => mat4Equals(a, b),
  clone: (value: Mat4) => value.clone()
}
