import React, { forwardRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMinus, HiPlusSmall } from 'react-icons/hi2'

import { ProjectService, ProjectState } from '@xrengine/client-core/src/common/services/ProjectService'
import { useGet, useMutation } from '@xrengine/common'
import { ProjectSettingType, projectPath, projectSettingPath } from '@xrengine/common/src/schema.type.module'
import { toDisplayDateTime } from '@xrengine/common/src/utils/datetime-sql'
import { NO_PROXY, useHookstate, useMutableState } from '@xrengine/hyperflux'
import Accordion from '@xrengine/ui/src/primitives/tailwind/Accordion'
import Button from '@xrengine/ui/src/primitives/tailwind/Button'
import Input from '@xrengine/ui/src/primitives/tailwind/Input'
import LoadingView from '@xrengine/ui/src/primitives/tailwind/LoadingView'
import Select from '@xrengine/ui/src/primitives/tailwind/Select'
import Text from '@xrengine/ui/src/primitives/tailwind/Text'
import Tooltip from '@xrengine/ui/src/primitives/tailwind/Tooltip'
import { HiTrash, HiUser } from 'react-icons/hi2'

const ProjectTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()
  const state = useHookstate({
    loading: false,
    errorMessage: ''
  })

  const errorMessage = state.errorMessage.value.includes('project_setting_projectid_key_unique')
    ? t('admin:components.setting.project.duplicateKey')
    : state.errorMessage.value
  const projectState = useMutableState(ProjectState)
  const projects = projectState.projects

  const displayedSettings = useHookstate<ProjectSettingType[]>([])
  const originalSettings = useHookstate<ProjectSettingType[]>([])
  const selectedProjectId = useHookstate(projects.get(NO_PROXY).length > 0 ? projects.get(NO_PROXY)[0].id : '')

  const project = useGet(projectPath, selectedProjectId.value, { query: { $select: ['settings'] } })

  const {
    create: createProjectSetting,
    patch: patchProjectSetting,
    remove: removeProjectSetting
  } = useMutation(projectSettingPath)

  useEffect(() => {
    ProjectService.fetchProjects()
  }, [])

  useEffect(() => {
    if (project.data && project.data.settings) {
      originalSettings.set(JSON.parse(JSON.stringify(project.data.settings)))
      displayedSettings.set(originalSettings.value.slice())
    }
  }, [project])

  const projectsMenu = projects.value.map((el) => {
    return {
      label: el.name,
      value: el.id
    }
  })

  const handleSettingsVisibilityChange = (setting: ProjectSettingType, index: number) => {
    displayedSettings[index].set({
      ...setting,
      type: displayedSettings[index].value.type === 'private' ? 'public' : 'private'
    })
  }

  const handleSettingsKeyChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setting: ProjectSettingType,
    index: number
  ) => {
    displayedSettings[index].set({ ...setting, key: e.target.value })
  }

  const handleSettingsValueChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setting: ProjectSettingType,
    index: number
  ) => {
    displayedSettings[index].set({ ...setting, value: e.target.value })
  }

  const handleSaveSetting = async (setting: ProjectSettingType) => {
    try {
      state.loading.set(true)
      await patchProjectSetting(
        setting.id,
        {
          key: setting.key,
          value: setting.value,
          type: setting.type
        },
        {
          query: {
            projectId: selectedProjectId.value
          }
        }
      )
      state.set({ loading: false, errorMessage: '' })
      project.refetch()
    } catch (err) {
      state.set({ loading: false, errorMessage: err.message })
    }
  }

  const handleAddSetting = async () => {
    try {
      state.loading.set(true)
      await createProjectSetting({
        projectId: selectedProjectId.value,
        key: '',
        value: '',
        type: 'private'
      })
      state.set({ loading: false, errorMessage: '' })
      project.refetch()
    } catch (err) {
      state.set({ loading: false, errorMessage: err.message })
    }
  }

  const handleRemoveSetting = async (setting: ProjectSettingType) => {
    try {
      state.loading.set(true)
      await removeProjectSetting(setting.id, {
        query: {
          projectId: selectedProjectId.value
        }
      })
      state.set({ loading: false, errorMessage: '' })
      project.refetch()
    } catch (err) {
      state.set({ loading: false, errorMessage: err.message })
    }
  }

  return (
    <Accordion
      title={t('admin:components.setting.project.header')}
      subtitle={t('admin:components.setting.project.subtitle')}
      expandIcon={<HiPlusSmall />}
      shrinkIcon={<HiMinus />}
      ref={ref}
      open={open}
    >
      <Select
        options={projectsMenu}
        currentValue={selectedProjectId.value}
        onChange={(value) => selectedProjectId.set(value)}
        label={t('admin:components.setting.project.header')}
        className="mb-8 mt-6 max-w-[50%]"
      />

      {selectedProjectId.value && (
        <>
          {displayedSettings.value.map((setting: ProjectSettingType, index: number) => (
            <div className="my-2 flex flex-row items-end gap-2" key={index}>
              <Input
                containerClassName="w-1/4"
                label={t('admin:components.setting.project.keyName')}
                value={setting.key}
                endComponent={
                  <Button
                    className="text-primary mr-1 rounded py-1"
                    variant={setting.type === 'private' ? 'danger' : 'success'}
                    size="small"
                    onClick={() => handleSettingsVisibilityChange(setting, index)}
                  >
                    {setting.type}
                  </Button>
                }
                onChange={(e) => handleSettingsKeyChange(e, setting, index)}
              />
              <Input
                containerClassName="w-1/4"
                label={t('admin:components.setting.project.value')}
                value={setting.value || ''}
                endComponent={
                  setting.userId && (
                    <Tooltip
                      position="left center"
                      content={t('admin:components.common.lastUpdatedBy', {
                        userId: setting.userId,
                        updatedAt: toDisplayDateTime(setting.updatedAt)
                      })}
                    >
                      <HiUser className="mr-2" />
                    </Tooltip>
                  )
                }
                onChange={(e) => handleSettingsValueChange(e, setting, index)}
              />
              <Button
                className="text-primary mb-[2px] ml-1 rounded"
                variant="outline"
                size="small"
                title={t('admin:components.common.save')}
                onClick={() => handleSaveSetting(setting)}
              >
                {t('admin:components.common.save')}
              </Button>
              <Button
                className="mb-1 px-0"
                rounded="full"
                variant="transparent"
                title={t('admin:components.common.delete')}
                onClick={() => handleRemoveSetting(setting)}
                startIcon={<HiTrash className="place-self-center text-theme-iconRed" />}
              />
            </div>
          ))}
          <Button
            onClick={handleAddSetting}
            startIcon={state.loading.value && <LoadingView spinnerOnly className="h-8 w-8" />}
          >
            {t('admin:components.setting.project.add')}
          </Button>
        </>
      )}

      {errorMessage && (
        <Text component="h3" className="text-red-700">
          {errorMessage}
        </Text>
      )}
    </Accordion>
  )
})

export default ProjectTab
