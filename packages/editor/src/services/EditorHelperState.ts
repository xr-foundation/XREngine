import {
  SnapMode,
  SnapModeType,
  TransformMode,
  TransformModeType,
  TransformPivot,
  TransformPivotType,
  TransformSpace,
  TransformSpaceType
} from '@xrengine/engine/src/scene/constants/transformConstants'
import { defineState, syncStateWithLocalStorage } from '@xrengine/hyperflux'
import { EditorMode, EditorModeType } from '../constants/EditorModeTypes'

export enum PlacementMode {
  DRAG,
  CLICK
}

export const EditorHelperState = defineState({
  name: 'EditorHelperState',
  initial: () => ({
    editorMode: EditorMode.Simple as EditorModeType,
    transformMode: TransformMode.translate as TransformModeType,
    transformModeOnCancel: TransformMode.translate as TransformModeType,
    transformSpace: TransformSpace.local as TransformSpaceType,
    transformPivot: TransformPivot.Center as TransformPivotType,
    gridSnap: SnapMode.Grid as SnapModeType,
    translationSnap: 0.5,
    rotationSnap: 10,
    scaleSnap: 0.1,
    placementMode: PlacementMode.DRAG
  }),
  extension: syncStateWithLocalStorage(['snapMode', 'translationSnap', 'rotationSnap', 'scaleSnap'])
})
