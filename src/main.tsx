import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App.tsx'
import { AuthProvider } from './app/providers/AuthProvider' // <--- Importación nueva
import './app/providers/i18n'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Envolvemos App con el proveedor de autenticación */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)