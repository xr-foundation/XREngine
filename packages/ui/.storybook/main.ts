
import { dirname, join } from 'path'
import type { StorybookConfig } from '@storybook/react-vite'
import { mergeConfig } from 'vite'

const host = process.env['VITE_APP_HOST']

const config: StorybookConfig = {
  env: (config) => ({
    ...config,
    ...require('dotenv').config({
      path: '../../.env.local'
    }).parsed
  }),
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-toolbars'),
    getAbsolutePath('@storybook/manager-api'),
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-interactions'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-jest'),
    getAbsolutePath('storybook-addon-react-router-v6'),
    getAbsolutePath('storybook-addon-sass-postcss')
  ],
  core: {},
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {}
  },
  async viteFinal(config, options) {
    const userConfig = config
    return mergeConfig(config, {
      ...userConfig,
      define: {
        ...userConfig?.define,
        'process.env': process.env
      },
      resolve: {
        ...userConfig?.resolve,
        alias: {
          ...userConfig?.resolve?.alias,
          path: require.resolve('path-browserify'),
          crypto: require.resolve('crypto-browserify'),
          stream: require.resolve('stream-browserify'),
          // alias public folder to root
          '@': require('path').resolve(__dirname, '../../client/public')
        }
      },
      server: {
        ...userConfig?.server,
        proxy: {
          ...userConfig?.server?.proxy,
          cors: false,
          '^3030': {
            target: `https://${host}:3030`,
            changeOrigin: true,
            secure: false,
            ws: true
          },
          '^3031': {
            target: `https://${host}:3031`,
            changeOrigin: true,
            secure: false,
            ws: true
          },
          '/sfx': {
            target: `https://${host}:3000`,
            changeOrigin: true,
            secure: false,
            // replace port 6006 with 3000
            pathRewrite: { '^6006': '3000' }
          },
          '/fonts': {
            target: `https://${host}:3000`,
            changeOrigin: true,
            secure: false,
            // replace port 6006 with 3000
            pathRewrite: { '^6006': '3000' }
          }
        }
      },
      plugins: []
    })
  },
  docs: {
    autodocs: false
  }
}

export default config

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')))
}
