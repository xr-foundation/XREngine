import React, { useEffect, useRef } from 'react'

const ClickAwayListener = ({ onClickAway, children }) => {
  const wrapperRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !(wrapperRef.current! as HTMLElement).contains(event.target)) {
        onClickAway()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClickAway])

  return <div ref={wrapperRef}>{children}</div>
}

export default ClickAwayListener
