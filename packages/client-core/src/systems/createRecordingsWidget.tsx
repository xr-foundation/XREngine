
import { removeComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { VisibleComponent } from '@xrengine/spatial/src/renderer/components/VisibleComponent'
import { createXRUI } from '@xrengine/spatial/src/xrui/functions/createXRUI'
import { Widget, Widgets } from '@xrengine/spatial/src/xrui/Widgets'

import { RecordingsWidgetUI } from './ui/RecordingsWidgetUI'

export function createRecordingsWidget() {
  const ui = createXRUI(RecordingsWidgetUI)
  removeComponent(ui.entity, VisibleComponent)

  const widget: Widget = {
    ui,
    label: 'Recording',
    icon: 'Videocam'
  }

  const id = Widgets.registerWidget(ui.entity, widget)
}
