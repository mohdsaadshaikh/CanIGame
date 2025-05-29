import { MantineProvider } from '@mantine/core'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

import '@mantine/core/styles.css'
import '@mantine/spotlight/styles.css'

import './assets/css/fonts.css'
import './assets/css/main.css'
import { mantineTheme } from './lib/theme'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={mantineTheme}>
      <App />
    </MantineProvider>
  </StrictMode>
)
