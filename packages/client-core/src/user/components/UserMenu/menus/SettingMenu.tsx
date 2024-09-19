
import React, { useLayoutEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import InputCheck from '@xrengine/client-core/src/common/components/InputCheck'
import InputSelect, { InputMenuItem } from '@xrengine/client-core/src/common/components/InputSelect'
import InputSlider from '@xrengine/client-core/src/common/components/InputSlider'
import Menu from '@xrengine/client-core/src/common/components/Menu'
import Tabs from '@xrengine/client-core/src/common/components/Tabs'
import Text from '@xrengine/client-core/src/common/components/Text'
import { AuthService, AuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { defaultThemeModes, defaultThemeSettings } from '@xrengine/common/src/constants/DefaultThemeSettings'
import { UserSettingPatch, clientSettingPath } from '@xrengine/common/src/schema.type.module'
import capitalizeFirstLetter from '@xrengine/common/src/utils/capitalizeFirstLetter'
import { AudioState } from '@xrengine/engine/src/audio/AudioState'
import {
  AvatarAxesControlScheme,
  AvatarInputSettingsState
} from '@xrengine/engine/src/avatar/state/AvatarInputSettingsState'
import { getMutableState, useHookstate, useMutableState } from '@xrengine/hyperflux'
import { isMobile } from '@xrengine/spatial/src/common/functions/isMobile'
import { InputState } from '@xrengine/spatial/src/input/state/InputState'
import { RendererState } from '@xrengine/spatial/src/renderer/RendererState'
import { XRState } from '@xrengine/spatial/src/xr/XRState'
import Box from '@xrengine/ui/src/primitives/mui/Box'
import Grid from '@xrengine/ui/src/primitives/mui/Grid'
import Icon from '@xrengine/ui/src/primitives/mui/Icon'

import { useFind } from '@xrengine/common'
import multiLogger from '@xrengine/common/src/logger'
import { clientContextParams } from '../../../../util/ClientContextState'
import { UserMenus } from '../../../UserUISystem'
import { userHasAccess } from '../../../userHasAccess'
import { PopupMenuServices } from '../PopupMenuService'
import styles from '../index.module.scss'

const logger = multiLogger.child({ component: 'system:settings-menu', modifier: clientContextParams })

export const ShadowMapResolutionOptions: InputMenuItem[] = [
  {
    label: '256px',
    value: 256
  },
  {
    label: '512px',
    value: 512
  },
  {
    label: '1024px',
    value: 1024
  },
  {
    label: '2048px',
    value: 2048
  },
  {
    label: '4096px (not recommended)',
    value: 4096
  }
]

const chromeDesktop = !isMobile && /chrome/i.test(navigator.userAgent)

export type Props = {
  isPopover?: boolean
}

const SettingMenu = ({ isPopover }: Props): JSX.Element => {
  const { t } = useTranslation()
  const rendererState = useMutableState(RendererState)
  const audioState = useMutableState(AudioState)
  const avatarInputState = useMutableState(AvatarInputSettingsState)
  const selfUser = useMutableState(AuthState).user
  const leftAxesControlScheme = avatarInputState.leftAxesControlScheme.value
  const rightAxesControlScheme = avatarInputState.rightAxesControlScheme.value
  const inputState = useMutableState(InputState)
  const preferredHand = inputState.preferredHand.value
  const invertRotationAndMoveSticks = avatarInputState.invertRotationAndMoveSticks.value
  const firstRender = useRef(true)
  const xrSupportedModes = useMutableState(XRState).supportedSessionModes
  const xrSupported = xrSupportedModes['immersive-ar'].value || xrSupportedModes['immersive-vr'].value
  const windowsPerformanceHelp = navigator.platform?.startsWith('Win')
  const controlSchemes = Object.entries(AvatarAxesControlScheme)
  const handOptions = ['left', 'right']
  const selectedTab = useHookstate('general')

  const clientSettingQuery = useFind(clientSettingPath)
  const clientSettings = clientSettingQuery.data[0]
  const userSettings = selfUser.userSetting.value

  const hasAdminAccess = userHasAccess('admin:admin')
  const hasEditorAccess = userHasAccess('editor:write')
  const themeSettings = { ...defaultThemeSettings, ...clientSettings?.themeSettings }
  const themeModes = {
    client: userSettings?.themeModes?.client ?? defaultThemeModes.client,
    studio: userSettings?.themeModes?.studio ?? defaultThemeModes.studio,
    admin: userSettings?.themeModes?.admin ?? defaultThemeModes.admin
  }

  const handleChangeUserThemeMode = (event) => {
    if (!userSettings) return
    const { name, value } = event.target

    const settings: UserSettingPatch = { themeModes: { ...themeModes, [name]: value } }
    AuthService.updateUserSettings(userSettings.id, settings).then(() =>
      logger.info({
        event_name: `change_${name}_theme`,
        event_value: value
      })
    )
  }

  const handleChangeInvertRotationAndMoveSticks = () => {
    getMutableState(AvatarInputSettingsState).invertRotationAndMoveSticks.set((value) => !value)
  }

  useLayoutEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    /** @todo switch handdedness */
  }, [avatarInputState.invertRotationAndMoveSticks])

  const handleTabChange = (newValue: string) => {
    selectedTab.set(newValue)
  }

  const settingTabs = [
    { value: 'general', label: t('user:usermenu.setting.general') },
    { value: 'audio', label: t('user:usermenu.setting.audio') },
    { value: 'graphics', label: t('user:usermenu.setting.graphics') }
  ]

  const accessibleThemeModes = Object.keys(themeModes).filter((mode) => {
    if (mode === 'admin' && !hasAdminAccess) {
      return false
    } else if (mode === 'studio' && !hasEditorAccess) {
      return false
    }
    return true
  })

  const colorModesMenu: InputMenuItem[] = Object.keys(themeSettings).map((el) => {
    return {
      label: capitalizeFirstLetter(el),
      value: el
    }
  })

  const controlSchemesMenu: InputMenuItem[] = controlSchemes.map(([label, value]) => {
    return {
      label,
      value
    }
  })

  const handOptionsMenu: InputMenuItem[] = handOptions.map((el) => {
    return {
      label: el,
      value: el
    }
  })

  const handleQualityLevelChange = (value) => {
    rendererState.qualityLevel.set(value)
    logger.info({ event_name: `set_quality_preset`, event_value: value })
    rendererState.automatic.set(false)
    logger.info({ event_name: `automatic_qp`, event_value: false })
  }

  const handlePostProcessingCheckbox = (value) => {
    rendererState.usePostProcessing.set(value)
    logger.info({ event_name: `post_processing`, event_value: value })
    rendererState.automatic.set(false)
    logger.info({ event_name: `automatic_qp`, event_value: false })
  }

  const handleShadowCheckbox = (value) => {
    rendererState.useShadows.set(value)
    logger.info({ event_name: `shadows`, event_value: value })
    rendererState.automatic.set(false)
    logger.info({ event_name: `automatic_qp`, event_value: false })
  }

  const handleAutomaticCheckbox = (value) => {
    rendererState.automatic.set(value)
    logger.info({ event_name: `automatic_qp`, event_value: value })
    if (value) {
      rendererState.usePostProcessing.set(false)
      logger.info({ event_name: `post_processing`, event_value: false })
      rendererState.useShadows.set(false)
      logger.info({ event_name: `shadows`, event_value: false })
    }
  }

  const handleShadowMapResolutionChange = (value: number) => {
    rendererState.shadowMapResolution.set(value)
    logger.info({ event_name: `change_shadow_map_resolution`, event_value: value })
    rendererState.automatic.set(false)
    logger.info({ event_name: `automatic_qp`, event_value: false })
  }

  return (
    <Menu
      open
      showBackButton
      isPopover={isPopover}
      header={<Tabs value={selectedTab.value} items={settingTabs} onChange={handleTabChange} />}
      onBack={() => PopupMenuServices.showPopupMenu(UserMenus.Profile)}
      onClose={() => PopupMenuServices.showPopupMenu()}
    >
      <Box className={styles.menuContent}>
        {selectedTab.value === 'general' && selfUser && (
          <>
            <Text align="center" variant="body1" mb={2} mt={1}>
              {t('user:usermenu.setting.themes')}
            </Text>

            <Grid container spacing={{ xs: 0, sm: 2 }}>
              {accessibleThemeModes.map((mode, index) => (
                <Grid key={index} item xs={12} sm={4}>
                  <InputSelect
                    name={mode}
                    label={`${t(`user:usermenu.setting.${mode}`)} ${t('user:usermenu.setting.theme')}`}
                    value={themeModes[mode]}
                    menu={colorModesMenu}
                    onChange={(e) => handleChangeUserThemeMode(e)}
                  />
                </Grid>
              ))}
            </Grid>

            {xrSupported && (
              <>
                <Text align="center" variant="body1" mb={1} mt={1}>
                  {t('user:usermenu.setting.xrusersetting')}
                </Text>

                {/* <InputSwitch
                  checked={invertRotationAndMoveSticks}
                  label={t('user:usermenu.setting.invert-rotation')}
                  sx={{ mb: 2 }}
                  onChange={handleChangeInvertRotationAndMoveSticks}
                /> */}

                <Grid container spacing={{ xs: 0, sm: 2 }}>
                  <Grid item xs={12} sm={4}>
                    <InputSelect
                      label={t('user:usermenu.setting.lbl-left-control-scheme')}
                      value={leftAxesControlScheme}
                      menu={controlSchemesMenu}
                      onChange={(event) =>
                        getMutableState(AvatarInputSettingsState).leftAxesControlScheme.set(event.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <InputSelect
                      label={t('user:usermenu.setting.lbl-right-control-scheme')}
                      value={rightAxesControlScheme}
                      menu={controlSchemesMenu}
                      onChange={(event) =>
                        getMutableState(AvatarInputSettingsState).rightAxesControlScheme.set(event.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <InputSelect
                      label={t('user:usermenu.setting.lbl-preferred-hand')}
                      value={preferredHand}
                      menu={handOptionsMenu}
                      onChange={(event) => getMutableState(InputState).preferredHand.set(event.target.value)}
                    />
                  </Grid>
                </Grid>
              </>
            )}

            {/* Controls Helptext */}
            <>
              <Text align="center" variant="body1" mb={2} mt={1}>
                {t('user:usermenu.setting.controls')}
              </Text>

              {!isMobile && !xrSupported && (
                <>
                  <img
                    className={`${styles.row} ${styles.tutorialImage}`}
                    src="/static/Desktop_Tutorial.png"
                    alt="Desktop Controls"
                  />
                  <img
                    className={`${styles.row} ${styles.tutorialImage}`}
                    src="/static/Controller_Tutorial.png"
                    alt="Controller Controls"
                  />
                </>
              )}

              {isMobile && (
                <img
                  className={`${styles.row} ${styles.tutorialImage}`}
                  src="/static/Mobile_Tutorial.png"
                  alt="Mobile Controls"
                />
              )}

              {xrSupported && (
                <img
                  className={`${styles.row} ${styles.tutorialImage}`}
                  src="/static/XR_Tutorial.png"
                  alt="XR Controls"
                />
              )}
            </>

            {/* Windows-specific Graphics/Performance Optimization Helptext */}
            {windowsPerformanceHelp && (
              <>
                <Text align="center" variant="body1" mb={2} mt={3}>
                  {t('user:usermenu.setting.windowsPerformanceHelp')}
                </Text>

                <Text variant="caption">
                  If you're experiencing performance issues, and you're running on a machine with Nvidia graphics, try
                  the following.
                </Text>

                <Text variant="caption">
                  Open the Nvidia Control Panel, select Chrome, make sure "High Performance" is selected.
                </Text>

                <img className={styles.row} src="/static/Nvidia_control_panel1.png" alt="Nvidia Control Panel" />

                <Text variant="caption">
                  In settings for Windows 10/11, search for the 'Graphics' preference on AMD/Nvidia for Chrome.
                </Text>

                <img className={styles.row} src="/static/Nvidia_windows_prefs.png" alt="Nvidia Windows Preferences" />
              </>
            )}
          </>
        )}

        {selectedTab.value === 'audio' && (
          <>
            {chromeDesktop && (
              <Text align="center" variant="caption" mb={2.5}>
                {t('user:usermenu.setting.chromeAEC')}
                <br />
                <b>
                  <u>chrome://flags/#chrome-wide-echo-cancellation</u>
                </b>
              </Text>
            )}

            <InputCheck
              type="wide"
              icon={<Icon type="SurroundSound" />}
              label={t('user:usermenu.setting.use-positional-media')}
              checked={audioState.positionalMedia.value}
              onChange={(value: boolean) => {
                getMutableState(AudioState).positionalMedia.set(value)
                logger.info({ event_name: `spatial_user_av`, event_value: value })
              }}
            />

            <InputSlider
              icon={<Icon type={audioState.masterVolume.value == 0 ? 'VolumeOff' : 'VolumeUp'} />}
              label={t('user:usermenu.setting.lbl-volume')}
              max={1}
              min={0}
              step={0.01}
              value={audioState.masterVolume.value}
              onChange={(value: number) => {
                getMutableState(AudioState).masterVolume.set(value)
                logger.info({ event_name: `set_total_volume`, event_value: value })
              }}
            />

            <InputSlider
              icon={<Icon type={audioState.microphoneGain.value == 0 ? 'MicOff' : 'Mic'} />}
              label={t('user:usermenu.setting.lbl-microphone')}
              max={1}
              min={0}
              step={0.01}
              value={audioState.microphoneGain.value}
              onChange={(value: number) => {
                getMutableState(AudioState).microphoneGain.set(value)
                logger.info({ event_name: `set_microphone_volume`, event_value: value })
              }}
            />

            {/* <Button
              type="expander"
              open={openOtherAudioSettings}
              sx={{ justifyContent: 'center', margin: 1.5 }}
              onClick={() => setOpenOtherAudioSettings(!openOtherAudioSettings)}
            >
              {t('user:usermenu.setting.other-audio-setting')}
            </Button> */}

            {/* <Collapse in={openOtherAudioSettings} timeout="auto" unmountOnExit>
              <> */}

            <InputSlider
              icon={<Icon type={audioState.mediaStreamVolume.value == 0 ? 'VolumeOff' : 'VolumeUp'} />}
              label={t('user:usermenu.setting.lbl-media-instance')}
              max={1}
              min={0}
              step={0.01}
              value={audioState.mediaStreamVolume.value}
              onChange={(value: number) => {
                getMutableState(AudioState).mediaStreamVolume.set(value)
                logger.info({ event_name: `set_user_volume`, event_value: value })
              }}
            />

            <InputSlider
              icon={<Icon type={audioState.notificationVolume.value == 0 ? 'VolumeOff' : 'VolumeUp'} />}
              label={t('user:usermenu.setting.lbl-notification')}
              max={1}
              min={0}
              step={0.01}
              value={audioState.notificationVolume.value}
              onChange={(value: number) => {
                getMutableState(AudioState).notificationVolume.set(value)
                logger.info({ event_name: `set_notification_volume`, event_value: value })
              }}
            />

            <InputSlider
              icon={<Icon type={audioState.soundEffectsVolume.value == 0 ? 'VolumeOff' : 'VolumeUp'} />}
              label={t('user:usermenu.setting.lbl-sound-effect')}
              max={1}
              min={0}
              step={0.01}
              value={audioState.soundEffectsVolume.value}
              onChange={(value: number) => {
                getMutableState(AudioState).soundEffectsVolume.set(value)
                logger.info({ event_name: `set_scene_volume`, event_value: value })
              }}
            />

            <InputSlider
              icon={<Icon type={audioState.backgroundMusicVolume.value == 0 ? 'VolumeOff' : 'VolumeUp'} />}
              label={t('user:usermenu.setting.lbl-background-music-volume')}
              max={1}
              min={0}
              step={0.01}
              value={audioState.backgroundMusicVolume.value}
              onChange={(value: number) => {
                getMutableState(AudioState).backgroundMusicVolume.set(value)
                logger.info({ event_name: `set_music_volume`, event_value: value })
              }}
            />
            {/* </>
            </Collapse> */}
          </>
        )}

        {/* Graphics Settings */}
        {selectedTab.value === 'graphics' && (
          <>
            <InputSlider
              icon={<Icon type="BlurLinear" sx={{ ml: '-3px' }} />}
              label={t('user:usermenu.setting.lbl-quality')}
              max={5}
              min={0}
              step={1}
              value={rendererState.qualityLevel.value}
              sx={{ mt: 4 }}
              onChange={handleQualityLevelChange}
            />

            <Grid container spacing={{ xs: 0, sm: 2 }}>
              <Grid item xs={12} sm={4}>
                <InputCheck
                  label={t('user:usermenu.setting.lbl-pp')}
                  checked={rendererState.usePostProcessing.value}
                  onChange={handlePostProcessingCheckbox}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <InputCheck
                  label={t('user:usermenu.setting.lbl-shadow')}
                  checked={rendererState.useShadows.value}
                  onChange={handleShadowCheckbox}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <InputCheck
                  label={t('user:usermenu.setting.lbl-automatic')}
                  checked={rendererState.automatic.value}
                  onChange={handleAutomaticCheckbox}
                />
              </Grid>
            </Grid>
            {rendererState.useShadows.value && (
              <InputSelect
                label={t('editor:properties.directionalLight.lbl-shadowmapResolution')}
                value={rendererState.shadowMapResolution.value}
                menu={ShadowMapResolutionOptions}
                onChange={(event) => handleShadowMapResolutionChange(event.target.value)}
              />
            )}
          </>
        )}
      </Box>
    </Menu>
  )
}

export default SettingMenu
