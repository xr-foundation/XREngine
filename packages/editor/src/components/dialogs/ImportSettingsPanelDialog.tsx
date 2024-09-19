import { PopoverState } from '@xrengine/client-core/src/common/services/PopoverState'
import { KTX2EncodeArguments } from '@xrengine/engine/src/assets/constants/CompressionParms'
import { NO_PROXY, State, getMutableState, useHookstate } from '@xrengine/hyperflux'
import InputGroup from '@xrengine/ui/src/components/editor/input/Group'
import NumericInput from '@xrengine/ui/src/components/editor/input/Numeric'
import Checkbox from '@xrengine/ui/src/primitives/tailwind/Checkbox'
import Input from '@xrengine/ui/src/primitives/tailwind/Input'
import Label from '@xrengine/ui/src/primitives/tailwind/Label'
import Modal from '@xrengine/ui/src/primitives/tailwind/Modal'
import Select from '@xrengine/ui/src/primitives/tailwind/Select'
import Text from '@xrengine/ui/src/primitives/tailwind/Text'
import Toggle from '@xrengine/ui/src/primitives/tailwind/Toggle'
import Tooltip from '@xrengine/ui/src/primitives/tailwind/Tooltip'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineInformationCircle } from 'react-icons/hi2'
import { LODList, LODVariantDescriptor } from '../../constants/GLTFPresets'
import { ImportSettingsState } from '../../services/ImportSettingsState'

const UASTCFlagOptions = [
  { label: 'Fastest', value: 0 },
  { label: 'Faster', value: 1 },
  { label: 'Default', value: 2 },
  { label: 'Slower', value: 3 },
  { label: 'Very Slow', value: 4 },
  { label: 'Mask', value: 0xf },
  { label: 'UASTC Error', value: 8 },
  { label: 'BC7 Error', value: 16 },
  { label: 'Faster Hints', value: 64 },
  { label: 'Fastest Hints', value: 128 },
  { label: 'Disable Flip and Individual', value: 256 }
]

const ImageCompressionBox = ({ compressProperties }: { compressProperties: State<KTX2EncodeArguments> }) => {
  const { t } = useTranslation()

  return (
    <>
      <Text>{t('editor:properties.model.transform.compress')}</Text>
      <Select
        label={t('editor:properties.model.transform.mode')}
        description={t('editor:properties.model.transform.modeTooltip')}
        options={[
          { label: 'ETC1S', value: 'ETC1S' },
          { label: 'UASTC', value: 'UASTC' }
        ]}
        currentValue={compressProperties.mode.value}
        onChange={(val: 'ETC1S' | 'UASTC') => compressProperties.mode.set(val)}
      />
      <div className="flex items-center gap-2">
        <Toggle
          value={compressProperties.flipY.value}
          onChange={compressProperties.flipY.set}
          label={t('editor:properties.model.transform.flipY')}
        />
        <Tooltip content={t('editor:properties.model.transform.flipYTooltip')}>
          <HiOutlineInformationCircle />
        </Tooltip>
      </div>
      <div className="flex items-center gap-2">
        <Toggle
          value={compressProperties.srgb.value}
          onChange={compressProperties.srgb.set}
          label={t('editor:properties.model.transform.srgb')}
        />
        <Tooltip content={t('editor:properties.model.transform.srgbTooltip')}>
          <HiOutlineInformationCircle />
        </Tooltip>
      </div>
      <div className="flex items-center gap-2">
        <Toggle
          value={compressProperties.mipmaps.value}
          onChange={compressProperties.mipmaps.set}
          label={t('editor:properties.model.transform.mipmaps')}
        />
        <Tooltip content={t('editor:properties.model.transform.mipmapsTooltip')}>
          <HiOutlineInformationCircle />
        </Tooltip>
      </div>
      <div className="flex items-center gap-2">
        <Toggle
          value={compressProperties.normalMap.value}
          onChange={compressProperties.normalMap.set}
          label={t('editor:properties.model.transform.normalMap')}
        />
        <Tooltip content={t('editor:properties.model.transform.normalMapTooltip')}>
          <HiOutlineInformationCircle />
        </Tooltip>
      </div>
      {compressProperties.mode.value === 'ETC1S' && (
        <>
          <InputGroup
            name="quality"
            label={t('editor:properties.model.transform.quality')}
            info={t('editor:properties.model.transform.qualityTooltip')}
          >
            <NumericInput
              value={compressProperties.quality.value}
              onChange={compressProperties.quality.set}
              min={1}
              max={255}
            />
          </InputGroup>
          <InputGroup
            name="compressionLevel"
            label={t('editor:properties.model.transform.compressionLevel')}
            info={t('editor:properties.model.transform.compressionLevelTooltip')}
          >
            <NumericInput
              value={compressProperties.compressionLevel.value}
              onChange={compressProperties.compressionLevel.set}
              min={0}
              max={6}
            />
          </InputGroup>
        </>
      )}
      {compressProperties.mode.value === 'UASTC' && (
        <>
          <InputGroup
            name="uastcFlags"
            label={t('editor:properties.model.transform.uastcFlags')}
            info={t('editor:properties.model.transform.uastcFlagsTooltip')}
          >
            <Select
              options={UASTCFlagOptions}
              currentValue={compressProperties.uastcFlags.value}
              onChange={(val: number) => compressProperties.uastcFlags.set(val)}
            />
          </InputGroup>
          <InputGroup
            name="uastcZstandard"
            label={t('editor:properties.model.transform.uastcZstandard')}
            info={t('editor:properties.model.transform.uastcZstandardTooltip')}
          >
            <Toggle value={compressProperties.uastcZstandard.value} onChange={compressProperties.uastcZstandard.set} />
          </InputGroup>
        </>
      )}
    </>
  )
}

