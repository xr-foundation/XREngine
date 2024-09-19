
import { createEngine } from '@xrengine/ecs/src/Engine'
import { HyperFlux } from '@xrengine/hyperflux'
import { startTimer } from '@xrengine/spatial/src/startTimer'
import React from 'react'

createEngine(HyperFlux.store)
startTimer()

export default function ({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
