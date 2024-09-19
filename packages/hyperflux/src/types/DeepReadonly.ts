
export type DeepReadonly<T> = T extends (infer R)[]
  ? DeepReadonlyArray<R>
  : // eslint-disable-next-line @typescript-eslint/ban-types
  T extends Function
  ? T
  : // eslint-disable-next-line @typescript-eslint/ban-types
  T extends { constructor: Function }
  ? T
  : T extends number | string | boolean
  ? T
  : T extends object
  ? DeepReadonlyObject<T>
  : T

export interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

export type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>
}
