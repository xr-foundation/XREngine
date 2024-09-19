import { describe, expect, it } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import AvatarImage from './index'
import { Default as story } from './index.stories'

describe('AvatarImage', () => {
  it('- should render', () => {
    const wrapper = shallow(<AvatarImage {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
