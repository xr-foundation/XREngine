import { describe, expect, it } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import Input from './index'
import { Default as story } from './index.stories'

describe('Input', () => {
  it('- should render', () => {
    const wrapper = shallow(<Input onChange={() => {}} {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
