
import React, { useEffect, useState } from 'react'

const txtPreviewStyle = {
  marginLeft: 'auto',
  marginRight: 'auto',
  color: '#fff',
  padding: '10px',
  height: '100%',
  overflow: 'auto'
}

/**
 * @param props
 */
export const TxtPreviewPanel = (props) => {
  const url = props.resourceProps.resourceUrl
  const [txt, setTxt] = useState('')

  const loadTxt = () => {
    fetch(url)
      .then((response) => response.text())
      .then((res) => {
        setTxt(res)
      })
  }

  if (txt) loadTxt()

  useEffect(() => {
    loadTxt()
  }, [])

  return <div style={txtPreviewStyle}>{txt}</div>
}
