import CloseIcon from '@mui/icons-material/Close'
import React from 'react'

import IconButton from '../IconButton'
import Tooltip from '../Tooltip'

const IconButtonWithTooltip = ({
  id,
  title,
  icon,
  tooltipClassName,
  ...props
}: Parameters<typeof IconButton>[0] & { tooltipClassName?: string }) => {
  return (
    <Tooltip id={id} title={title} className={tooltipClassName}>
      <IconButton id={id} icon={icon} {...props} />
    </Tooltip>
  )
}

IconButtonWithTooltip.displayName = 'IconButtonWithTooltip'

IconButtonWithTooltip.defaultProps = {
  icon: <CloseIcon />
}

export default IconButtonWithTooltip
