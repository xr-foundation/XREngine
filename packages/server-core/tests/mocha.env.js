process.env.APP_ENV = 'test'
process.env.NODE_ENV = 'test'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
process.env.FS_PROJECT_SYNC_ENABLED = 'false'

require('ts-node').register({
  project: './tsconfig.json',
  files: true,
  swc: true
})

const appRootPath = require('app-root-path')
const dotenv = require('dotenv-flow')

dotenv.config({
  path: appRootPath.path,
  node_env: 'local'
})
