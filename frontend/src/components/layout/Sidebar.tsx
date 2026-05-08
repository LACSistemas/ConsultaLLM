import { useNavigate, useParams } from 'react-router-dom'
import { Plus, MessageSquare, Trash2, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useChats, useCreateChat, useDeleteChat } from '@/hooks/useChats'
import type { Chat } from '@/types'

export default function Sidebar() {
  const navigate = useNavigate()
  const { chatId } = useParams()
  const { data: chats = [], isLoading } = useChats()
  const createChat = useCreateChat()
  const deleteChat = useDeleteChat()

  const handleNewChat = async () => {
    const chat = await createChat.mutateAsync(undefined)
    navigate(`/chat/${chat.id}`)
  }

  const handleDeleteChat = async (e: React.MouseEvent, chat: Chat) => {
    e.stopPropagation()
    await deleteChat.mutateAsync(chat.id)
    if (chatId === chat.id) {
      navigate('/chat')
    }
  }

  return (
    <div className="w-72 flex flex-col bg-white/80 backdrop-blur-sm border-r border-slate-200 shadow-lg">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Conselho de IA
          </h1>
        </div>
        <Button
          onClick={handleNewChat}
          disabled={createChat.isPending}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoading && (
          <p className="text-sm text-slate-500 text-center py-4 italic">Carregando...</p>
        )}
        {!isLoading && chats.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-4 italic">
            Nenhum chat ainda
          </p>
        )}
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => navigate(`/chat/${chat.id}`)}
            className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
              chatId === chat.id
                ? 'bg-blue-100 text-blue-800'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <MessageSquare className="h-4 w-4 flex-shrink-0 text-slate-400" />
              <span className="text-sm font-medium truncate">{chat.title}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 flex-shrink-0"
              onClick={(e) => handleDeleteChat(e, chat)}
            >
              <Trash2 className="h-3 w-3 text-slate-400 hover:text-red-500" />
            </Button>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-600 hover:text-slate-800"
          onClick={() => navigate('/settings')}
        >
          <Settings className="h-4 w-4 mr-2" />
          Configurações
        </Button>
      </div>
    </div>
  )
}
