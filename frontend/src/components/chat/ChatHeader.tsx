import { useState } from 'react'
import { Pencil, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRenameChat } from '@/hooks/useChats'
import type { Chat } from '@/types'

interface ChatHeaderProps {
  chat: Chat | undefined
}

export default function ChatHeader({ chat }: ChatHeaderProps) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState('')
  const rename = useRenameChat()

  if (!chat) return null

  const startEdit = () => {
    setTitle(chat.title)
    setEditing(true)
  }

  const saveEdit = async () => {
    if (title.trim()) {
      await rename.mutateAsync({ chatId: chat.id, title: title.trim() })
    }
    setEditing(false)
  }

  const cancelEdit = () => setEditing(false)

  return (
    <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-200 bg-white/60 backdrop-blur-sm">
      {editing ? (
        <>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit()
              if (e.key === 'Escape') cancelEdit()
            }}
            className="flex-1 text-lg font-semibold bg-transparent border-b border-blue-400 outline-none text-slate-800"
          />
          <Button variant="ghost" size="icon" onClick={saveEdit}>
            <Check className="h-4 w-4 text-green-600" />
          </Button>
          <Button variant="ghost" size="icon" onClick={cancelEdit}>
            <X className="h-4 w-4 text-slate-400" />
          </Button>
        </>
      ) : (
        <>
          <h2 className="flex-1 text-lg font-semibold text-slate-800 truncate">{chat.title}</h2>
          <Button variant="ghost" size="icon" onClick={startEdit}>
            <Pencil className="h-4 w-4 text-slate-400 hover:text-slate-600" />
          </Button>
        </>
      )}
    </div>
  )
}
