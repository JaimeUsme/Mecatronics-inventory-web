import { useState, useMemo, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Search, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { DashboardLayout } from '@/shared/components/layout'
import { useDebounce } from '@/shared/hooks'
import { EmployeeCard, type Employee } from '../components'
import { useEmployees } from '../hooks'

export function EmployeesPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [roleFilter, setRoleFilter] = useState<string>(searchParams.get('role') || 'all')
  
  // Debounce para la búsqueda (500ms después de que el usuario deje de escribir)
  const debouncedSearch = useDebounce(searchQuery, 500)
  
  // Leer página de la URL, por defecto 1
  const currentPage = useMemo(() => {
    const page = searchParams.get('page')
    return page ? parseInt(page, 10) : 1
  }, [searchParams])
  
  const [perPage] = useState(20)

  // Actualizar URL cuando cambia el debouncedSearch (solo si realmente cambió)
  const prevDebouncedSearchRef = useRef(debouncedSearch)
  useEffect(() => {
    const prevSearch = prevDebouncedSearchRef.current
    const newSearch = debouncedSearch.trim()
    
    // Solo actualizar si la búsqueda realmente cambió
    if (prevSearch !== newSearch) {
      prevDebouncedSearchRef.current = newSearch
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev)
        if (newSearch) {
          newParams.set('search', newSearch)
        } else {
          newParams.delete('search')
        }
        // Resetear a página 1 cuando cambia la búsqueda
        newParams.set('page', '1')
        return newParams
      })
    }
  }, [debouncedSearch, setSearchParams])

  // Leer búsqueda de la URL
  const searchFromUrl = searchParams.get('search') || ''

  const { data, isLoading, isError, error } = useEmployees({
    page: currentPage,
    per_page: perPage,
    search: searchFromUrl || undefined,
  })

  // Mapear datos de la API al formato de Employee
  const employees: Employee[] = useMemo(() => {
    if (!data?.employees) return []
    return data.employees.map((emp) => ({
      id: emp.id,
      public_id: emp.public_id,
      name: emp.name,
      email: emp.email,
      phone: emp.phone_mobile,
      status: emp.active ? 'Activo' : 'Inactivo',
      role: emp.roles?.[0]?.id,
      roleName: emp.roles?.[0]?.name,
    }))
  }, [data])

  // Obtener roles únicos para el filtro
  const availableRoles = useMemo(() => {
    const roles = new Set<string>()
    employees.forEach((emp) => {
      if (emp.role) {
        roles.add(emp.role)
      }
    })
    return Array.from(roles)
  }, [employees])

  // Filtrar empleados solo por rol (la búsqueda se hace en el backend)
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesRole = roleFilter === 'all' || employee.role === roleFilter
      return matchesRole
    })
  }, [employees, roleFilter])

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev)
        newParams.set('page', newPage.toString())
        return newParams
      })
      // Scroll al inicio de la página
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNextPage = () => {
    if (data?.pagination) {
      const totalPages = Math.ceil(
        data.pagination.total / Number(data.pagination.per_page)
      )
      if (currentPage < totalPages) {
        const newPage = currentPage + 1
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev)
          newParams.set('page', newPage.toString())
          return newParams
        })
        // Scroll al inicio de la página
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  // Resetear a página 1 cuando cambia el filtro de rol (solo si realmente cambió)
  const prevRoleFilterRef = useRef(roleFilter)
  useEffect(() => {
    const prevRole = prevRoleFilterRef.current
    const newRole = roleFilter
    
    // Solo resetear si el filtro realmente cambió
    if (prevRole !== newRole) {
      prevRoleFilterRef.current = newRole
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev)
        newParams.set('page', '1')
        if (newRole !== 'all') {
          newParams.set('role', newRole)
        } else {
          newParams.delete('role')
        }
        return newParams
      })
    }
  }, [roleFilter, setSearchParams])

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header con título, contador y botón */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {t('employees.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {data?.pagination?.total ?? 0} {t('employees.employeesCount')}
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <UserPlus className="h-4 w-4 mr-2" />
            {t('employees.addEmployee')}
          </Button>
        </div>

        {/* Búsqueda y filtros */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder={t('employees.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t('employees.allRoles')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('employees.allRoles')}</SelectItem>
              {availableRoles.map((roleId) => {
                const role = employees.find((emp) => emp.role === roleId)
                return (
                  <SelectItem key={roleId} value={roleId}>
                    {role?.roleName || roleId}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Estado de carga */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              {t('employees.loading')}
            </p>
          </div>
        )}

        {/* Estado de error */}
        {isError && (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">
              {error instanceof Error
                ? error.message
                : t('employees.error')}
            </p>
          </div>
        )}

        {/* Grid de empleados */}
        {!isLoading && !isError && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredEmployees.map((employee) => (
                <EmployeeCard key={employee.id} employee={employee} />
              ))}
            </div>

            {/* Paginación */}
            {data?.pagination && (() => {
              const totalPages = Math.ceil(
                data.pagination.total / Number(data.pagination.per_page)
              )
              const currentPageNum = Number(data.pagination.page)
              
              if (totalPages <= 1) return null
              
              return (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('employees.paginationInfo', {
                      page: currentPageNum,
                      totalPages: totalPages,
                      total: data.pagination.total,
                    })}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handlePreviousPage}
                      disabled={currentPageNum === 1 || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      {t('employees.previous')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleNextPage}
                      disabled={currentPageNum >= totalPages || isLoading}
                    >
                      {t('employees.next')}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )
            })()}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

