import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { MessageSquare } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import ChatHeader from '@/components/chat/ChatHeader'
import MessageList from '@/components/chat/MessageList'
import MessageInput from '@/components/chat/MessageInput'
import { useChats, useCreateChat } from '@/hooks/useChats'
import { useMessages, useSendMessage } from '@/hooks/useMessages'
import { useUploadAttachment } from '@/hooks/useAttachments'
import { sendMessage as sendMessageRequest } from '@/api/messages'
import { uploadAttachment as uploadAttachmentRequest } from '@/api/attachments'

export default function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: chats = [] } = useChats()
  const createChat = useCreateChat()
  const { data: messages = [], isLoading } = useMessages(chatId)
  const sendMessage = useSendMessage(chatId ?? '')
  const uploadAttachment = useUploadAttachment(chatId ?? '')
  const [pendingMessage, setPendingMessage] = useState<string>()
  const [isCreatingAndSending, setIsCreatingAndSending] = useState(false)
  const creatingChatRef = useRef<Promise<string> | null>(null)

  const currentChat = chats.find((chat) => chat.id === chatId)
  const isPending = sendMessage.isPending || isCreatingAndSending

  const ensureChat = async () => {
    if (chatId) return chatId
    if (!creatingChatRef.current) {
      creatingChatRef.current = createChat
        .mutateAsync(undefined)
        .then((chat) => {
          navigate(`/chat/${chat.id}`)
          return chat.id
        })
        .catch((error) => {
          creatingChatRef.current = null
          throw error
        })
    }
    return creatingChatRef.current
  }

  const handleSend = async (message: string, attachmentIds: string[]) => {
    setPendingMessage(message)

    if (!chatId) {
      setIsCreatingAndSending(true)
      try {
        const newChatId = await ensureChat()
        await sendMessageRequest(newChatId, message, attachmentIds)
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['messages', newChatId] }),
          queryClient.invalidateQueries({ queryKey: ['chats'] }),
        ])
      } finally {
        setIsCreatingAndSending(false)
        setPendingMessage(undefined)
      }
      return
    }

    try {
      await sendMessage.mutateAsync({ message, attachmentIds })
    } finally {
      setPendingMessage(undefined)
    }
  }

  const handleUpload = async (file: File) => {
    if (!chatId) {
      const newChatId = await ensureChat()
      return uploadAttachmentRequest(newChatId, file)
    }
    return uploadAttachment.mutateAsync(file)
  }

  return (
    <AppShell>
      {chatId ? (
        <>
          <ChatHeader chat={currentChat} />
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
            </div>
          ) : (
            <MessageList
              messages={messages}
              isPending={isPending}
              pendingMessage={pendingMessage}
            />
          )}
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-slate-500">
          <div className="mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-4">
            <MessageSquare className="h-12 w-12 text-white" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-700">Conselho de IA</h2>
          <p className="max-w-md text-center">
            Digite sua primeira pergunta abaixo. O chat será criado e a mensagem será enviada automaticamente.
          </p>
        </div>
      )}
      <MessageInput
        onSend={handleSend}
        onUpload={handleUpload}
        isPending={isPending}
      />
    </AppShell>
  )
}
