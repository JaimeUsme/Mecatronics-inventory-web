import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crewsService } from '../services/crews.service'
import type { AddCrewMemberRequest, CrewMember } from '../types'

export function useAddCrewMember(crewId: string) {
  const queryClient = useQueryClient()

  return useMutation<CrewMember, Error, AddCrewMemberRequest>({
    mutationFn: (payload) => crewsService.addMember(crewId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crews'] })
    },
  })
}

export function useRemoveCrewMember(crewId: string) {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (memberId) => crewsService.removeMember(crewId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crews'] })
    },
  })
}


