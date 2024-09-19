
import MetaTags from '@xrengine/client-core/src/common/components/MetaTags'
import { ThemeProvider } from '@xrengine/client-core/src/common/services/ThemeService'
import { Description, Primary, Stories, Subtitle, Title } from '@storybook/addon-docs'
import { Preview } from '@storybook/react'
import React, { lazy } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { withRouter } from 'storybook-addon-react-router-v6'
import '../../client/src/themes/base.css'
import '../../client/src/themes/components.css'
import '../../client/src/themes/utilities.css'

const Engine = lazy(() => import('@xrengine/client/src/engine'))

export const decorators = [
  withRouter,
  (Story) => {
    return (
      <Engine>
        <ThemeProvider>
          <DndProvider backend={HTML5Backend}>
            <MetaTags>
              <link
                href="https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&display=swap"
                rel="stylesheet"
                type="text/css"
              />
            </MetaTags>
            <Story />
          </DndProvider>
        </ThemeProvider>
      </Engine>
    )
  }
]

const preview: Preview = {
  globalTypes: {
    eeEnabled: {
      description: 'XREngine',
      defaultValue: false
    }
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/
      }
    },
    options: {
      storySort: {
        order: ['Pages', 'Admin', 'Components', 'Primitives', 'Addons', 'Expermiental']
      }
    },
    docs: {
      source: {
        type: 'code'
      },
      page: () => (
        <>
          <Title />
          <Subtitle />
          <Description />
          <Primary />
          <Stories />
        </>
      )
    },
    actions: { argTypesRegex: '^on[A-Z].*' }
  }
}

export default preview
