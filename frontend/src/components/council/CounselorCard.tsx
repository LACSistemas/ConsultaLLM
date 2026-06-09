import { Brain, Sparkles, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CounselorResponse } from '@/types'

const PROVIDER_STYLE: Record<string, { border: string; bg: string; text: string; icon: React.ReactNode; label: string }> = {
  deepseek: {
    border: 'border-l-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    icon: <Brain className="h-5 w-5" />,
    label: 'DeepSeek',
  },
  gemini: {
    border: 'border-l-green-500',
    bg: 'bg-green-50',
    text: 'text-green-700',
    icon: <Sparkles className="h-5 w-5" />,
    label: 'Gemini',
  },
  anthropic: {
    border: 'border-l-purple-500',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    icon: <Zap className="h-5 w-5" />,
    label: 'Anthropic',
  },
}

interface CounselorCardProps {
  counselor: CounselorResponse
}

export default function CounselorCard({ counselor }: CounselorCardProps) {
  const style = PROVIDER_STYLE[counselor.provider] ?? PROVIDER_STYLE.deepseek

  return (
    <Card className={`border-l-4 ${style.border} ${style.bg} shadow-lg transition-shadow hover:shadow-xl`}>
      <CardHeader className="pb-2">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <Badge variant="outline" className="bg-white/70">{style.label}</Badge>
          <Badge variant="secondary">Função deliberativa</Badge>
        </div>
        <CardTitle className={`flex items-center gap-2 text-base ${style.text}`}>
          {style.icon}
          {counselor.name}
        </CardTitle>
        {counselor.role_description && (
          <p className="text-xs leading-relaxed text-slate-500">{counselor.role_description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Análise independente</p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{counselor.response}</p>
        </div>
        {counselor.critique && (
          <details className="rounded-lg border border-slate-200 bg-white/70 p-3">
            <summary className="cursor-pointer text-sm font-semibold text-slate-700">
              Ver crítica após confronto de perspectivas
            </summary>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{counselor.critique}</p>
          </details>
        )}
      </CardContent>
    </Card>
  )
}
