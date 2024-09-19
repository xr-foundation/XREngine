
import { PostProcessingComponent } from '@xrengine/spatial/src/renderer/components/PostProcessingComponent'
import { FogSystem } from '@xrengine/spatial/src/renderer/FogSystem'
import { NoiseOffsetSystem } from '@xrengine/spatial/src/renderer/materials/constants/plugins/NoiseOffsetPlugin'

import { PositionalAudioComponent } from '../audio/components/PositionalAudioComponent'
import { LoopAnimationComponent } from '../avatar/components/LoopAnimationComponent'
import { GrabbableComponent } from '../interaction/components/GrabbableComponent'
import { MountPointSystem } from '../interaction/systems/MountPointSystem'
import { MaterialLibrarySystem } from '../scene/materials/systems/MaterialLibrarySystem'
import { CameraSettingsComponent } from './components/CameraSettingsComponent'
import { EnvMapBakeComponent } from './components/EnvMapBakeComponent'
import { EnvmapComponent } from './components/EnvmapComponent'
import { GroundPlaneComponent } from './components/GroundPlaneComponent'
import { HyperspaceTagComponent } from './components/HyperspaceTagComponent'
import { ImageComponent } from './components/ImageComponent'
import { LinkComponent } from './components/LinkComponent'
import { MediaComponent } from './components/MediaComponent'
import { MountPointComponent } from './components/MountPointComponent'
import { NewVolumetricComponent } from './components/NewVolumetricComponent'
import { OldColliderComponent } from './components/OldColliderComponent'
import { ParticleSystemComponent } from './components/ParticleSystemComponent'
import { PrimitiveGeometryComponent } from './components/PrimitiveGeometryComponent'
import { RenderSettingsComponent } from './components/RenderSettingsComponent'
import { SceneDynamicLoadTagComponent } from './components/SceneDynamicLoadTagComponent'
import { ScenePreviewCameraComponent } from './components/ScenePreviewCamera'
import { SceneSettingsComponent } from './components/SceneSettingsComponent'
import { ScreenshareTargetComponent } from './components/ScreenshareTargetComponent'
import { ShadowComponent } from './components/ShadowComponent'
import { SkyboxComponent } from './components/SkyboxComponent'
import { SpawnPointComponent } from './components/SpawnPointComponent'
import { SplineComponent } from './components/SplineComponent'
import { SplineTrackComponent } from './components/SplineTrackComponent'
import { TextComponent } from './components/TextComponent'
import { VariantComponent } from './components/VariantComponent'
import { VideoComponent } from './components/VideoComponent'
import { VolumetricComponent } from './components/VolumetricComponent'
import { EnvironmentSystem } from './systems/EnvironmentSystem'
import { MeshBVHSystem } from './systems/MeshBVHSystem'
import { ParticleSystem } from './systems/ParticleSystemSystem'
import { PortalSystem } from './systems/PortalSystem'
import { SceneKillHeightSystem } from './systems/SceneKillHeightSystem'
import { SceneObjectDynamicLoadSystem } from './systems/SceneObjectDynamicLoadSystem'
import { SceneObjectSystem } from './systems/SceneObjectSystem'
import { DropShadowSystem, ShadowSystem } from './systems/ShadowSystem'
import { VariantSystem } from './systems/VariantSystem'

/** This const MUST be kept here, to ensure all components definitions are loaded by the time the scene loading occurs */
export const SceneComponents = [
  PositionalAudioComponent,
  LoopAnimationComponent,
  GrabbableComponent,
  CameraSettingsComponent,
  // CloudComponent,
  EnvMapBakeComponent,
  EnvmapComponent,
  GroundPlaneComponent,
  HyperspaceTagComponent,
  ImageComponent,
  // InteriorComponent,
  MediaComponent,
  // MediaSettingsComponent,
  MountPointComponent,
  // OceanComponent,
  ParticleSystemComponent,
  PostProcessingComponent,
  PrimitiveGeometryComponent,
  RenderSettingsComponent,
  SceneDynamicLoadTagComponent,
  ScenePreviewCameraComponent,
  SceneSettingsComponent,
  ScreenshareTargetComponent,
  ShadowComponent,
  SkyboxComponent,
  SpawnPointComponent,
  SplineComponent,
  SplineTrackComponent,
  VariantComponent,
  VideoComponent,
  VolumetricComponent,
  NewVolumetricComponent,
  // WaterComponent,
  LinkComponent,
  TextComponent,
  OldColliderComponent
]

export {
  DropShadowSystem,
  EnvironmentSystem,
  FogSystem,
  MaterialLibrarySystem,
  MeshBVHSystem,
  MountPointSystem,
  NoiseOffsetSystem,
  ParticleSystem,
  PortalSystem,
  SceneKillHeightSystem,
  SceneObjectDynamicLoadSystem,
  SceneObjectSystem,
  ShadowSystem,
  VariantSystem
}
