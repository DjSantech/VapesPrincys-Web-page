import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import Router from './router.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Toaster 
      position="top-right" 
      reverseOrder={false} 
      toastOptions={{
        style: {
          background: '#141619',
          color: '#fff',
          border: '1px solid #2d2d2d',
        },
      }}
    />
    <Router />
  </StrictMode>,
)