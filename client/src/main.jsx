import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

import ErrorBoundary from './components/ErrorBoundary'

// global error handler to display runtime errors on screen
window.addEventListener('error', (e) => {
  console.error('Global error captured:', e)
  let dbg = document.getElementById('globalErrorDiv')
  if (!dbg) {
    dbg = document.createElement('div')
    dbg.id = 'globalErrorDiv'
    dbg.style.position = 'fixed'
    dbg.style.top = '0'
    dbg.style.left = '0'
    dbg.style.width = '100%'
    dbg.style.background = 'rgba(200,0,0,0.9)'
    dbg.style.color = 'white'
    dbg.style.padding = '8px'
    dbg.style.zIndex = '9999'
    document.body.appendChild(dbg)
  }
  dbg.textContent = e.message || 'Unknown error'
})

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
