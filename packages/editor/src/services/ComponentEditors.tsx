import { VisualScriptComponent } from '@xrengine/engine'
import { PositionalAudioComponent } from '@xrengine/engine/src/audio/components/PositionalAudioComponent'
import { LoopAnimationComponent } from '@xrengine/engine/src/avatar/components/LoopAnimationComponent'
import { GrabbableComponent } from '@xrengine/engine/src/interaction/components/GrabbableComponent'
import { InteractableComponent } from '@xrengine/engine/src/interaction/components/InteractableComponent'
import { AudioAnalysisComponent } from '@xrengine/engine/src/scene/components/AudioAnalysisComponent'
import { CameraSettingsComponent } from '@xrengine/engine/src/scene/components/CameraSettingsComponent'
import { EnvMapBakeComponent } from '@xrengine/engine/src/scene/components/EnvMapBakeComponent'
import { EnvmapComponent } from '@xrengine/engine/src/scene/components/EnvmapComponent'
import { GroundPlaneComponent } from '@xrengine/engine/src/scene/components/GroundPlaneComponent'
import { ImageComponent } from '@xrengine/engine/src/scene/components/ImageComponent'
import { InstancingComponent } from '@xrengine/engine/src/scene/components/InstancingComponent'
import { LinkComponent } from '@xrengine/engine/src/scene/components/LinkComponent'
import { MediaComponent } from '@xrengine/engine/src/scene/components/MediaComponent'
import { ModelComponent } from '@xrengine/engine/src/scene/components/ModelComponent'
import { MountPointComponent } from '@xrengine/engine/src/scene/components/MountPointComponent'
import { NewVolumetricComponent } from '@xrengine/engine/src/scene/components/NewVolumetricComponent'
import { ParticleSystemComponent } from '@xrengine/engine/src/scene/components/ParticleSystemComponent'
import { PlaylistComponent } from '@xrengine/engine/src/scene/components/PlaylistComponent'
import { PortalComponent } from '@xrengine/engine/src/scene/components/PortalComponent'
import { PrimitiveGeometryComponent } from '@xrengine/engine/src/scene/components/PrimitiveGeometryComponent'
import { ReflectionProbeComponent } from '@xrengine/engine/src/scene/components/ReflectionProbeComponent'
import { RenderSettingsComponent } from '@xrengine/engine/src/scene/components/RenderSettingsComponent'
import { SDFComponent } from '@xrengine/engine/src/scene/components/SDFComponent'
import { ScenePreviewCameraComponent } from '@xrengine/engine/src/scene/components/ScenePreviewCamera'
import { SceneSettingsComponent } from '@xrengine/engine/src/scene/components/SceneSettingsComponent'
import { ScreenshareTargetComponent } from '@xrengine/engine/src/scene/components/ScreenshareTargetComponent'
import { ShadowComponent } from '@xrengine/engine/src/scene/components/ShadowComponent'
import { SkyboxComponent } from '@xrengine/engine/src/scene/components/SkyboxComponent'
import { SpawnPointComponent } from '@xrengine/engine/src/scene/components/SpawnPointComponent'
import { SplineComponent } from '@xrengine/engine/src/scene/components/SplineComponent'
import { SplineTrackComponent } from '@xrengine/engine/src/scene/components/SplineTrackComponent'
import { TextComponent } from '@xrengine/engine/src/scene/components/TextComponent'
import { VariantComponent } from '@xrengine/engine/src/scene/components/VariantComponent'
import { VideoComponent } from '@xrengine/engine/src/scene/components/VideoComponent'
import { VolumetricComponent } from '@xrengine/engine/src/scene/components/VolumetricComponent'
import { defineState } from '@xrengine/hyperflux'
import {
  AmbientLightComponent,
  DirectionalLightComponent,
  HemisphereLightComponent,
  PointLightComponent,
  SpotLightComponent
} from '@xrengine/spatial'
import { InputComponent } from '@xrengine/spatial/src/input/components/InputComponent'
import { ColliderComponent } from '@xrengine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@xrengine/spatial/src/physics/components/RigidBodyComponent'
import { TriggerComponent } from '@xrengine/spatial/src/physics/components/TriggerComponent'
import { FogSettingsComponent } from '@xrengine/spatial/src/renderer/components/FogSettingsComponent'
import { MeshComponent } from '@xrengine/spatial/src/renderer/components/MeshComponent'
import { PostProcessingComponent } from '@xrengine/spatial/src/renderer/components/PostProcessingComponent'
import { LookAtComponent } from '@xrengine/spatial/src/transform/components/LookAtComponent'
import { PersistentAnchorComponent } from '@xrengine/spatial/src/xr/XRAnchorComponents'

