
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useMutableState } from '@xrengine/hyperflux'
import { RenderInfoState } from '@xrengine/spatial/src/renderer/RenderInfoSystem'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import Text from '@xrengine/ui/src/primitives/tailwind/Text'
import Stats from './stats'

export const StatsPanel = (props: { show: boolean }) => {
  const renderInfoState = useMutableState(RenderInfoState)
  const info = renderInfoState.visible.value && renderInfoState.info.value

  const toggleStats = () => {
    renderInfoState.visible.set(!renderInfoState.visible.value)
  }

  const { t } = useTranslation()
  const [statsArray, setStatsArray] = useState<ReturnType<typeof Stats>[]>([])
  const statsRef = useRef<HTMLDivElement>(null)
  let animateId = 0

  useEffect(() => {
    return () => cancelAnimationFrame(animateId)
  }, [])

  useEffect(() => {
    setupStatsArray()
    if (props.show) animateId = requestAnimationFrame(animate)
    else cancelAnimationFrame(animateId)
  }, [props.show])

  const setupStatsArray = () => {
    if (!statsRef.current) return

    statsRef.current.innerHTML = ''

    for (let i = 0; i < 3; i++) {
      statsArray[i] = Stats()
      statsArray[i].showPanel(i)
      statsRef.current?.appendChild(statsArray[i].dom)
    }

    setStatsArray([...statsArray])
  }

  const animate = () => {
    for (const stats of statsArray) stats.update()
    animateId = requestAnimationFrame(animate)
  }

  return (
    <div className="m-1 flex flex-col gap-0.5 rounded bg-neutral-600 p-1">
      <Text>{t('common:debug.stats')}</Text>
      <div className="flex gap-1 [&>div]:relative" ref={statsRef} />
      <Button variant="secondary" onClick={toggleStats} size="small">
        {renderInfoState.visible.value ? 'Hide' : 'Show'}
      </Button>
      {info && (
        <ul className="list-none text-sm text-theme-secondary">
          <li>
            {t('editor:viewport.state.memory')}
            <ul style={{ listStyle: 'none' }}>
              <li>
                {t('editor:viewport.state.geometries')}: {info.geometries}
              </li>
              <li>
                {t('editor:viewport.state.textures')}: {info.textures}
              </li>
            </ul>
          </li>
          <li>
            {t('editor:viewport.state.render')}:
            <ul className="ml-2 list-none">
              <li>
                {t('editor:viewport.state.FPS')}: {Math.round(info.fps)}
              </li>
              <li>
                {t('editor:viewport.state.frameTime')}: {Math.round(info.frameTime)}ms
              </li>
              <li>
                {t('editor:viewport.state.calls')}: {info.calls}
              </li>
              <li>
                {t('editor:viewport.state.triangles')}: {info.triangles}
              </li>
              <li>
                {t('editor:viewport.state.points')}: {info.points}
              </li>
              <li>
                {t('editor:viewport.state.lines')}: {info.lines}
              </li>
            </ul>
          </li>
        </ul>
      )}
    </div>
  )
}
