import { Crown } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { CEODecision } from '@/types'

interface CEOCardProps {
  decision: CEODecision
}

export default function CEOCard({ decision }: CEOCardProps) {
  return (
    <Card className="border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800 text-xl">
          <Crown className="h-6 w-6" />
          Decisão Final do CEO
        </CardTitle>
        <CardDescription className="text-yellow-700">
          Análise consolidada baseada em todas as perspectivas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <Badge variant="secondary" className="mb-2 bg-yellow-200 text-yellow-800">
            Decisão Recomendada
          </Badge>
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{decision.decision}</p>
        </div>
        <Separator />
        <div>
          <Badge variant="outline" className="mb-2 border-yellow-400 text-yellow-800">
            Raciocínio Estratégico
          </Badge>
          <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">{decision.reasoning}</p>
        </div>
      </CardContent>
    </Card>
  )
}
