import { removeComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { dispatchAction } from '@xrengine/hyperflux'
import { VisibleComponent } from '@xrengine/spatial/src/renderer/components/VisibleComponent'
import { XRState } from '@xrengine/spatial/src/xr/XRState'
import { createXRUI } from '@xrengine/spatial/src/xrui/functions/createXRUI'
import { WidgetAppActions } from '@xrengine/spatial/src/xrui/WidgetAppService'
import { Widget, Widgets } from '@xrengine/spatial/src/xrui/Widgets'

export function createHeightAdjustmentWidget() {
  const ui = createXRUI(() => null)
  removeComponent(ui.entity, VisibleComponent)

  const widget: Widget = {
    ui,
    label: 'Height Adjustment',
    icon: 'Accessibility',
    onOpen: () => {
      dispatchAction(WidgetAppActions.showWidget({ id, shown: false }))
      XRState.setTrackingSpace()
    }
  }

  const id = Widgets.registerWidget(ui.entity, widget)
  /** @todo better API to disable */
  dispatchAction(WidgetAppActions.enableWidget({ id, enabled: false }))
}
