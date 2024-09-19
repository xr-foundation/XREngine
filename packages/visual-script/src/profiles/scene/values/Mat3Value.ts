
import { ValueType } from '../../../VisualScriptModule'
import { Mat3, mat3Equals, Mat3JSON, mat3Mix, mat3Parse } from './internal/Mat3'

export const Mat3Value: ValueType = {
  name: 'mat3',
  creator: () => new Mat3(),
  deserialize: (value: string | Mat3JSON) => (typeof value === 'string' ? mat3Parse(value) : new Mat3(value)),
  serialize: (value) => value.elements as Mat3JSON,
  lerp: (start: Mat3, end: Mat3, t: number) => mat3Mix(start, end, t),
  equals: (a: Mat3, b: Mat3) => mat3Equals(a, b),
  clone: (value: Mat3) => value.clone()
}
