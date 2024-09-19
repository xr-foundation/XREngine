
import { describe, expect, it } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import Text from './index'
import { Default as story } from './index.stories'

describe('Text', () => {
  it('- should render', () => {
    const wrapper = shallow(<Text {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
