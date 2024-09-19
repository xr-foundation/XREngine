
import React, { PropsWithChildren, Suspense } from 'react'

import { hasComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { EditorPropType } from '@xrengine/editor/src/components/properties/Util'
import { EditorControlFunctions } from '@xrengine/editor/src/functions/EditorControlFunctions'
import { SelectionState } from '@xrengine/editor/src/services/SelectionServices'
import { useTranslation } from 'react-i18next'
import LoadingView from '../../../../primitives/tailwind/LoadingView'
import Text from '../../../../primitives/tailwind/Text'
import PropertyGroup from '../group'

interface NodeErrorProps {
  name?: string
  children?: React.ReactNode
}

interface NodeErrorState {
  error: Error | null
}

class NodeEditorErrorBoundary extends React.Component<NodeErrorProps, NodeErrorState> {
  public state: NodeErrorState = {
    error: null
  }

  public static getDerivedStateFromError(error: Error): NodeErrorState {
    // Update state so the next render will show the fallback UI.
    return { error }
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.error) {
      return (
        <div className="m-2.5 overflow-auto bg-gray-600 text-red-500">
          <Text fontWeight="bold" component="h1">
            [{this.props.name}] {this.state.error.message}`
          </Text>
          <pre>{this.state.error.stack}</pre>
        </div>
      )
    }

    return this.props.children
  }
}

type NodeEditorProps = EditorPropType & {
  description?: string
  name?: string
  icon?: JSX.Element
}

export const NodeEditor: React.FC<PropsWithChildren<NodeEditorProps>> = ({
  description,
  children,
  name,
  entity,
  component,
  icon
}) => {
  const { t } = useTranslation()

  return (
    <PropertyGroup
      name={name}
      description={description}
      icon={icon}
      onClose={
        component && hasComponent(entity, component)
          ? () => {
              const entities = SelectionState.getSelectedEntities()
              EditorControlFunctions.addOrRemoveComponent(entities, component, false)
            }
          : undefined
      }
    >
      <Suspense
        fallback={
          <LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loadingApp', { name })} />
        }
      >
        <NodeEditorErrorBoundary name={name}>{children}</NodeEditorErrorBoundary>
      </Suspense>
    </PropertyGroup>
  )
}

export default NodeEditor
