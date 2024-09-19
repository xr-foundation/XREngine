
import React from 'react'

import IconsPage from './IconsPage'
import Component from './index'

const argTypes = {
  type: {
    control: { type: 'select' },
    options: [
      'Apple',
      'Accessibility',
      'AccountCircle',
      'Add',
      'AdminPanelSettings',
      'Anchor',
      'ArrowBack',
      'ArrowBackIos',
      'ArrowDropDown',
      'ArrowForwardIos',
      'Autorenew',
      'Block',
      'BlurLinear',
      'BlurOff',
      'CachedOutlined',
      'CalendarViewDay',
      'Cancel',
      'CancelOutlined',
      'Chat',
      'ChatBubble',
      'Check',
      'CheckCircle',
      'CleaningServices',
      'Clear',
      'Close',
      'CloudUpload',
      'Code',
      'ContactMail',
      'ContentCopy',
      'Create',
      'CrisisAlert',
      'Dashboard',
      'Delete',
      'Difference',
      'DirectionsRun',
      'Edit',
      'Email',
      'ErrorOutline',
      'ExpandMore',
      'Face',
      'Facebook',
      'FacebookOutlined',
      'FaceRetouchingOff',
      'FileCopy',
      'FileUpload',
      'FilterList',
      'FormatColorFill',
      'FormatColorReset',
      'FullscreenExit',
      'GitHub',
      'Google',
      'GridOn',
      'Group',
      'Groups',
      'Help',
      'HighlightOff',
      'HowToReg',
      'Hub',
      'IosShare',
      'KeyboardArrowDown',
      'KeyboardArrowUp',
      'KeyboardDoubleArrowDown',
      'KeyboardDoubleArrowUp',
      'Launch',
      'Link',
      'LinkedIn',
      'LinkOff',
      'List',
      'ListAlt',
      'LocationOn',
      'Lock',
      'LockOutlined',
      'MailOutline',
      'Menu',
      'Message',
      'Mic',
      'MicOff',
      'Mouse',
      'NavigateBefore',
      'NavigateNext',
      'NearMe',
      'Newspaper',
      'People',
      'PermIdentity',
      'PermMedia',
      'Person',
      'PersonAdd',
      'Phone',
      'Portrait',
      'QrCode2',
      'RecordVoiceOver',
      'Refresh',
      'Report',
      'ScreenShare',
      'ScreenshotMonitor',
      'Search',
      'SelectAll',
      'Send',
      'Settings',
      'Shuffle',
      'SquareFoot',
      'StopScreenShare',
      'Storage',
      'SupervisorAccount',
      'SurroundSound',
      'SystemUpdateAlt',
      'TextSnippet',
      'Timeline',
      'TouchApp',
      'Toys',
      'Twitter',
      'Upload',
      'Videocam',
      'VideocamOff',
      'ViewCompact',
      'ViewInAr',
      'Visibility',
      'VisibilityOff',
      'VoiceOverOff',
      'VolumeDown',
      'VolumeMute',
      'VolumeOff',
      'VolumeUp',
      'WarningAmber',
      'ZoomOutMap',
      'ChevronLeft',
      'ChevronRight',
      'Sync',
      'Download',
      'Save',
      'SmartToy'
    ]
  }
}

export default {
  title: 'Primitives/MUI/Icon',
  component: Component,
  parameters: {
    componentSubtitle: 'Icon',
    jest: 'Icon.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Default = { args: Component.defaultProps }

export const AllIcons = {
  decorators: [
    () => {
      return <IconsPage argTypes={argTypes} />
    }
  ],
  args: Component.defaultProps
}
