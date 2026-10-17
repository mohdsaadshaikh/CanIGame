import { MantineProvider } from '@mantine/core'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { cssVariablesResolver, mantineTheme } from './lib/theme'

import '@mantine/core/styles.css'
import '@mantine/spotlight/styles.css'

import './assets/css/fonts.css'
import './assets/css/main.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider
      theme={mantineTheme}
      cssVariablesResolver={cssVariablesResolver}
      forceColorScheme="dark"
    >
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </MantineProvider>
  </StrictMode>
)