export default function ImportSettingsPanel() {
  const importSettingsState = useHookstate(getMutableState(ImportSettingsState))
  const compressProperties = useHookstate(getMutableState(ImportSettingsState).imageSettings.get(NO_PROXY))

  const [defaultImportFolder, setDefaultImportFolder] = useState<string>(importSettingsState.importFolder.value)
  const [LODImportFolder, setLODImportFolder] = useState<string>(importSettingsState.LODFolder.value)
  const [LODGenEnabled, setLODGenEnabled] = useState<boolean>(importSettingsState.LODsEnabled.value)
  const [selectedLODS, setSelectedLods] = useState<LODVariantDescriptor[]>(
    importSettingsState.selectedLODS.get(NO_PROXY) as LODVariantDescriptor[]
  )
  const [currentLOD, setCurrentLOD] = useState<LODVariantDescriptor>(
    importSettingsState.selectedLODS[0].get(NO_PROXY) as LODVariantDescriptor
  )
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [KTXEnabled, setKTXEnabled] = useState<boolean>(importSettingsState.imageCompression.value)

  const presetLabels = ['LOD0', 'LOD1', 'LOD2']

  useEffect(() => {
    handleLODChange()
  }, [currentLOD, currentIndex])

  const handleLODChange = () => {
    const newLODS = [...selectedLODS]
    newLODS.splice(currentIndex, 1, currentLOD)
    setSelectedLods(newLODS)
  }

  const handleSaveChanges = () => {
    importSettingsState.importFolder.set(defaultImportFolder)
    importSettingsState.LODFolder.set(LODImportFolder)
    importSettingsState.LODsEnabled.set(LODGenEnabled)
    importSettingsState.imageCompression.set(KTXEnabled)
    importSettingsState.imageSettings.set(compressProperties.get(NO_PROXY))
    importSettingsState.selectedLODS.set(selectedLODS)
    handleCancel()
  }

  const handleCancel = () => {
    PopoverState.hidePopupover()
  }

  return (
    <Modal
      title="Import Settings"
      onSubmit={handleSaveChanges}
      className="w-[50vw] max-w-2xl"
      onClose={PopoverState.hidePopupover}
    >
      <Input
        value={defaultImportFolder}
        onChange={(event) => setDefaultImportFolder(event.target.value)}
        label="Default Import Folder"
      />
      <Checkbox value={LODGenEnabled} onChange={() => setLODGenEnabled(!LODGenEnabled)} label={'Generate LODs'} />
      {LODGenEnabled && (
        <>
          <Input
            label="LODs Folder"
            value={LODImportFolder}
            onChange={(event) => setLODImportFolder(event?.target.value)}
          />
          <Label>LODs to Generate</Label>
          {selectedLODS.slice(0, 3).map((LOD, idx) => (
            <Select
              label={LOD.params.dst}
              description={presetLabels[idx]}
              key={idx}
              options={LODList.map((sLOD) => ({ label: sLOD.params.dst, value: sLOD as any }))}
              currentValue={LOD.params.dst}
              onChange={(value) => {
                setCurrentLOD(value as any)
                setCurrentIndex(idx)
              }}
            />
          ))}
        </>
      )}
      <Text>Image Compression Settings</Text>
      <Checkbox label={'Compress to KTX2'} value={KTXEnabled} onChange={() => setKTXEnabled(!KTXEnabled)} />
      {KTXEnabled && <ImageCompressionBox compressProperties={compressProperties} />}
    </Modal>
  )
}
