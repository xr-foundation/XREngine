import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon'
import React from 'react'

export const FacebookIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon {...props}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 29.9824 7.31367 38.2566 16.875 39.757V25.7813H11.7969V20H16.875V15.5938C16.875 10.5813 19.8609 7.8125 24.4293 7.8125C26.6168 7.8125 28.9062 8.20312 28.9062 8.20312V13.125H26.3844C23.9 13.125 23.125 14.6668 23.125 16.25V20H28.6719L27.7852 25.7813H23.125V39.757C32.6863 38.2566 40 29.9824 40 20Z"
          fill="#1877F2"
        />
        <path
          d="M27.7852 25.7812L28.6719 20H23.125V16.25C23.125 14.6684 23.9 13.125 26.3844 13.125H28.9062V8.20312C28.9062 8.20312 26.6176 7.8125 24.4293 7.8125C19.8609 7.8125 16.875 10.5813 16.875 15.5938V20H11.7969V25.7812H16.875V39.757C18.9457 40.081 21.0543 40.081 23.125 39.757V25.7812H27.7852Z"
          fill="white"
        />
      </svg>
    </SvgIcon>
  )
}
