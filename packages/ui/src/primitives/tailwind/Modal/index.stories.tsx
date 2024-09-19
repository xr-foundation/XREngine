
import React from 'react'

import { PopoverState } from '@xrengine/client-core/src/common/services/PopoverState'

import Button from '../Button'
import PopupMenu from '../PopupMenu'
import Modal from './index'

const ModelStory = ({ title }) => {
  const onClose = () => {
    PopoverState.hidePopupover()
  }

  const onOpen = () => {
    PopoverState.showPopupover(
      <Modal title={title} onClose={onClose} onSubmit={() => {}}>
        <div className="mb-5 flex flex-col border-b border-[#e5e7eb]">
          <label className="text-secondary">Location</label>
          <input className="fIocus:outline-none rounded-lg px-3.5 py-1.5" type="text" placeholder="Enter here" />

          <label className="text-secondary mt-6">Count</label>
          <input
            className="rounded-lg px-3.5 py-1.5 focus:outline-none"
            value="3"
            type="number"
            placeholder="Enter here"
          />
        </div>
      </Modal>
    )
  }

  return (
    <div>
      <Button onClick={onOpen}>Open Modal</Button>
      <PopupMenu />
    </div>
  )
}

const MultipleModelStory = ({ title }) => {
  const onClose = () => {
    PopoverState.hidePopupover()
  }

  const onSecondPopupOpen = () => {
    PopoverState.showPopupover(
      <Modal title={title} onClose={onClose} onSubmit={() => {}}>
        <div className="mb-5 flex flex-col border-b border-[#e5e7eb]">
          <label className="text-secondary">Location</label>
          <input className="fIocus:outline-none rounded-lg px-3.5 py-1.5" type="text" placeholder="Enter here" />

          <label className="text-secondary mt-6">Count</label>
          <input
            className="rounded-lg px-3.5 py-1.5 focus:outline-none"
            value="3"
            type="number"
            placeholder="Enter here"
          />
        </div>
      </Modal>
    )
  }

  return (
    <div>
      <Button
        onClick={() => {
          PopoverState.showPopupover(
            <Modal title="First Modal" onClose={onClose}>
              <Button onClick={onSecondPopupOpen}>Click to open modal</Button>
            </Modal>
          )
        }}
      >
        Open Modal
      </Button>
      <PopupMenu />
    </div>
  )
}

export default {
  title: 'Primitives/Tailwind/Modal',
  component: ModelStory,
  parameters: {
    componentSubtitle: 'Modal',
    jest: 'Modal.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  }
}

export const Default = {
  args: {
    title: 'Patch Instance Server'
  }
}

export const Multiple = {
  component: MultipleModelStory,
  args: {
    title: 'Second Modal'
  }
}
