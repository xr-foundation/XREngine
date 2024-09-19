
import { SxProps, Theme } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'

import capitalizeFirstLetter from '@xrengine/common/src/utils/capitalizeFirstLetter'
import Box from '@xrengine/ui/src/primitives/mui/Box'
import FormControl from '@xrengine/ui/src/primitives/mui/FormControl'
import FormHelperText from '@xrengine/ui/src/primitives/mui/FormHelperText'
import InputLabel from '@xrengine/ui/src/primitives/mui/InputLabel'
import MenuItem from '@xrengine/ui/src/primitives/mui/MenuItem'
import Select from '@xrengine/ui/src/primitives/mui/Select'

import { handleSoundEffect } from '../../utils'
import commonStyles from '../common.module.scss'
import styles from './index.module.scss'

interface Props<T = unknown> {
  className?: string
  disabled?: boolean
  endControl?: React.ReactNode
  error?: string
  id?: string
  label?: string
  menu: InputMenuItem[]
  name?: string
  sx?: SxProps<Theme>
  value?: T
  onChange?: (e: React.ChangeEvent<{ value: T }>, child?: React.ReactNode) => void
}

export interface InputMenuItem {
  value: string | number
  label: React.ReactNode
  disabled?: boolean
  overflowContent?: React.ReactNode
}

function InputSelect<T>({
  className,
  disabled,
  endControl,
  error,
  id,
  label,
  menu,
  name,
  sx,
  value,
  onChange
}: Props<T>) {
  const { t } = useTranslation()

  if (!disabled) {
    disabled = menu.length <= 0
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2, ...sx }}>
      <Box sx={{ display: 'flex' }}>
        <FormControl
          variant="outlined"
          className={`${commonStyles.inputField} ${className ?? ''}`}
          error={!!error}
          disabled={disabled}
          size="small"
        >
          <InputLabel sx={{ zIndex: 999 }}>{capitalizeFirstLetter(label)}</InputLabel>

          <Select
            disabled={disabled}
            displayEmpty
            fullWidth
            id={id}
            label={capitalizeFirstLetter(label)}
            name={name}
            size={'small'}
            sx={{ opacity: disabled ? 0.38 : 1 }}
            value={value}
            MenuProps={{ classes: { paper: styles.selectPaper } }}
            onChange={onChange as any}
            onPointerUp={handleSoundEffect}
            onPointerEnter={handleSoundEffect}
          >
            {!disabled && (
              <MenuItem
                value=""
                disabled
                classes={{
                  root: styles.menuItem
                }}
              >
                <em>
                  {t('common:components.select')} {label}
                </em>
              </MenuItem>
            )}
            {menu.map((el, index) => (
              <MenuItem
                value={el.value}
                key={index}
                classes={{
                  root: styles.menuItem
                }}
                onPointerUp={handleSoundEffect}
                onPointerEnter={handleSoundEffect}
              >
                {el.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {endControl}
      </Box>

      {error && (
        <FormControl error>
          <FormHelperText>{error}</FormHelperText>
        </FormControl>
      )}
    </Box>
  )
}

export default InputSelect
