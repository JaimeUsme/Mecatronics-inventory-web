import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from './components/RootLayout'
import { LoginPage, AccountSettingsPage } from '@/features/auth/pages'
import { DashboardPage, MyOrdersPage } from '@/features/dashboard'
import { EmployeesPage, UsersPage } from '@/features/users'
import { MaterialsPage, LocationsPage, StockManagementPage, TransfersPage } from '@/features/inventory'
import { ServiceOrderMaterialsPage } from '@/features/service-orders'
import { CrewManagementPage } from '@/features/crews'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <LoginPage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
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
        path: '/dashboard/account',
        element: <AccountSettingsPage />,
      },
    ],
  },
])

