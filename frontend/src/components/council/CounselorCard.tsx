import { Brain, Sparkles, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CounselorResponse } from '@/types'

const PROVIDER_STYLE: Record<string, { border: string; bg: string; text: string; icon: React.ReactNode }> = {
  deepseek: {
    border: 'border-l-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    icon: <Brain className="h-5 w-5" />,
  },
  gemini: {
    border: 'border-l-green-500',
    bg: 'bg-green-50',
    text: 'text-green-700',
    icon: <Sparkles className="h-5 w-5" />,
  },
  anthropic: {
    border: 'border-l-purple-500',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    icon: <Zap className="h-5 w-5" />,
  },
}

interface CounselorCardProps {
  counselor: CounselorResponse
}

export default function CounselorCard({ counselor }: CounselorCardProps) {
  const style = PROVIDER_STYLE[counselor.provider] ?? PROVIDER_STYLE.deepseek

  return (
    <Card className={`border-l-4 ${style.border} ${style.bg} shadow-lg hover:shadow-xl transition-shadow`}>
      <CardHeader className="pb-2">
        <CardTitle className={`flex items-center gap-2 text-base ${style.text}`}>
          {style.icon}
          {counselor.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">{counselor.response}</p>
      </CardContent>
    </Card>
  )
}
