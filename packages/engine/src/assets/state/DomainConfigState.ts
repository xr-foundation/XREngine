import { defineState } from '@xrengine/hyperflux'

export const DomainConfigState = defineState({
  name: 'DomainConfigState',
  initial: {
    publicDomain: '',
    cloudDomain: '',
    proxyDomain: ''
  }
})
