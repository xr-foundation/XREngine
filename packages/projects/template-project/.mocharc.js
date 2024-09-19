

module.exports = {
  failZero: false,
  parallel: false,
  require: [
    'tests/mocha.env', // init env here
    'jsdom-global/register'
  ],
  spec: [
    './**/*.test.ts',
    './**/*.test.tsx'
  ],
  extension: [
    'ts',
    'tsx'
  ],
  bail: true,
  exit: true,
  recursive: true,
  jobs: '1',
  timeout: '60000'
};
