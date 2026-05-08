import { apiClient } from './client'
import type { Message, CouncilResponse } from '@/types'

export const getMessages = (chatId: string): Promise<Message[]> =>
  apiClient.get<Message[]>(`/chats/${chatId}/messages`).then((r) => r.data)

export const sendMessage = (
  chatId: string,
  message: string,
  attachmentIds: string[] = []
): Promise<CouncilResponse> =>
  apiClient
    .post<CouncilResponse>(`/chats/${chatId}/messages`, {
      message,
      attachment_ids: attachmentIds,
    })
    .then((r) => r.data)
