import { DashboardLayout } from '@/shared/components/layout'

export function PlantillasPage() {
  return (
    <DashboardLayout>
      <iframe
        src="/formato-permiso-trabajo-alturas.html"
        title="Formato de permiso de trabajo en alturas"
        className="w-full min-h-[calc(100vh-4rem)] border-0"
      />
    </DashboardLayout>
  )
}
