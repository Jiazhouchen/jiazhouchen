import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/roboto/latin-400.css'
import '@fontsource/roboto/latin-400-italic.css'
import '@fontsource/roboto/latin-500.css'
import '@fontsource/roboto/latin-700.css'
import '@fontsource/roboto/latin-900.css'
import '@fontsource/roboto-condensed/latin-500.css'
import '@fontsource/roboto-condensed/latin-700.css'
import '@fontsource/roboto-condensed/latin-800.css'
import '@fontsource/roboto-condensed/latin-900.css'
import { App } from './App'
import './styles/tokens.css'
import './styles/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
