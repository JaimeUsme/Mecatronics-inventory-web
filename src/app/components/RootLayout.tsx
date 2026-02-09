import { Outlet } from 'react-router-dom'
// Modal de sesión expirada desactivado temporalmente
// import { SessionExpiredModal } from '@/shared/components/feedback/SessionExpiredModal'
// import { useSessionExpiredStore } from '@/shared/store/sessionExpiredStore'

export function RootLayout() {
  // const isExpired = useSessionExpiredStore((state) => state.isExpired)

  return (
    <>
      <Outlet />
      {/* <SessionExpiredModal isOpen={isExpired} /> */}
    </>
  )
}

