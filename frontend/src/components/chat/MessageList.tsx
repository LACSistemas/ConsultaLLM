import { useEffect, useRef } from 'react'
import { User } from 'lucide-react'
import type { Message, CEODecision } from '@/types'
import CounselorPanel from '@/components/council/CounselorPanel'
import CEOCard from '@/components/council/CEOCard'
import LoadingCounselors from '@/components/council/LoadingCounselors'

function parseCEOContent(content: string): CEODecision {
  const defaults: CEODecision = {
    status: 'recommendation',
    decision: content,
    reasoning: '',
    confidence: {
      level: 'medium',
      rationale: 'A resposta não informou uma avaliação qualitativa completa.',
      supporting_factors: [],
      limiting_factors: [],
    },
    consensus: [],
    disagreements: [],
    minority_views: [],
    counselor_assessments: [],
    known_facts: [],
    assumptions: [],
    inferences: [],
    value_judgments: [],
    unknowns: [],
    risks: [],
    verification_needed: [],
    clarifying_questions: [],
    next_steps: [],
  }

  try {
    const parsed = JSON.parse(content) as Partial<CEODecision> & { confidence?: CEODecision['confidence'] | number }
    const legacyConfidence = typeof parsed.confidence === 'number' ? parsed.confidence : undefined
    const confidence = legacyConfidence === undefined
      ? { ...defaults.confidence, ...(parsed.confidence ?? {}) }
      : {
          level: legacyConfidence >= 0.75 ? 'high' as const : legacyConfidence < 0.45 ? 'low' as const : 'medium' as const,
          rationale: 'Classificação aproximada migrada de uma resposta antiga.',
          supporting_factors: [],
          limiting_factors: ['A resposta original usava autoconfiança numérica não calibrada.'],
        }

    const assessments = (parsed.counselor_assessments ?? []).map((assessment) => {
      const legacy = assessment as typeof assessment & { confidence?: number; reliability?: 'low' | 'medium' | 'high' }
      return {
        ...assessment,
        role: assessment.role ?? '',
        reliability: legacy.reliability ?? (legacy.confidence !== undefined
          ? legacy.confidence >= 0.75 ? 'high' : legacy.confidence < 0.45 ? 'low' : 'medium'
          : 'medium'),
      }
    })

    return { ...defaults, ...parsed, confidence, counselor_assessments: assessments } as CEODecision
  } catch {
    return defaults
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
