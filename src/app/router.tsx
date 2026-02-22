import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './providers/AuthProvider'
import { RootLayout } from './components/RootLayout'
import { LoginPage, AccountSettingsPage } from '@/features/auth/pages'
import { DashboardPage, MyOrdersPage } from '@/features/dashboard'
import { EmployeesPage, UsersPage } from '@/features/users'
import { MaterialsPage, LocationsPage, StockManagementPage, TransfersPage } from '@/features/inventory'
import { ServiceOrderMaterialsPage } from '@/features/service-orders'
import { CrewManagementPage } from '@/features/crews'
import { SecurityFormsPage, FillFormPage, TemplateManagementPage, FormReviewPage, PlantillasPage } from '@/features/security-forms'

// --- GUARDIAS DE SEGURIDAD ---

/**
 * Solo permite el acceso si NO hay un token.
 * Si el usuario ya está logueado, lo redirige al dashboard.
 */
const PublicRoute = () => {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null // O un spinner de carga
  return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" replace />
}

/**
 * Solo permite el acceso si HAY un token.
 * Si no hay token, lo expulsa al login.
 */
const PrivateRoute = () => {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

// --- CONFIGURACIÓN DEL ROUTER ---

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // RUTAS PÚBLICAS (Login)
      {
        element: <PublicRoute />,
        children: [
          { path: '/', element: <LoginPage /> },
          { path: '/login', element: <LoginPage /> },
        ],
      },
      
      // RUTAS PRIVADAS (Todo lo que cuelga de Dashboard)
      {
        element: <PrivateRoute />,
        children: [
          {
            path: '/dashboard',
            element: <DashboardPage />,
          },
          {
            path: '/dashboard/my-orders',
            element: <MyOrdersPage />,
          },
          {
            path: '/dashboard/employees',
            element: <EmployeesPage />,
          },
          {
            path: '/dashboard/inventory/materials',
            element: <MaterialsPage />,
          },
          {
            path: '/dashboard/inventory/locations',
            element: <LocationsPage />,
          },
          {
            path: '/dashboard/inventory/stock',
            element: <StockManagementPage />,
          },
          {
            path: '/dashboard/inventory/transfers',
            element: <TransfersPage />,
          },
          {
            path: '/dashboard/service-orders/materials',
            element: <ServiceOrderMaterialsPage />,
          },
          {
            path: '/dashboard/crews',
            element: <CrewManagementPage />,
          },
          {
            path: '/dashboard/users',
            element: <UsersPage />,
          },
          {
            path: '/dashboard/security-forms',
            element: <SecurityFormsPage />,
          },
          {
            path: '/dashboard/security-forms/fill/:templateId',
            element: <FillFormPage />,
          },
          {
            path: '/dashboard/security-forms/manage',
            element: <TemplateManagementPage />,
          },
          {
            path: '/dashboard/security-forms/review',
            element: <FormReviewPage />,
          },
          {
            path: '/dashboard/security-forms/plantillas',
            element: <PlantillasPage />,
          },
          {
            path: '/dashboard/account',
            element: <AccountSettingsPage />,
          },
        ],
      },
      // Redirección por defecto si la ruta no existe
      {
        path: '*',
        element: <Navigate to="/login" replace />,
      },
    ],
  },
])