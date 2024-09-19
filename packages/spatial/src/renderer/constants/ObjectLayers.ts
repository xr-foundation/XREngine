export const ObjectLayers = {
  // anything loaded as a scene entity
  Scene: 0 as const,

  // intersect with camera raycast
  Camera: 1 as const,

  // for portal effect rendering & hiding the scene
  Portal: 2 as const,

  // avatars
  Avatar: 3 as const,

  // other gizmos (ik targets, infinite grid, origin)
  Gizmos: 4 as const,

  // XRUI, loading screen envmap mesh
  UI: 5 as const,

  // used to hide objects from studio screenshot/texture baking
  PhysicsHelper: 6 as const,
  AvatarHelper: 7 as const,
  NodeHelper: 8 as const,

  // custom threejs scene in a UI panel
  Panel: 9 as const,

  // transform gizmo
  TransformGizmo: 10 as const,

  // transform gizmo
  HighlightEffect: 11 as const,

  UVOL: 30 as const
} as Record<string, number>

export const ObjectLayerMasks = {
  Scene: 1 << ObjectLayers.Scene,
  Camera: 1 << ObjectLayers.Camera,
  Portal: 1 << ObjectLayers.Portal,
  Avatar: 1 << ObjectLayers.Avatar,
  Gizmos: 1 << ObjectLayers.Gizmos,
  UI: 1 << ObjectLayers.UI,
  PhysicsHelper: 1 << ObjectLayers.PhysicsHelper,
  AvatarHelper: 1 << ObjectLayers.AvatarHelper,
  NodeHelper: 1 << ObjectLayers.NodeHelper,
  Panel: 1 << ObjectLayers.Panel,
  TransformGizmo: 1 << ObjectLayers.TransformGizmo,
  HighlightEffect: 1 << ObjectLayers.HighlightEffect,
  UVOL: 1 << ObjectLayers.UVOL
} as Record<string, number>
