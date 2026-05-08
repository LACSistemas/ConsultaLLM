import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMessages, sendMessage } from '@/api/messages'

export function useMessages(chatId: string | undefined) {
  return useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => getMessages(chatId!),
    enabled: !!chatId,
  })
}

export function useSendMessage(chatId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      message,
      attachmentIds,
    }: {
      message: string
      attachmentIds?: string[]
    }) => sendMessage(chatId, message, attachmentIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages', chatId] })
      qc.invalidateQueries({ queryKey: ['chats'] })
    },
  })
}
