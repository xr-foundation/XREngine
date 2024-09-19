
import { createXRUI } from '@xrengine/spatial/src/xrui/functions/createXRUI'
import { Widget, Widgets } from '@xrengine/spatial/src/xrui/Widgets'

import { UserMediaWindowsWidget } from '../components/UserMediaWindows'

export function createMediaWidget() {
  const ui = createXRUI(UserMediaWindowsWidget)
  // removeComponent(ui.entity, VisibleComponent)

  const widget: Widget = {
    ui,
    label: 'Media',
    icon: 'Groups',
    onOpen: () => {},
    system: () => {},
    cleanup: async () => {}
  }

  const id = Widgets.registerWidget(ui.entity, widget)
}
