import { apiClient } from './client'
import type { Chat, ChatList } from '@/types'

export const listChats = (): Promise<Chat[]> =>
  apiClient.get<ChatList>('/chats').then((r) => r.data.chats)

export const getChat = (chatId: string): Promise<Chat> =>
  apiClient.get<Chat>(`/chats/${chatId}`).then((r) => r.data)

export const createChat = (title?: string): Promise<Chat> =>
  apiClient.post<Chat>('/chats', { title }).then((r) => r.data)

export const renameChat = (chatId: string, title: string): Promise<Chat> =>
  apiClient.patch<Chat>(`/chats/${chatId}`, { title }).then((r) => r.data)

export const deleteChat = (chatId: string): Promise<void> =>
  apiClient.delete(`/chats/${chatId}`).then(() => undefined)
