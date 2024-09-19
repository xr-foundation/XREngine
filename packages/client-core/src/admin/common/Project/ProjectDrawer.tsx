import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { DefaultUpdateSchedule } from '@xrengine/common/src/interfaces/ProjectPackageJsonType'
import { ProjectType } from '@xrengine/common/src/schema.type.module'
import { getMutableState, useHookstate } from '@xrengine/hyperflux'
import Button from '@xrengine/ui/src/primitives/mui/Button'
import Container from '@xrengine/ui/src/primitives/mui/Container'
import DialogActions from '@xrengine/ui/src/primitives/mui/DialogActions'
import LoadingView from '@xrengine/ui/src/primitives/tailwind/LoadingView'

import { NotificationService } from '../../../common/services/NotificationService'
import { ProjectService } from '../../../common/services/ProjectService'
import styles from '../../old-styles/admin.module.scss'
import { ProjectUpdateService, ProjectUpdateState } from '../../services/ProjectUpdateService'
import DrawerView from '../DrawerView'
import ProjectFields from './ProjectFields'

interface Props {
  open: boolean
  inputProject?: ProjectType | null
  existingProject?: boolean
  onClose: () => void
  changeDestination?: boolean
}

const ProjectDrawer = ({ open, inputProject, existingProject = false, onClose, changeDestination = false }: Props) => {
  const { t } = useTranslation()
  const processing = useHookstate(false)

  const project =
    existingProject && inputProject
      ? inputProject
      : {
          id: '',
          name: 'tempProject',
          thumbnail: '',
          repositoryPath: '',
          needsRebuild: false,
          updateType: 'none' as ProjectType['updateType'],
          updateSchedule: DefaultUpdateSchedule,
          commitSHA: '',
          commitDate: new Date()
        }

  const projectUpdateStatus = useHookstate(getMutableState(ProjectUpdateState)[project.name]).value

  const handleSubmit = async () => {
    try {
      if (existingProject && changeDestination) {
        if (inputProject) await ProjectService.setRepositoryPath(inputProject.id, projectUpdateStatus.destinationURL)
        handleClose()
      } else if (projectUpdateStatus.sourceURL) {
        processing.set(true)
        await ProjectService.uploadProject({
          sourceURL: projectUpdateStatus.sourceURL,
          destinationURL: projectUpdateStatus.destinationURL,
          name: projectUpdateStatus.projectName,
          reset: true,
          commitSHA: projectUpdateStatus.selectedSHA,
          sourceBranch: projectUpdateStatus.selectedBranch,
          updateType: projectUpdateStatus.updateType,
          updateSchedule: projectUpdateStatus.updateSchedule
        })
        processing.set(false)
        handleClose()
      }
    } catch (err) {
      processing.set(false)
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }

  const handleClose = () => {
    ProjectUpdateService.clearProjectUpdate(project.name)
    onClose()
  }

  useEffect(() => {
    if (open && inputProject && projectUpdateStatus?.triggerSetDestination?.length === 0) {
      ProjectUpdateService.setTriggerSetDestination(
        project.name,
        inputProject.repositoryPath,
        inputProject.updateType,
        inputProject.updateSchedule
      )
    }
  }, [open, projectUpdateStatus?.triggerSetDestination])

  return (
    <DrawerView open={open} onClose={handleClose}>
      <ProjectFields
        inputProject={inputProject}
        existingProject={existingProject}
        changeDestination={changeDestination}
        processing={processing.value}
      />

      <Container maxWidth="sm" className={styles.mt10}>
        <DialogActions>
          <>
            <Button className={styles.outlinedButton} onClick={handleClose}>
              {t('admin:components.common.cancel')}
            </Button>
            {!processing.value && (
              <Button
                className={styles.gradientButton}
                disabled={projectUpdateStatus ? projectUpdateStatus.submitDisabled : true}
                onClick={handleSubmit}
              >
                {t('admin:components.common.submit')}
              </Button>
            )}

            {processing.value && <LoadingView className="h-6 w-6" title={t('admin:components.project.processing')} />}
          </>
        </DialogActions>
      </Container>
    </DrawerView>
  )
}

export default ProjectDrawer