// everything above still needs to be built
import PersistentAnchorNodeEditor from '@xrengine/ui/src/components/editor/properties/anchor'
import LoopAnimationNodeEditor from '@xrengine/ui/src/components/editor/properties/animation'
import AudioAnalysisEditor from '@xrengine/ui/src/components/editor/properties/audio/analysis'
import PositionalAudioNodeEditor from '@xrengine/ui/src/components/editor/properties/audio/positional'
import CameraNodeEditor from '@xrengine/ui/src/components/editor/properties/camera'
import CameraPropertiesNodeEditor from '@xrengine/ui/src/components/editor/properties/cameraProperties'
import ColliderComponentEditor from '@xrengine/ui/src/components/editor/properties/collider'
import EnvMapBakeNodeEditor from '@xrengine/ui/src/components/editor/properties/envMapBake'
import EnvMapEditor from '@xrengine/ui/src/components/editor/properties/envmap'
import FogSettingsEditor from '@xrengine/ui/src/components/editor/properties/fog'
import PrimitiveGeometryNodeEditor from '@xrengine/ui/src/components/editor/properties/geometry/primitive'
import GrabbableComponentNodeEditor from '@xrengine/ui/src/components/editor/properties/grab'
import GroundPlaneNodeEditor from '@xrengine/ui/src/components/editor/properties/groundPlane'
import ImageNodeEditor from '@xrengine/ui/src/components/editor/properties/image'
import InputComponentNodeEditor from '@xrengine/ui/src/components/editor/properties/input'
import InstancingNodeEditor from '@xrengine/ui/src/components/editor/properties/instance'
import InteractableComponentNodeEditor from '@xrengine/ui/src/components/editor/properties/interact'
import AmbientLightNodeEditor from '@xrengine/ui/src/components/editor/properties/light/ambient'
import DirectionalLightNodeEditor from '@xrengine/ui/src/components/editor/properties/light/directional'
import HemisphereLightNodeEditor from '@xrengine/ui/src/components/editor/properties/light/hemisphere'
import PointLightNodeEditor from '@xrengine/ui/src/components/editor/properties/light/point'
import SpotLightNodeEditor from '@xrengine/ui/src/components/editor/properties/light/spot'
import LinkNodeEditor from '@xrengine/ui/src/components/editor/properties/link'
import LookAtNodeEditor from '@xrengine/ui/src/components/editor/properties/lookAt'
import MediaNodeEditor from '@xrengine/ui/src/components/editor/properties/media'
import MeshNodeEditor from '@xrengine/ui/src/components/editor/properties/mesh'
import ModelNodeEditor from '@xrengine/ui/src/components/editor/properties/model'
import MountPointNodeEditor from '@xrengine/ui/src/components/editor/properties/mountPoint'
import ParticleSystemNodeEditor from '@xrengine/ui/src/components/editor/properties/particle'
import PortalNodeEditor from '@xrengine/ui/src/components/editor/properties/portal'
import PostProcessingSettingsEditor from '@xrengine/ui/src/components/editor/properties/postProcessing'
import ReflectionProbeNodeEditor from '@xrengine/ui/src/components/editor/properties/reflectionProbe'
import RenderSettingsEditor from '@xrengine/ui/src/components/editor/properties/render'
import RigidBodyComponentEditor from '@xrengine/ui/src/components/editor/properties/rigidBody'
import ScenePreviewCameraNodeEditor from '@xrengine/ui/src/components/editor/properties/scene/previewCamera'
import SceneSettingsEditor from '@xrengine/ui/src/components/editor/properties/scene/settings'
import ScreenshareTargetNodeEditor from '@xrengine/ui/src/components/editor/properties/screenShareTarget'
import SDFEditor from '@xrengine/ui/src/components/editor/properties/sdf'
import ShadowNodeEditor from '@xrengine/ui/src/components/editor/properties/shadow'
import SkyboxNodeEditor from '@xrengine/ui/src/components/editor/properties/skybox'
import SpawnPointNodeEditor from '@xrengine/ui/src/components/editor/properties/spawnPoint'
import SplineNodeEditor from '@xrengine/ui/src/components/editor/properties/spline'

