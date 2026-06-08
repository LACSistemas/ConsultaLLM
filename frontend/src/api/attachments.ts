import { apiClient } from './client'
import type { Attachment } from '@/types'

export const uploadAttachment = (chatId: string, file: File): Promise<Attachment> => {
  const formData = new FormData()
  formData.append('file', file)
  return apiClient
    .post<Attachment>(`/chats/${chatId}/attachments`, formData)
    .then((response) => response.data)
}

export const deleteAttachment = (chatId: string, attachmentId: string): Promise<void> =>
  apiClient
    .delete(`/chats/${chatId}/attachments/${attachmentId}`)
    .then(() => undefined)

export const getSettings = () =>
  apiClient.get('/settings').then((response) => response.data)
