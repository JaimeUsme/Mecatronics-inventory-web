import { useState, type ReactNode } from 'react'
import { Sidebar } from './sidebar'
import { DashboardHeader } from './dashboard-header'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar
        onCollapseChange={setIsSidebarCollapsed}
        mobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />
      <div
        className={[
          'flex-1 flex flex-col min-w-0 transition-[margin] duration-300',
          'ml-0',
          isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64',
        ].join(' ')}
      >
        <DashboardHeader onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

