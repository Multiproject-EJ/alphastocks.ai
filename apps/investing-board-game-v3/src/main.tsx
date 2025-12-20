import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import "@github/spark/spark"

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { OverlayProvider } from './context/OverlayContext.tsx'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

// Conditionally import devtools
let DevicePreview: any = null
let DevToolsOverlay: any = null

// Check if devtools should be enabled
const isDevToolsEnabled = () => {
  // Check environment variable (Vite)
  if (import.meta.env.VITE_DEVTOOLS === '1') return true
  
  // Check dev mode
  if (import.meta.env.DEV) return true
  
  // Check query param
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    if (params.get('devtools') === '1') return true
  }
  
  return false
}

// Store the React root
const root = createRoot(document.getElementById('root')!)

// Dynamically import devtools in dev mode
if (isDevToolsEnabled()) {
  import('./devtools/index.ts').then((module) => {
    DevicePreview = module.DevicePreview
    DevToolsOverlay = module.DevToolsOverlay
    
    // Re-render with devtools if they're loaded after initial render
    if (DevicePreview && DevToolsOverlay) {
      renderApp()
    }
  })
}

function renderApp() {
  const AppContent = (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AuthProvider>
        <OverlayProvider>
          <App />
        </OverlayProvider>
      </AuthProvider>
    </ErrorBoundary>
  )

  // Wrap with devtools if enabled and loaded
  const content = (DevicePreview && DevToolsOverlay) ? (
    <DevicePreview>
      {AppContent}
      <DevToolsOverlay />
    </DevicePreview>
  ) : AppContent

  root.render(content)
}

renderApp()
