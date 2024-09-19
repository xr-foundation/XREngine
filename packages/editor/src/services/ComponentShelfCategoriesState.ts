
import useFeatureFlags from '@xrengine/client-core/src/hooks/useFeatureFlags'
import { FeatureFlags } from '@xrengine/common/src/constants/FeatureFlags'
import { Component } from '@xrengine/ecs'
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
import { LinkComponent } from '@xrengine/engine/src/scene/components/LinkComponent'
import { ModelComponent } from '@xrengine/engine/src/scene/components/ModelComponent'
import { MountPointComponent } from '@xrengine/engine/src/scene/components/MountPointComponent'
import { NewVolumetricComponent } from '@xrengine/engine/src/scene/components/NewVolumetricComponent'
import { ParticleSystemComponent } from '@xrengine/engine/src/scene/components/ParticleSystemComponent'
import { PortalComponent } from '@xrengine/engine/src/scene/components/PortalComponent'
import { PrimitiveGeometryComponent } from '@xrengine/engine/src/scene/components/PrimitiveGeometryComponent'
import { RenderSettingsComponent } from '@xrengine/engine/src/scene/components/RenderSettingsComponent'
import { ScenePreviewCameraComponent } from '@xrengine/engine/src/scene/components/ScenePreviewCamera'
import { SceneSettingsComponent } from '@xrengine/engine/src/scene/components/SceneSettingsComponent'
import { ScreenshareTargetComponent } from '@xrengine/engine/src/scene/components/ScreenshareTargetComponent'
import { ShadowComponent } from '@xrengine/engine/src/scene/components/ShadowComponent'
import { SkyboxComponent } from '@xrengine/engine/src/scene/components/SkyboxComponent'
import { SpawnPointComponent } from '@xrengine/engine/src/scene/components/SpawnPointComponent'
import { TextComponent } from '@xrengine/engine/src/scene/components/TextComponent'
import { VariantComponent } from '@xrengine/engine/src/scene/components/VariantComponent'
import { VideoComponent } from '@xrengine/engine/src/scene/components/VideoComponent'
import { VolumetricComponent } from '@xrengine/engine/src/scene/components/VolumetricComponent'
import { defineState, getMutableState } from '@xrengine/hyperflux'
import {
  AmbientLightComponent,
  DirectionalLightComponent,
  HemisphereLightComponent,
  PointLightComponent,
  SpotLightComponent
} from '@xrengine/spatial'
import { CameraComponent } from '@xrengine/spatial/src/camera/components/CameraComponent'
import { InputComponent } from '@xrengine/spatial/src/input/components/InputComponent'
import { ColliderComponent } from '@xrengine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@xrengine/spatial/src/physics/components/RigidBodyComponent'
import { TriggerComponent } from '@xrengine/spatial/src/physics/components/TriggerComponent'
import { FogSettingsComponent } from '@xrengine/spatial/src/renderer/components/FogSettingsComponent'
import { PostProcessingComponent } from '@xrengine/spatial/src/renderer/components/PostProcessingComponent'
import { LookAtComponent } from '@xrengine/spatial/src/transform/components/LookAtComponent'
import { useEffect } from 'react'

export const ComponentShelfCategoriesState = defineState({
  name: 'xrengine.editor.ComponentShelfCategories',
  initial: () => {
    return {
      Files: [
        ModelComponent,
        VolumetricComponent,
        NewVolumetricComponent,
        PositionalAudioComponent,
        AudioAnalysisComponent,
        VideoComponent,
        ImageComponent
      ],
      'Scene Composition': [CameraComponent, PrimitiveGeometryComponent, GroundPlaneComponent, VariantComponent],
      Physics: [ColliderComponent, RigidBodyComponent, TriggerComponent],
      Interaction: [
        SpawnPointComponent,
        PortalComponent,
        LinkComponent,
        MountPointComponent,
        InteractableComponent,
        InputComponent,
        GrabbableComponent,
        ScreenshareTargetComponent
      ],
      Lighting: [
        AmbientLightComponent,
        PointLightComponent,
        SpotLightComponent,
        DirectionalLightComponent,
        HemisphereLightComponent
      ],
      FX: [LoopAnimationComponent, ShadowComponent, ParticleSystemComponent, EnvmapComponent, PostProcessingComponent],
      Scripting: [],
      Settings: [
        SceneSettingsComponent,
        RenderSettingsComponent,
        // MediaSettingsComponent
        CameraSettingsComponent
      ],
      Visual: [
        EnvMapBakeComponent,
        ScenePreviewCameraComponent,
        SkyboxComponent,
        TextComponent,
        LookAtComponent,
        FogSettingsComponent
      ]
    } as Record<string, Component[]>
  },
  reactor: () => {
    const [visualScriptPanelEnabled] = useFeatureFlags([FeatureFlags.Studio.Panel.VisualScript])
    const cShelfState = getMutableState(ComponentShelfCategoriesState)
    useEffect(() => {
      if (visualScriptPanelEnabled) {
        cShelfState.Scripting.merge([VisualScriptComponent])
        return () => {
          cShelfState.Scripting.set((curr) => {
            return curr.splice(curr.findIndex((item) => item.name == VisualScriptComponent.name))
          })
        }
      }
    }, [visualScriptPanelEnabled])
  }
})
