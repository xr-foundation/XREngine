import { MdOutlineAdd, MdOutlineCancel } from 'react-icons/md'

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useReactFlow } from 'reactflow'

import { UndefinedEntity } from '@xrengine/ecs'
import { useVisualScriptFlow, visualToFlow } from '@xrengine/editor/src/components/visualScript/VisualScriptUIModule'
import { useTemplateHandler } from '@xrengine/editor/src/components/visualScript/hooks/useTemplateHandler'
import { useVariableHandler } from '@xrengine/editor/src/components/visualScript/hooks/useVariableHandler'
import { NodetoEnginetype } from '@xrengine/engine'
import { NO_PROXY, useMutableState } from '@xrengine/hyperflux'
import { GraphTemplate, VariableJSON, VisualScriptDomain, VisualScriptState } from '@xrengine/visual-script'
import Button from '../../../../../primitives/tailwind/Button'
import SelectInput from '../../../input/Select'
import StringInput from '../../../input/String'
import PaginatedList from '../../../layout/PaginatedList'
import NodeEditor from '../../../properties/nodeEditor'
import ParameterInput from '../../../properties/parameter'
import { Examples } from '../modals/load'

type templateHandler = ReturnType<typeof useTemplateHandler>
type variableHandler = ReturnType<typeof useVariableHandler>
type visualScriptFlow = ReturnType<typeof useVisualScriptFlow>

export type SidePanelProps = {
  flowref: React.MutableRefObject<HTMLElement | null>
  examples: Examples
  variables: VariableJSON[]
}

export const SidePanel = ({
  flowref,
  examples,
  variables,
  onNodesChange,
  handleAddTemplate,
  handleApplyTemplate,
  handleDeleteTemplate,
  handleEditTemplate,
  handleAddVariable,
  handleEditVariable,
  handleDeleteVariable
}: SidePanelProps &
  Pick<templateHandler, 'handleApplyTemplate' | 'handleDeleteTemplate' | 'handleEditTemplate' | 'handleAddTemplate'> &
  Pick<visualScriptFlow, 'onNodesChange'> &
  Pick<variableHandler, 'handleAddVariable' | 'handleDeleteVariable' | 'handleEditVariable'>) => {
  const reactFlow = useReactFlow()
  const visualScriptState = useMutableState(VisualScriptState)
  const { t } = useTranslation()
  const graphTypes = visualScriptState.registries[VisualScriptDomain.ECS].values.get(NO_PROXY)

  useEffect(() => {
    for (const graph of Object.values(examples)) {
      const [nodes, edges] = visualToFlow(graph)
      handleAddTemplate(nodes, edges)
    }
  }, [examples, handleAddTemplate])

  return (
    <NodeEditor entity={UndefinedEntity} name={t('editor:visualScript.sidePanel.title')}>
      {/*<NodeEditor
        entity={UndefinedEntity}
        name={t('editor:visualScript.sidePanel.node.name')}
        description={t('editor:visualScript.sidePanel.node.description')}
      >
        <PaginatedList
          options={{ countPerPage: 10 }}
          list={Object.keys(visualScriptState.registries[VisualScriptDomain.ECS].nodes)}
          element={(nodeName: string, index) => {
            return (
              <Button
                variant="outline"
                className="w-full truncate p-0 lowercase"
                onClick={() => {
                  const bounds = (flowref.current! as any).getBoundingClientRect()
                  const centerX = bounds.left + bounds.width / 2
                  const centerY = bounds.top + bounds.height / 2
                  const viewportCenter = reactFlow.screenToFlowPosition({ x: centerX, y: centerY } as XYPosition)
                  const position = viewportCenter // need a way to get viewport
                  const newNode = {
                    id: uuidv4(),
                    type: nodeName,
                    position,
                    data: { configuration: {}, values: {} } //fill with default values here
                  }
                  onNodesChange([
                    {
                      type: 'add',
                      item: newNode
                    }
                  ])
                }}
              >
                <Panel title={nodeName}></Panel>
              </Button>
            )
          }}
        ></PaginatedList>
      </NodeEditor>*/}
      <NodeEditor
        entity={UndefinedEntity}
        name={t('editor:visualScript.sidePanel.template.name')}
        description={t('editor:visualScript.sidePanel.template.description')}
      >
        <PaginatedList
          options={{ countPerPage: 5 }}
          list={visualScriptState.templates.get(NO_PROXY) as GraphTemplate[]}
          element={(template: any, index) => {
            return (
              <div className="flex w-full">
                <Button
                  variant="outline"
                  className="h-7 w-[20%]"
                  onClick={() => {
                    handleApplyTemplate(template)
                  }}
                >
                  <MdOutlineAdd className="inline-block shrink-0 text-2xl" />
                </Button>
                <StringInput
                  className="h-7"
                  value={template.name}
                  onChange={(e) => {
                    template.name = e
                    handleEditTemplate(template)
                  }}
                ></StringInput>

                <Button
                  variant="outline"
                  className="h-7 w-[20%]"
                  style={{ width: '20%' }}
                  onClick={() => {
                    handleDeleteTemplate(template)
                  }}
                >
                  <MdOutlineCancel className="inline-block shrink-0 text-2xl" />
                </Button>
              </div>
            )
          }}
        ></PaginatedList>
      </NodeEditor>
      <NodeEditor
        entity={UndefinedEntity}
        name={t('editor:visualScript.sidePanel.variables.name')}
        description={t('editor:visualScript.sidePanel.variables.description')}
      >
        <PaginatedList
          options={{ countPerPage: 5 }}
          list={variables}
          element={(variable: VariableJSON, index) => {
            return (
              <NodeEditor entity={UndefinedEntity} name={variable.name}>
                <div className="flex w-full flex-col">
                  <div className="flex w-full flex-row overflow-hidden">
                    <StringInput
                      value={variable.name}
                      className="h-7"
                      onChange={(e) => {
                        handleEditVariable({ ...variable, name: e })
                      }}
                    ></StringInput>
                    <Button
                      variant="outline"
                      className="h-7 w-[10%] "
                      onClick={() => {
                        handleDeleteVariable(variable)
                      }}
                    >
                      <MdOutlineCancel className="inline-block shrink-0 text-2xl" />
                    </Button>
                  </div>
                  <SelectInput
                    options={Object.keys(graphTypes).map((valueType) => {
                      return { label: valueType, value: valueType }
                    })}
                    value={variable.valueTypeName}
                    onChange={(value) => {
                      handleEditVariable({
                        ...variable,
                        valueTypeName: value as string,
                        initialValue: graphTypes[value].creator()
                      })
                    }}
                  />
                  <ParameterInput
                    entity={`${UndefinedEntity}`}
                    values={[NodetoEnginetype(variable.initialValue, variable.valueTypeName)]}
                    onChange={(key) => (e) => {
                      let value = e
                      if (variable.valueTypeName !== 'object' && typeof e === 'object') value = e.target.value
                      handleEditVariable({ ...variable, initialValue: value })
                    }}
                  />
                </div>
              </NodeEditor>
            )
          }}
        ></PaginatedList>
        <div className="flex w-full flex-row justify-center">
          <Button
            variant="outline"
            onClick={() => {
              handleAddVariable()
            }}
          >
            {t('editor:visualScript.sidePanel.variables.add')}
          </Button>
        </div>
      </NodeEditor>
    </NodeEditor>
  )
}

export default SidePanel
