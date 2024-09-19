
import { useHookstate } from '@hookstate/core'
import { PopoverState } from '@xrengine/client-core/src/common/services/PopoverState'
import { deleteScene } from '@xrengine/client-core/src/world/SceneAPI'
import { StaticResourceType } from '@xrengine/common/src/schema.type.module'
import { timeAgo } from '@xrengine/common/src/utils/datetime-sql'
import RenameSceneModal from '@xrengine/editor/src/panels/scenes/RenameSceneModal'
import ConfirmDialog from '@xrengine/ui/src/components/tailwind/ConfirmDialog'
import { Popup } from '@xrengine/ui/src/components/tailwind/Popup'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import Text from '@xrengine/ui/src/primitives/tailwind/Text'
import Tooltip from '@xrengine/ui/src/primitives/tailwind/Tooltip'
import { default as React } from 'react'
import { useTranslation } from 'react-i18next'
import { BsThreeDotsVertical } from 'react-icons/bs'
import { LuTrash } from 'react-icons/lu'
import { MdOutlineEdit } from 'react-icons/md'

type SceneItemProps = {
  scene: StaticResourceType
  handleOpenScene: () => void
  refetchProjectsData: () => void
  onRenameScene?: (newName: string) => void
  onDeleteScene?: (scene: StaticResourceType) => void
}

export default function SceneItem({
  scene,
  handleOpenScene,
  refetchProjectsData,
  onRenameScene,
  onDeleteScene
}: SceneItemProps) {
  const { t } = useTranslation()

  const sceneName = scene.key.split('/').pop()!.replace('.gltf', '')
  const isOptionsPopupOpen = useHookstate(false)

  const deleteSelectedScene = async (scene: StaticResourceType) => {
    if (scene) {
      await deleteScene(scene.key)

      if (onDeleteScene) {
        onDeleteScene(scene)
      } else {
        refetchProjectsData()
      }
    }
    PopoverState.hidePopupover()
  }

  return (
    <div
      data-test-id={`${sceneName === 'New-Scene' ? 'default-scene' : sceneName}`}
      className="col-span-2 inline-flex h-64 w-64 min-w-64 max-w-64 cursor-pointer flex-col items-start justify-start gap-3 rounded-lg bg-theme-highlight p-3 lg:col-span-1"
    >
      <img className="shrink grow basis-0 self-stretch rounded" src={scene.thumbnailURL} onClick={handleOpenScene} />
      <div className="inline-flex items-start justify-between self-stretch">
        <div className="inline-flex w-full flex-col items-start justify-start">
          <div className="space-between flex w-full flex-row">
            <Text component="h3" fontWeight="light" className="leading-6 text-neutral-100">
              <Tooltip content={sceneName}>
                <div className="w-52 truncate">{sceneName}</div>
              </Tooltip>
            </Text>
          </div>
          <Text component="h3" fontSize="xs" fontWeight="light" className="h-3.5 w-40 leading-5 text-neutral-100">
            {t('editor:hierarchy.lbl-edited')} {t('common:timeAgo', { time: timeAgo(new Date(scene.updatedAt)) })}
          </Text>
        </div>
        <div className="relative h-6 w-6">
          <Popup
            open={isOptionsPopupOpen.value}
            trigger={
              <Button
                variant="transparent"
                size="small"
                className="px-2 py-1.5"
                startIcon={<BsThreeDotsVertical className="text-neutral-100" />}
                onClick={() => isOptionsPopupOpen.set(true)}
              />
            }
          >
            <ul className="fixed z-10 block w-max translate-x-5 rounded-lg bg-theme-primary px-4 py-3 pr-10">
              <li className="h-8">
                <Button
                  variant="transparent"
                  size="medium"
                  className="h-full p-0 text-zinc-400 hover:text-[var(--text-primary)]"
                  startIcon={<MdOutlineEdit />}
                  onClick={() => {
                    isOptionsPopupOpen.set(false)
                    PopoverState.showPopupover(
                      <RenameSceneModal
                        sceneName={sceneName}
                        scene={scene}
                        onRenameScene={onRenameScene}
                        refetchProjectsData={refetchProjectsData}
                      />
                    )
                  }}
                >
                  {t('editor:hierarchy.lbl-rename')}
                </Button>
              </li>
              <li className="h-8">
                <Button
                  variant="transparent"
                  size="medium"
                  className="h-full p-0 text-zinc-400 hover:text-[var(--text-primary)]"
                  startIcon={<LuTrash />}
                  onClick={() => {
                    isOptionsPopupOpen.set(false)
                    PopoverState.showPopupover(
                      <ConfirmDialog
                        title={t('editor:hierarchy.lbl-deleteScene')}
                        text={t('editor:hierarchy.lbl-deleteSceneDescription', { sceneName })}
                        onSubmit={async () => deleteSelectedScene(scene)}
                      />
                    )
                  }}
                >
                  {t('editor:hierarchy.lbl-delete')}
                </Button>
              </li>
            </ul>
          </Popup>
        </div>
      </div>
    </div>
  )
}
