
process.env.APP_ENV = 'test'
process.env.NODE_ENV = 'test'
process.env.NODE_TLS_REJECT_UNAUTHORIZED='0'
process.env.IS_REACT_ACT_ENVIRONMENT = true

require("ts-node").register({
  project: './tsconfig.json',
  files: true,
  swc: true
})

require("fix-esm").register()
