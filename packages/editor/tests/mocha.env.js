

process.env.APP_ENV = 'test'
process.env.NODE_ENV = 'test'
process.env.NODE_TLS_REJECT_UNAUTHORIZED='0'

require("ts-node").register({
  project: './tsconfig.json',
  files: true,
  swc: true
})

require("fix-esm").register()

const hook = require('css-modules-require-hook')
const sass = require('sass')

hook({
  extensions: [ '.scss' ],
  preprocessCss: data => sass.renderSync({ data }).css
})

// Silence act() warnings
const originalError = console.error
console.error = (...args) => {
  if (/Warning: The current testing environment is not configured to support act/.test(args[0])) {
    return
  }
  originalError.call(console, ...args)
}
