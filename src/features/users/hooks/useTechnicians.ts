import { useInfiniteQuery } from '@tanstack/react-query'
import { employeesService } from '../services'
import { useAuthStore } from '@/features/auth/store'
import { useProfile } from '@/features/auth/hooks'

const PER_PAGE = 20

export function useTechnicians(search: string) {
  const company = useAuthStore((state) => state.company)
  const { data: profile } = useProfile()

  // Solo habilitar si es Mecatronics y está conectado a Wispro
  const isEnabled =
    company === 'mecatronics' && profile?.wispro?.isConnected === true

  return useInfiniteQuery({
    queryKey: ['technicians', search],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      employeesService.getEmployees({
        page: (pageParam as number) || 1,
        per_page: PER_PAGE,
        search: search || undefined,
        role_name: 'technician',
      }),
    getNextPageParam: (lastPage) => {
      const currentPage = Number(lastPage.pagination.page)
      const perPage = Number(lastPage.pagination.per_page)
      const total = lastPage.pagination.total
      const totalPages =
        lastPage.pagination.total_pages ??
        Math.ceil(total / (perPage || PER_PAGE))

      return currentPage < totalPages ? currentPage + 1 : undefined
    },
    enabled: isEnabled, // Solo ejecutar si está habilitado
    staleTime: 5 * 60 * 1000,
  })
}


