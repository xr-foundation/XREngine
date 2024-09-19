import React from 'react'
import { useTranslation } from 'react-i18next'

const styledErrorStyles: React.CSSProperties = {
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  width: '100vw',
  color: 'var(--red)'
}

const StyledError = ({ children }) => {
  return <div style={styledErrorStyles}>{children}</div>
}

export const Error = (props) => {
  const { t } = useTranslation()

  // Rendering error message
  // Assuming the context variable 'theme' is available somewhere in your application.
  const theme = context // TODO: Replace 'context' with the actual theme context variable.

  // we were using the theme like this <StyledError theme={theme} > but moving to plain css from styled components will invalidate that
  return (
    <StyledError>
      <a href="/">{t('editor:lbl-return')}</a>
      {props.message}
    </StyledError>
  )
}

export default Error
