
import React, { ReactNode, useEffect } from 'react'
import { twMerge } from 'tailwind-merge'

import { useHookstate } from '@xrengine/hyperflux'
import Text from '../Text'

export interface TabProps extends React.HTMLAttributes<HTMLDivElement> {
  tabsData: {
    id?: string
    tabLabel: string | ReactNode
    title?: string
    topComponent?: ReactNode
    bottomComponent?: ReactNode
    rightComponent?: ReactNode
    ref?: React.RefObject<HTMLDivElement>
    disabled?: boolean
  }[]
  backgroundTheme?: string
  tabcontainerClassName?: string
  tabClassName?: string
  scrollable?: boolean
  currentTabIndex?: number
  onTabChange?: (index: number) => void
}

const Tabs = ({
  tabsData,
  tabcontainerClassName,
  tabClassName,
  scrollable,
  currentTabIndex,
  onTabChange,
  ...props
}: TabProps): JSX.Element => {
  const currentTab = useHookstate(0)

  useEffect(() => {
    if (currentTabIndex) {
      currentTab.set(currentTabIndex)
    }
  }, [currentTabIndex])

  useEffect(() => {
    if (
      scrollable &&
      tabsData.length &&
      tabsData[currentTab.value] &&
      tabsData[currentTab.value].ref &&
      tabsData[currentTab.value].ref?.current
    ) {
      tabsData[currentTab.value].ref?.current?.scrollIntoView({
        block: 'center',
        inline: 'nearest',
        behavior: 'smooth'
      })
    }
    if (onTabChange) {
      onTabChange(currentTab.value)
    }
  }, [currentTab])

  return (
    <div className="relative overflow-y-auto">
      {tabsData[currentTab.value]?.title && (
        <Text fontSize="xl" className="mb-6">
          {tabsData[currentTab.value]?.title}
        </Text>
      )}
      {tabsData[currentTab.value]?.topComponent}
      <div className={'sticky top-0 flex justify-between'}>
        <div className={twMerge('flex gap-4', tabcontainerClassName)} {...props}>
          {tabsData.map((tab, index) => (
            <button
              key={index}
              className={twMerge(
                'p-3 text-sm text-theme-secondary disabled:cursor-not-allowed disabled:opacity-50 dark:hover:border-b dark:hover:border-b-blue-400',
                currentTab.value === index ? 'border-b border-b-blue-primary font-semibold text-theme-primary' : '',
                tab.disabled ? 'border-none' : '',
                tabClassName
              )}
              disabled={tab.disabled}
              onClick={() => {
                currentTab.set(index)
              }}
            >
              {tab.tabLabel}
            </button>
          ))}
        </div>
        {tabsData[currentTab.value]?.rightComponent}
      </div>
      {scrollable ? (
        tabsData.map((tab, index) => (
          <div className="mt-4" key={index}>
            {tab.bottomComponent}
          </div>
        ))
      ) : (
        <div className="mt-4">{tabsData[currentTab.value]?.bottomComponent}</div>
      )}
    </div>
  )
}

export default Tabs
