
import { SxProps, Theme } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'

import commonStyles from '@xrengine/client-core/src/common/components/common.module.scss'
import Text from '@xrengine/client-core/src/common/components/Text'
import Box from '@xrengine/ui/src/primitives/mui/Box'
import Icon from '@xrengine/ui/src/primitives/mui/Icon'
import IconButton from '@xrengine/ui/src/primitives/mui/IconButton'
import Paper from '@xrengine/ui/src/primitives/mui/Paper'

import { handleSoundEffect } from '../../utils'
import styles from './index.module.scss'

interface Props {
  alt?: string
  className?: string
  id?: string
  imageSrc?: string
  isSelected?: boolean
  name?: string
  showChangeButton?: boolean
  size?: number
  sx?: SxProps<Theme>
  type?: 'round' | 'rectangle' | 'thumbnail'
  onChange?: () => void
  onClick?: () => void
}

const Avatar = ({
  alt,
  className,
  id,
  imageSrc,
  isSelected,
  name,
  showChangeButton,
  size,
  sx,
  type,
  onChange,
  onClick
}: Props) => {
  const { t } = useTranslation()

  if (!size) {
    size = 80
  }

  const handleChange = (e) => {
    e.stopPropagation()
    onChange && onChange()
  }

  if (type === 'rectangle') {
    return (
      <Paper
        title={name}
        className={`${styles.avatarRectangle} ${isSelected ? styles.avatarSelected : ''}`}
        onClick={onClick}
        onPointerUp={handleSoundEffect}
        onPointerEnter={handleSoundEffect}
      >
        <img className={styles.avatar} src={imageSrc} alt={alt} crossOrigin="anonymous" />
        <Text variant="body2" flex={1} className={styles.avatarName}>
          {name}
        </Text>

        {showChangeButton && (
          <IconButton
            icon={<Icon type="Create" sx={{ fontSize: '20px' }} />}
            title={t('user:common.edit')}
            onClick={handleChange}
          />
        )}
      </Paper>
    )
  } else if (type === 'thumbnail') {
    return (
      <Box
        className={`${commonStyles.preview} ${styles.avatarThumbnail} ${className}`}
        sx={{ width: `${size}px`, height: `${size}px`, ...sx }}
      >
        <img
          style={{
            height: 'auto',
            maxWidth: '100%'
          }}
          alt={alt}
          src={imageSrc}
          crossOrigin="anonymous"
          width={`${size}px`}
          height={`${size}px`}
        />
        {!imageSrc && (
          <Text className={commonStyles.previewText} variant="body2">
            {t('admin:components.avatar.thumbnailPreview')}
          </Text>
        )}
      </Box>
    )
  }

  return (
    <Box
      className={`${styles.avatarRound} ${className}`}
      id={id}
      sx={{ width: `${size}px`, height: `${size}px`, ...sx }}
    >
      <img
        style={{
          height: '100%',
          maxWidth: '100%'
        }}
        alt={alt}
        src={imageSrc}
        crossOrigin="anonymous"
      />
      {showChangeButton && (
        <IconButton
          disableRipple
          icon={<Icon type="Create" sx={{ fontSize: '20px' }} />}
          type="glow"
          onClick={onChange}
          sx={{
            position: 'absolute',
            width: '30px',
            height: '30px',
            bottom: '-10px',
            right: '-10px',
            margin: '0',
            minWidth: '30px',
            borderRadius: '50%',
            background: 'var(--iconButtonBackground)',
            boxShadow: '2px 2px 10px gray',
            transition: 'all .15s cubic-bezier(.18,.89,.32,1.28)'
          }}
        />
      )}
    </Box>
  )
}

export default Avatar
