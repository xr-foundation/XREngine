
import { Object3D } from 'three'

/** @deprecated use iterateEntityNode instead*/
export default function iterateObject3D<T extends Object3D, R>(
  root: Object3D,
  callback: (child: T) => R,
  predicate: (child: T) => boolean = (_) => true,
  snubChildren = false,
  breakOnFind = false
): R[] {
  const result: R[] = []
  const frontier: Object3D[][] = [[root]]
  do {
    const entry = frontier.pop() ?? []
    for (const obj3d of entry) {
      const children = obj3d?.children ?? []
      if (predicate(obj3d as T)) {
        result.push(callback(obj3d as T))
        if (breakOnFind) break
        snubChildren && frontier.push([...children])
      }
      !snubChildren && frontier.push([...children])
    }
  } while (frontier.length > 0)
  return result
}
