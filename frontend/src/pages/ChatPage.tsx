import { useParams, useNavigate } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import ChatHeader from '@/components/chat/ChatHeader'
import MessageList from '@/components/chat/MessageList'
import MessageInput from '@/components/chat/MessageInput'
import { useChats, useCreateChat } from '@/hooks/useChats'
import { useMessages, useSendMessage } from '@/hooks/useMessages'
import { useUploadAttachment } from '@/hooks/useAttachments'
import { useState } from 'react'

export default function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>()
  const navigate = useNavigate()
  const { data: chats = [] } = useChats()
  const createChat = useCreateChat()
  const { data: messages = [], isLoading } = useMessages(chatId)
  const sendMessage = useSendMessage(chatId ?? '')
  const uploadAttachment = useUploadAttachment(chatId ?? '')
  const [pendingMessage, setPendingMessage] = useState<string>()

  const currentChat = chats.find((c) => c.id === chatId)

  const handleSend = async (message: string, attachmentIds: string[]) => {
    if (!chatId) {
      const chat = await createChat.mutateAsync(undefined)
      navigate(`/chat/${chat.id}`)
      return
    }
    setPendingMessage(message)
    try {
      await sendMessage.mutateAsync({ message, attachmentIds })
    } finally {
      setPendingMessage(undefined)
    }
  }

  const handleUpload = async (file: File) => {
    if (!chatId) {
      const chat = await createChat.mutateAsync(undefined)
      navigate(`/chat/${chat.id}`)
      throw new Error('Chat created, try uploading again')
    }
    return uploadAttachment.mutateAsync(file)
  }

  if (!chatId) {
    return (
      <AppShell>
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
          <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
            <MessageSquare className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-700 mb-2">Conselho de IA</h2>
          <p className="text-center max-w-md mb-6">
            Consulte múltiplas inteligências artificiais e obtenha a decisão mais informada.
            Clique em <strong>Novo Chat</strong> para começar.
          </p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <ChatHeader chat={currentChat} />
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <MessageList
          messages={messages}
          isPending={sendMessage.isPending}
          pendingMessage={pendingMessage}
        />
      )}
      <MessageInput
        onSend={handleSend}
        onUpload={handleUpload}
        isPending={sendMessage.isPending}
      />
    </AppShell>
  )
}
