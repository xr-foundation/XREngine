import { MockEventListener } from './MockEventListener'

export class MockXRInputSource {
  handedness: XRHandedness
  targetRayMode: XRTargetRayMode
  targetRaySpace: XRSpace
  gripSpace?: XRSpace | undefined
  gamepad?: Gamepad | undefined
  profiles: string[]
  hand?: XRHand | undefined

  constructor(options: {
    handedness: XRHandedness
    targetRayMode: XRTargetRayMode
    targetRaySpace: XRSpace
    gripSpace?: XRSpace | undefined
    gamepad?: Gamepad | undefined
    profiles: string[]
    hand?: XRHand | undefined
  }) {
    for (const key in options) {
      this[key] = options[key]
    }
  }
}

export class MockXRSpace {}

export class MockXRReferenceSpace extends MockEventListener {
  getOffsetReferenceSpace = (originOffset: XRRigidTransform) => {
    return {}
  }

  onreset = () => {}
}

export class MockXRFrame {
  pose = new MockXRPose()
  getPose = (space, origin) => {
    return this.pose
  }
}

export class MockXRPose {
  transform = {
    position: {
      x: 0,
      y: 0,
      z: 0
    },
    orientation: {
      x: 0,
      y: 0,
      z: 0,
      w: 0
    }
  }
  // readonly linearVelocity?: DOMPointReadOnly | undefined;
  // readonly angularVelocity?: DOMPointReadOnly | undefined;
  // readonly emulatedPosition: boolean;
}

export class MockXRSession extends EventTarget {}
