import { WidgetAppServiceReceptorSystem } from '@xrengine/spatial/src/xrui/WidgetAppService'

import { AvatarSpawnSystem } from '../networking/AvatarSpawnSystem'
import { AvatarUISystem } from '../systems/AvatarUISystem'
import { LoadingUISystem } from '../systems/LoadingUISystem'
import { MediaControlSystem } from '../systems/MediaControlSystem'
import { PositionalAudioSystem } from '../systems/PositionalAudioSystem'
import { WarningUISystem } from '../systems/WarningUISystem'
import { WidgetUISystem } from '../systems/WidgetUISystem'
import { UserUISystem } from '../user/UserUISystem'

import './ClientNetworkModule'

export {
  AvatarSpawnSystem,
  AvatarUISystem,
  LoadingUISystem,
  MediaControlSystem,
  PositionalAudioSystem,
  UserUISystem,
  WarningUISystem,
  WidgetAppServiceReceptorSystem,
  WidgetUISystem
}
