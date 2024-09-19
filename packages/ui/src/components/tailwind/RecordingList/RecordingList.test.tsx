import { describe, expect, it } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import RecordingList from './index'
import { Default as story } from './index.stories'

describe('RecordingList', () => {
  it('- should render', () => {
    const wrapper = shallow(<RecordingList {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
