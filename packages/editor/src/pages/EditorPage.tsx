
import { PopoverState } from '@xrengine/client-core/src/common/services/PopoverState'
import '@xrengine/engine/src/EngineModule'
import { getMutableState, useHookstate, useImmediateEffect } from '@xrengine/hyperflux'
import { loadEngineInjection } from '@xrengine/projects/loadEngineInjection'
import { EngineState } from '@xrengine/spatial/src/EngineState'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import Modal from '@xrengine/ui/src/primitives/tailwind/Modal'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FiInfo } from 'react-icons/fi'
import { useSearchParams } from 'react-router-dom'
import '../EditorModule'
import EditorContainer from '../components/EditorContainer'
import { isSupportedBrowser } from '../functions/browserCheck'
import { EditorState } from '../services/EditorServices'
import { ProjectPage } from './ProjectPage'

const downloadGoogleLink =
  'https://www.google.com/chrome/dr/download/?brand=CBFU&ds_kid=43700079286123654&gad_source=1&gclid=CjwKCAjwooq3BhB3EiwAYqYoEkgLBNGFDuKclZQTGAA8Lzq66cvirjjOm7ur0ayMgKvn9y3Fd1spThoCXu0QAvD_BwE&gclsrc=aw.ds'
export const useStudioEditor = () => {
  const engineReady = useHookstate(false)

  useEffect(() => {
    getMutableState(EngineState).isEditor.set(true)
    getMutableState(EngineState).isEditing.set(true)
    loadEngineInjection().then(() => {
      engineReady.set(true)
    })
  }, [])

  return engineReady.value
}

export const EditorPage = () => {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const { scenePath, projectName, acknowledgedUnsupportedBrowser } = useHookstate(getMutableState(EditorState))
  const supportedBrowser = useHookstate(isSupportedBrowser)

  useImmediateEffect(() => {
    const sceneInParams = params.get('scenePath')
    if (sceneInParams) scenePath.set(sceneInParams)
    const projectNameInParams = params.get('project')
    if (projectNameInParams) projectName.set(projectNameInParams)
  }, [params])

  useEffect(() => {
    if (!scenePath.value) return

    const parsed = new URL(window.location.href)
    const query = parsed.searchParams

    query.set('scenePath', scenePath.value)

    parsed.search = query.toString()
    if (typeof history.pushState !== 'undefined') {
      window.history.replaceState({}, '', parsed.toString())
    }
  }, [scenePath])

  if (!scenePath.value && !projectName.value) return <ProjectPage studioPath="/studio" />
  return (
    <>
      <EditorContainer />
      {!supportedBrowser.value &&
        !acknowledgedUnsupportedBrowser.value &&
        PopoverState.showPopupover(
          <Modal
            onSubmit={() => {
              return true
            }}
            onClose={() => {
              acknowledgedUnsupportedBrowser.set(true)
              PopoverState.hidePopupover()
            }}
            className="w-[50vw] max-w-2xl"
            hideFooter
          >
            <div className="flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#191B1F]">
                <FiInfo className="h-6 w-6" />
              </div>
              <div className="flex flex-col items-center gap-3 p-4 px-12 pb-12">
                <span className="text-center font-bold">{t('editor:unsupportedBrowser.title')}</span>
                <span className="text-center">{t('editor:unsupportedBrowser.description')}</span>
              </div>
              <div className="flex gap-3">
                <Button variant="primary" onClick={() => window.open(downloadGoogleLink)}>
                  {t('editor:unsupportedBrowser.downloadChrome')}
                </Button>
                <Button>
                  <span
                    onClick={() => {
                      PopoverState.hidePopupover()
                      acknowledgedUnsupportedBrowser.set(true)
                    }}
                  >
                    {t('editor:unsupportedBrowser.continue')}
                  </span>
                </Button>
              </div>
            </div>
          </Modal>
        )}
    </>
  )
}
