import { useEffect, useRef } from 'react'
import { User } from 'lucide-react'
import type { Message, CEODecision } from '@/types'
import CounselorPanel from '@/components/council/CounselorPanel'
import CEOCard from '@/components/council/CEOCard'
import LoadingCounselors from '@/components/council/LoadingCounselors'

function parseCEOContent(content: string): CEODecision {
  try {
    return JSON.parse(content) as CEODecision
  } catch {
    return { decision: content, reasoning: '' }
  }
}

interface MessageListProps {
  messages: Message[]
  isPending: boolean
  pendingMessage?: string
}

export default function MessageList({ messages, isPending, pendingMessage }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isPending])

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages.length === 0 && !isPending && (
        <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
          <p className="text-lg font-medium mb-2">Consulte o Conselho de IA</p>
          <p className="text-sm">Digite sua pergunta abaixo para receber perspectivas de múltiplos modelos</p>
        </div>
      )}

      {messages.map((msg) => (
        <div key={msg.id}>
          {msg.role === 'user' ? (
            <div className="flex justify-end">
              <div className="flex items-start gap-2 max-w-2xl">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl rounded-tr-sm px-4 py-3">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
                <div className="flex-shrink-0 w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-slate-500" />
                </div>
              </div>
            </div>
          ) : (
            <div>
              {msg.counselor_responses && msg.counselor_responses.length > 0 && (
                <CounselorPanel counselors={msg.counselor_responses} />
              )}
              <CEOCard decision={parseCEOContent(msg.content)} />
            </div>
          )}
        </div>
      ))}

      {isPending && pendingMessage && (
        <>
          <div className="flex justify-end">
            <div className="flex items-start gap-2 max-w-2xl">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl rounded-tr-sm px-4 py-3">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{pendingMessage}</p>
              </div>
              <div className="flex-shrink-0 w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-slate-500" />
              </div>
            </div>
          </div>
          <LoadingCounselors />
        </>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
