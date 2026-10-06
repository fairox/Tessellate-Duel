import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/holo.css'
import App from './App.tsx'
import { PlateLoader } from './components/PlateLoader'
import { DustField } from './components/DustField'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PlateLoader>
      <App />
    </PlateLoader>
    <DustField />
  </StrictMode>,
)
