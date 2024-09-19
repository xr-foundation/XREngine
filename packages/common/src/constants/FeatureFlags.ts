export const FeatureFlags = {
  Client: {
    Menu: {
      Social: 'xrengine.client.menu.social',
      Emote: 'xrengine.client.menu.emote',
      Avaturn: 'xrengine.client.menu.avaturn',
      ReadyPlayerMe: 'xrengine.client.menu.readyPlayerMe',
      CreateAvatar: 'xrengine.client.menu.createAvatar',
      MotionCapture: 'xrengine.client.location.menu.motionCapture',
      XR: 'xrengine.client.menu.xr'
    }
  },
  Studio: {
    Model: {
      Dereference: 'xrengine.studio.model.dereference',
      GLTFTransform: 'xrengine.studio.model.gltfTransform'
    },
    Panel: {
      VisualScript: 'xrengine.editor.panel.visualScript'
    },
    UI: {
      TransformPivot: 'xrengine.editor.ui.transformPivot',
      Hierarchy: {
        ShowModelChildren: 'xrengine.editor.ui.hierarchy.showModelChildren'
      },
      PointClick: 'xrengine.editor.ui.pointClick'
    }
  }
}
