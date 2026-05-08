import { apiClient } from './client'
import type { Attachment } from '@/types'

export const uploadAttachment = (chatId: string, file: File): Promise<Attachment> => {
  const formData = new FormData()
  formData.append('file', file)
  return apiClient
    .post<Attachment>(`/chats/${chatId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data)
}

export const getSettings = () =>
  apiClient.get('/settings').then((r) => r.data)
