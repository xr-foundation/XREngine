import { Breakpoint, SxProps, Theme } from '@mui/material/styles'
import React from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@xrengine/client-core/src/common/components/Button'
import Box from '@xrengine/ui/src/primitives/mui/Box'
import { default as MUIDialog } from '@xrengine/ui/src/primitives/mui/Dialog'
import DialogActions from '@xrengine/ui/src/primitives/mui/DialogActions'
import DialogContent from '@xrengine/ui/src/primitives/mui/DialogContent'
import DialogTitle from '@xrengine/ui/src/primitives/mui/DialogTitle'
import Icon from '@xrengine/ui/src/primitives/mui/Icon'
import IconButton from '@xrengine/ui/src/primitives/mui/IconButton'
import Typography from '@xrengine/ui/src/primitives/mui/Typography'

import styles from './index.module.scss'

interface Props {
  open: boolean
  actions?: React.ReactNode
  children?: React.ReactNode
  contentMargin?: string | number
  header?: React.ReactNode
  isPopover?: boolean
  maxWidth?: Breakpoint | false
  showBackButton?: boolean
  showCloseButton?: boolean
  showDefaultActions?: boolean
  sx?: SxProps<Theme>
  title?: string
  onBack?: () => void
  onClose?: () => void
  onSubmit?: () => void
}

const Menu = ({
  open,
  actions,
  children,
  contentMargin,
  header,
  isPopover,
  maxWidth,
  showBackButton,
  showCloseButton,
  showDefaultActions,
  sx,
  title,
  onBack,
  onClose,
  onSubmit
}: Props): JSX.Element => {
  const { t } = useTranslation()

  if (!maxWidth) {
    maxWidth = 'sm'
  }

  const dialogContent = (
    <>
      {(showBackButton || title || header || showCloseButton) && (
        <DialogTitle className="flex items-center px-3 py-4">
          <span>
            {showBackButton && <IconButton icon={<Icon type="ArrowBack" />} sx={{ mr: 1 }} onClick={onBack} />}

            {title && (
              <Typography variant="h6" sx={{ ml: showBackButton ? undefined : 1.5 }}>
                {title}
              </Typography>
            )}

            {header}

            {showCloseButton && (
              <IconButton
                icon={<Icon type="Close" />}
                sx={{ position: 'absolute', right: '0.5rem', top: '0.5rem' }}
                onClick={onClose}
              />
            )}
          </span>
        </DialogTitle>
      )}

      <DialogContent sx={{ margin: contentMargin }}>{children}</DialogContent>

      {(showDefaultActions || actions) && (
        <DialogActions className={styles.dialogActions}>
          {showDefaultActions && (
            <>
              <Button type="outlined" onClick={onClose}>
                {t('common:components.cancel')}
              </Button>
              <Button type="gradient" autoFocus onClick={onSubmit}>
                {t('common:components.confirm')}
              </Button>
            </>
          )}
          {actions}
        </DialogActions>
      )}
    </>
  )

  if (isPopover) {
    return (
      <Box className={styles.menu} sx={{ pointerEvents: 'all', width: '100%', ...sx }}>
        {dialogContent}
      </Box>
    )
  }

  return (
    <MUIDialog
      sx={{ pointerEvents: 'all', ...sx }}
      open={open}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{ className: styles.menu }}
      onClose={onClose}
    >
      {dialogContent}
    </MUIDialog>
  )
}

export default Menu
