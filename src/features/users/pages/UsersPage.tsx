import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, UserPlus, Users as UsersIcon, Settings, Pencil, Trash2 } from 'lucide-react'
import { DashboardLayout } from '@/shared/components/layout'
import { Card } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { useUsers } from '../hooks'
import { useDebounce } from '@/shared/hooks'
import { cn } from '@/shared/utils'
import type { User } from '../types'
import {
  CreateUserModal,
  EditUserModal,
  DeleteUserModal,
} from '../components'

export function UsersPage() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage] = useState(20)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [userToEdit, setUserToEdit] = useState<User | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const debouncedSearch = useDebounce(searchQuery, 500)

  const { data, isLoading, isError } = useUsers({
    page: currentPage,
    per_page: perPage,
    search: debouncedSearch || undefined,
  })

  const users: User[] = data?.users ?? []
  const totalUsers = data?.stats?.total ?? 0
  const activeUsers = data?.stats?.active ?? 0
  const inactiveUsers = data?.stats?.inactive ?? 0

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusLabel = (active: boolean) => {
    return active ? t('users.status.active') : t('users.status.inactive')
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-600 text-white">
              <Settings className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {t('users.title')}
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 ml-12">
            {t('users.description')}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {t('users.stats.total')}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {totalUsers}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <UsersIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {t('users.stats.active')}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {activeUsers}
                </p>
              </div>
              <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <UsersIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {t('users.stats.inactive')}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {inactiveUsers}
                </p>
              </div>
              <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800">
                <UsersIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Add Button */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder={t('users.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setIsCreateOpen(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {t('users.newUser')}
          </Button>
        </div>

        {/* Users Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-900/40">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('users.table.name')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('users.table.email')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('users.table.role')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('users.table.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('users.table.lastLogin')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('users.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      {t('users.loading')}
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-red-500">
                      {t('users.error')}
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      {t('users.noUsers')}
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                              {getInitials(user.name)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {user.name}
                            </span>
                            {user.isCurrentUser && (
                              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                {t('users.currentUser')}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {user.email}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          -
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                            user.active
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                          )}
                        >
                          {getStatusLabel(user.active)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {user.updatedAt ? formatDate(user.updatedAt) : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            className={cn(
                              'p-2 rounded-lg transition-colors',
                              user.isCurrentUser
                                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            )}
                            title={
                              user.isCurrentUser
                                ? t('users.cannotEditSelf')
                                : t('users.actions.edit')
                            }
                            onClick={() => !user.isCurrentUser && setUserToEdit(user)}
                            disabled={user.isCurrentUser}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            className={cn(
                              'p-2 rounded-lg transition-colors',
                              user.isCurrentUser
                                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                            )}
                            title={
                              user.isCurrentUser
                                ? t('users.cannotDeleteSelf')
                                : t('users.actions.delete')
                            }
                            onClick={() => !user.isCurrentUser && setUserToDelete(user)}
                            disabled={user.isCurrentUser}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {data && data.pagination && data.pagination.total_pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('users.paginationInfo', {
                  page: data.pagination.page,
                  totalPages: data.pagination.total_pages,
                  total: data.pagination.total,
                })}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  {t('users.previous')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(data.pagination.total_pages, p + 1)
                    )
                  }
                  disabled={
                    currentPage >= data.pagination.total_pages || isLoading
                  }
                >
                  {t('users.next')}
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Modals */}
        <CreateUserModal
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />
        <EditUserModal
          open={!!userToEdit}
          user={userToEdit}
          onClose={() => setUserToEdit(null)}
        />
        <DeleteUserModal
          open={!!userToDelete}
          user={userToDelete}
          onClose={() => setUserToDelete(null)}
        />
      </div>
    </DashboardLayout>
  )
}

