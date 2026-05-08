import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listChats, createChat, deleteChat, renameChat } from '@/api/chats'

export function useChats() {
  return useQuery({ queryKey: ['chats'], queryFn: listChats })
}

export function useCreateChat() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (title: string | undefined) => createChat(title),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chats'] }),
  })
}

export function useDeleteChat() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (chatId: string) => deleteChat(chatId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chats'] }),
  })
}

export function useRenameChat() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ chatId, title }: { chatId: string; title: string }) =>
      renameChat(chatId, title),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chats'] }),
  })
}
