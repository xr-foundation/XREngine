const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined'

/* eslint-disable no-restricted-globals */
const isWebWorker =
  typeof self === 'object' && self.constructor && self.constructor.name === 'DedicatedWorkerGlobalScope'
/* eslint-enable no-restricted-globals */

const isClient =
  typeof process !== 'object' || typeof process.versions !== 'object' || typeof process.versions.node === 'undefined'

const isDev = globalThis.process.env.APP_ENV === 'development'

const isTest = globalThis.process.env.APP_ENV === 'test'

export { isBrowser, isClient, isDev, isTest, isWebWorker }
