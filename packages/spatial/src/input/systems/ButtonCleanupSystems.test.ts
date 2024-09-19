
describe('ButtonCleanupSystem', () => {
  // let focusCopy
  // before(() => {
  //   focusCopy = document.hasFocus
  //   document.hasFocus = () => {
  //     return true
  //   }
  // })
  // after(() => {
  //   document.hasFocus = focusCopy
  // })
  // beforeEach(() => {
  //   createEngine()
  // })
  // it('test button cleanup system', () => {
  //   const mockXRInputSource = new MockXRInputSource({
  //     handedness: 'left',
  //     targetRayMode: 'screen',
  //     targetRaySpace: new MockXRSpace() as XRSpace,
  //     gripSpace: undefined,
  //     gamepad: undefined,
  //     profiles: ['test'],
  //     hand: undefined
  //   }) as XRInputSource
  //   const entity = createEntity()
  //   setComponent(entity, InputSourceComponent, { source: mockXRInputSource })
  //   const inputSource = getMutableComponent(entity, InputSourceComponent)
  //   inputSource.buttons.set({
  //     '0': {
  //       down: true
  //     }
  //   } as any)
  //   const system = SystemDefinitions.get(ButtonCleanupSystem)!
  //   const execute = system.execute
  //   execute()
  //   const buttons = inputSource.buttons.get(NO_PROXY)
  //   assert(buttons['0'].down === false)
  // })
  // afterEach(() => {
  //   return destroyEngine()
  // })
})
