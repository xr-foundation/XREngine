
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@xrengine/client-core/src/common/components/Button'
import commonStyles from '@xrengine/client-core/src/common/components/common.module.scss'
import InputRadio from '@xrengine/client-core/src/common/components/InputRadio'
import InputText from '@xrengine/client-core/src/common/components/InputText'
import Menu from '@xrengine/client-core/src/common/components/Menu'
import { RouterState } from '@xrengine/client-core/src/common/services/RouterService'
import { useFind } from '@xrengine/common'
import { instancePath, RoomCode } from '@xrengine/common/src/schema.type.module'
import { requestXRSession } from '@xrengine/spatial/src/xr/XRSessionFunctions'
import Box from '@xrengine/ui/src/primitives/mui/Box'

import styles from '../index.module.scss'
import { PopupMenuServices } from '../PopupMenuService'

interface Props {
  location?: string
}

const RoomMenu = ({ location }: Props): JSX.Element => {
  const { t } = useTranslation()
  const [locationName, setLocationName] = useState('')
  const [roomCode, setRoomCode] = useState('' as RoomCode)
  const [source, setSource] = useState('create')
  const [error, setError] = useState('')
  const roomsQuery = useFind(instancePath, { query: { roomCode, ended: false, locationId: { $ne: undefined } } })

  const handleSourceChange = (e) => {
    const { value } = e.target

    setError('')
    setRoomCode('' as RoomCode)
    setSource(value)
  }

  const handleLocationName = async (e) => {
    setLocationName(e.target.value)
    setError('')
  }

  const handleJoin = async () => {
    if (!location && !locationName) {
      setError(t('user:roomMenu.locationRequired'))
      return false
    }

    if (roomCode.length !== 6) {
      setError(t('user:roomMenu.roomCodeLength'))
      return false
    }

    const rooms = roomsQuery.data.at(0)

    if (!rooms) {
      setError(t('user:roomMenu.invalidRoomCode'))
      return
    }
    RouterState.navigate(`/location/${location ? location : locationName}?roomCode=${rooms.roomCode}`)
    requestXRSession()
  }

  const handleCreate = async () => {
    if (!location && !locationName) {
      setError(t('user:roomMenu.locationRequired'))
      return false
    }

    RouterState.navigate(`/location/${location ? location : locationName}`)
    requestXRSession()
  }

  return (
    <Menu open onClose={() => PopupMenuServices.showPopupMenu()}>
      <Box className={styles.menuContent}>
        {!location && (
          <InputText
            error={!location && !locationName && error ? error : undefined}
            label={t('user:roomMenu.locationName')}
            value={locationName}
            onChange={handleLocationName}
          />
        )}

        <hr className={commonStyles.divider} />

        <InputRadio
          value={source}
          type="block"
          options={[
            {
              value: 'create',
              label: t('user:roomMenu.createRoom'),
              overflowContent: (
                <>
                  <Button type="gradientRounded" disabled={source !== 'create'} size="medium" onClick={handleCreate}>
                    {t('user:roomMenu.create')}
                  </Button>

                  <hr className={commonStyles.divider} />
                </>
              )
            },
            {
              value: 'join',
              label: t('user:roomMenu.joinRoom')
            }
          ]}
          sx={{ flexDirection: 'column', width: '100%' }}
          onChange={handleSourceChange}
        />

        <InputText
          disabled={source !== 'join'}
          error={(location || locationName) && source === 'join' && error ? error : undefined}
          label={t('user:roomMenu.joinRoomCode')}
          placeholder={t('user:roomMenu.roomCode')}
          value={roomCode}
        />

        <Box display="flex" alignItems="center">
          <Button type="gradientRounded" disabled={source !== 'join'} size="medium" onClick={handleJoin}>
            {t('user:roomMenu.join')}
          </Button>
        </Box>
      </Box>
    </Menu>
  )
}

export default RoomMenu
