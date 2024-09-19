
import { Geometry } from '@xrengine/spatial/src/common/constants/Geometry'
import {
  BoxGeometry,
  CapsuleGeometry,
  CircleGeometry,
  CylinderGeometry,
  DodecahedronGeometry,
  IcosahedronGeometry,
  OctahedronGeometry,
  PlaneGeometry,
  RingGeometry,
  SphereGeometry,
  TetrahedronGeometry,
  TorusGeometry,
  TorusKnotGeometry
} from 'three'

export enum GeometryTypeEnum {
  'BoxGeometry',
  'SphereGeometry',
  'CylinderGeometry',
  'CapsuleGeometry',
  'PlaneGeometry',
  'CircleGeometry',
  'RingGeometry',
  'TorusGeometry',
  'DodecahedronGeometry',
  'IcosahedronGeometry',
  'OctahedronGeometry',
  'TetrahedronGeometry',
  'TorusKnotGeometry'
}

export const GeometryTypeToClass = {
  [GeometryTypeEnum.BoxGeometry]: BoxGeometry,
  [GeometryTypeEnum.SphereGeometry]: SphereGeometry,
  [GeometryTypeEnum.CylinderGeometry]: CylinderGeometry,
  [GeometryTypeEnum.CapsuleGeometry]: CapsuleGeometry,
  [GeometryTypeEnum.PlaneGeometry]: PlaneGeometry,
  [GeometryTypeEnum.CircleGeometry]: CircleGeometry,
  [GeometryTypeEnum.RingGeometry]: RingGeometry,
  [GeometryTypeEnum.TorusGeometry]: TorusGeometry,
  [GeometryTypeEnum.DodecahedronGeometry]: DodecahedronGeometry,
  [GeometryTypeEnum.IcosahedronGeometry]: IcosahedronGeometry,
  [GeometryTypeEnum.OctahedronGeometry]: OctahedronGeometry,
  [GeometryTypeEnum.TetrahedronGeometry]: TetrahedronGeometry,
  [GeometryTypeEnum.TorusKnotGeometry]: TorusKnotGeometry
}

type GeometryFactory = (data: Record<string, any>) => Geometry

export const GeometryTypeToFactory: Record<GeometryTypeEnum, GeometryFactory> = {
  [GeometryTypeEnum.BoxGeometry]: (data) =>
    new BoxGeometry(data.width, data.height, data.depth, data.widthSegments, data.heightSegments, data.depthSegments),
  [GeometryTypeEnum.CapsuleGeometry]: (data) =>
    new CapsuleGeometry(data.radius, data.length, data.capSegments, data.radialSegments),
  [GeometryTypeEnum.CircleGeometry]: (data) =>
    new CircleGeometry(data.radius, data.segments, data.thetaStart, data.thetaLength),
  [GeometryTypeEnum.CylinderGeometry]: (data) =>
    new CylinderGeometry(
      data.radiusTop,
      data.radiusBottom,
      data.height,
      data.radialSegments,
      data.heightSegments,
      data.openEnded,
      data.thetaStart,
      data.thetaLength
    ),
  [GeometryTypeEnum.DodecahedronGeometry]: (data) => new DodecahedronGeometry(data.radius, data.detail),
  [GeometryTypeEnum.IcosahedronGeometry]: (data) => new IcosahedronGeometry(data.radius, data.detail),
  [GeometryTypeEnum.OctahedronGeometry]: (data) => new OctahedronGeometry(data.radius, data.detail),
  [GeometryTypeEnum.PlaneGeometry]: (data) =>
    new PlaneGeometry(data.width, data.height, data.widthSegments, data.heightSegments),
  [GeometryTypeEnum.RingGeometry]: (data) =>
    new RingGeometry(
      data.innerRadius,
      data.outerRadius,
      data.thetaSegments,
      data.phiSegments,
      data.thetaStart,
      data.thetaLength
    ),
  [GeometryTypeEnum.SphereGeometry]: (data) =>
    new SphereGeometry(
      data.radius,
      data.widthSegments,
      data.heightSegments,
      data.phiStart,
      data.phiLength,
      data.thetaStart,
      data.thetaLength
    ),
  [GeometryTypeEnum.TetrahedronGeometry]: (data) => new TetrahedronGeometry(data.radius, data.detail),
  [GeometryTypeEnum.TorusGeometry]: (data) =>
    new TorusGeometry(data.radius, data.tube, data.radialSegments, data.tubularSegments, data.arc),
  [GeometryTypeEnum.TorusKnotGeometry]: (data) =>
    new TorusKnotGeometry(data.radius, data.tube, data.tubularSegments, data.radialSegments, data.p, data.q)
}
