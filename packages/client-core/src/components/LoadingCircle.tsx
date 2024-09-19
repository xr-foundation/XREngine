import React from 'react'

import CircularProgress from '@xrengine/ui/src/primitives/mui/CircularProgress'

type Props = {
  message?: string
}

export function LoadingCircle(props: Props) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        height: '100%',
        width: '100%',
        flexDirection: 'column'
      }}
    >
      <CircularProgress />
      <div
        style={{
          // default values will be overridden by theme
          fontFamily: 'Lato',
          fontSize: '12px',
          color: '#585858',
          padding: '16px'
        }}
      >
        {props.message}
      </div>
    </div>
  )
}