import { CameraComponent } from '@xrengine/spatial/src/camera/components/CameraComponent'
import PlaylistNodeEditor from '@xrengine/ui/src/components/editor/properties/playlist'
import SplineTrackNodeEditor from '@xrengine/ui/src/components/editor/properties/spline/track'
import TextNodeEditor from '@xrengine/ui/src/components/editor/properties/text'
import TriggerComponentEditor from '@xrengine/ui/src/components/editor/properties/trigger'
import VariantNodeEditor from '@xrengine/ui/src/components/editor/properties/variant'
import VideoNodeEditor from '@xrengine/ui/src/components/editor/properties/video'
import VisualScriptNodeEditor from '@xrengine/ui/src/components/editor/properties/visualScript'
import VolumetricNodeEditor from '@xrengine/ui/src/components/editor/properties/volumetric'
import NewVolumetricNodeEditor from '@xrengine/ui/src/components/editor/properties/volumetric/new'
import { EditorComponentType } from '../components/properties/Util'

export const ComponentEditorsState = defineState({
  name: 'xrengine.editor.ComponentEditorsState',
  initial: () => {
    return {
      [SceneSettingsComponent.name]: SceneSettingsEditor,
      [PostProcessingComponent.name]: PostProcessingSettingsEditor,
      // [MediaSettingsComponent.name]: MediaSettingsEditor,
      [RenderSettingsComponent.name]: RenderSettingsEditor,
      [FogSettingsComponent.name]: FogSettingsEditor,
      [CameraSettingsComponent.name]: CameraPropertiesNodeEditor,
      [CameraComponent.name]: CameraNodeEditor,
      [DirectionalLightComponent.name]: DirectionalLightNodeEditor,
      [HemisphereLightComponent.name]: HemisphereLightNodeEditor,
      [AmbientLightComponent.name]: AmbientLightNodeEditor,
      [PointLightComponent.name]: PointLightNodeEditor,
      [SpotLightComponent.name]: SpotLightNodeEditor,
      [SDFComponent.name]: SDFEditor,
      [GroundPlaneComponent.name]: GroundPlaneNodeEditor,
      [MeshComponent.name]: MeshNodeEditor,
      [ModelComponent.name]: ModelNodeEditor,
      [ShadowComponent.name]: ShadowNodeEditor,
      [LoopAnimationComponent.name]: LoopAnimationNodeEditor,
      [ParticleSystemComponent.name]: ParticleSystemNodeEditor,
      [PrimitiveGeometryComponent.name]: PrimitiveGeometryNodeEditor,
      [PortalComponent.name]: PortalNodeEditor,
      [MountPointComponent.name]: MountPointNodeEditor,
      [RigidBodyComponent.name]: RigidBodyComponentEditor,
      [ColliderComponent.name]: ColliderComponentEditor,
      [TriggerComponent.name]: TriggerComponentEditor,
      [ScenePreviewCameraComponent.name]: ScenePreviewCameraNodeEditor,
      [SkyboxComponent.name]: SkyboxNodeEditor,
      [SpawnPointComponent.name]: SpawnPointNodeEditor,
      [MediaComponent.name]: MediaNodeEditor,
      [ImageComponent.name]: ImageNodeEditor,
      [PositionalAudioComponent.name]: PositionalAudioNodeEditor,
      [AudioAnalysisComponent.name]: AudioAnalysisEditor,
      [VideoComponent.name]: VideoNodeEditor,
      [VolumetricComponent.name]: VolumetricNodeEditor,
      [NewVolumetricComponent.name]: NewVolumetricNodeEditor,
      [PlaylistComponent.name]: PlaylistNodeEditor,
      [EnvmapComponent.name]: EnvMapEditor,
      [EnvMapBakeComponent.name]: EnvMapBakeNodeEditor,
      [InstancingComponent.name]: InstancingNodeEditor,
      [PersistentAnchorComponent.name]: PersistentAnchorNodeEditor,
      [VariantComponent.name]: VariantNodeEditor,
      [SplineComponent.name]: SplineNodeEditor,
      [SplineTrackComponent.name]: SplineTrackNodeEditor,
      [VisualScriptComponent.name]: VisualScriptNodeEditor,
      [LinkComponent.name]: LinkNodeEditor,
      [InteractableComponent.name]: InteractableComponentNodeEditor,
      [InputComponent.name]: InputComponentNodeEditor,
      [GrabbableComponent.name]: GrabbableComponentNodeEditor,
      [ScreenshareTargetComponent.name]: ScreenshareTargetNodeEditor,
      [TextComponent.name]: TextNodeEditor,
      [LookAtComponent.name]: LookAtNodeEditor,
      [ReflectionProbeComponent.name]: ReflectionProbeNodeEditor
    } as Record<string, EditorComponentType>
  }
})
