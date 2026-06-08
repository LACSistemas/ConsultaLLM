import { AlertTriangle, CheckCircle2, Crown, SearchCheck, Split, Target } from 'lucide-react'
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

const providerLabels: Record<string, string> = {
  deepseek: 'DeepSeek',
  gemini: 'Gemini',
  anthropic: 'Anthropic',
}

function AuditList({ items, emptyText }: { items: string[]; emptyText: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-500">{emptyText}</p>
  }

  return (
    <ul className="space-y-1.5 text-sm text-slate-600">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex gap-2">
          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function CEOCard({ decision }: CEOCardProps) {
  const confidence = Math.round(Math.min(1, Math.max(0, decision.confidence)) * 100)

  return (
    <Card className="border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-xl">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl text-yellow-800">
              <Crown className="h-6 w-6" />
              Decisão Auditável do CEO
            </CardTitle>
            <CardDescription className="mt-1 text-yellow-700">
              Síntese com avaliação explícita das perspectivas, riscos e lacunas
            </CardDescription>
          </div>
          <Badge className="bg-yellow-200 text-yellow-900 hover:bg-yellow-200">
            Confiança: {confidence}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <Badge variant="secondary" className="mb-2 bg-yellow-200 text-yellow-800">
            Decisão Recomendada
          </Badge>
          <p className="leading-relaxed text-slate-700 whitespace-pre-wrap">{decision.decision}</p>
        </div>
        <Separator />
        <div>
          <Badge variant="outline" className="mb-2 border-yellow-400 text-yellow-800">
            Raciocínio Estratégico
          </Badge>
          <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">{decision.reasoning}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-emerald-200 bg-white/70 p-4">
            <h4 className="mb-2 flex items-center gap-2 font-semibold text-emerald-800">
              <CheckCircle2 className="h-4 w-4" /> Consensos
            </h4>
            <AuditList items={decision.consensus} emptyText="Nenhum consenso explícito identificado." />
          </div>
          <div className="rounded-lg border border-purple-200 bg-white/70 p-4">
            <h4 className="mb-2 flex items-center gap-2 font-semibold text-purple-800">
              <Split className="h-4 w-4" /> Divergências
            </h4>
            <AuditList items={decision.disagreements} emptyText="Nenhuma divergência relevante identificada." />
          </div>
        </div>

        {decision.counselor_assessments.length > 0 && (
          <div>
            <h4 className="mb-3 flex items-center gap-2 font-semibold text-slate-800">
              <SearchCheck className="h-4 w-4" /> Auditoria dos conselheiros
            </h4>
            <div className="grid gap-3 lg:grid-cols-3">
              {decision.counselor_assessments.map((assessment) => (
                <div key={assessment.provider} className="rounded-lg border border-slate-200 bg-white/80 p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-800">
                      {providerLabels[assessment.provider] ?? assessment.provider}
                    </span>
                    <Badge variant="outline">{Math.round(assessment.confidence * 100)}%</Badge>
                  </div>
                  <p className="mb-3 text-xs leading-relaxed text-slate-600">{assessment.contribution}</p>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">Forças</p>
                  <AuditList items={assessment.strengths} emptyText="Não informadas." />
                  <p className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wide text-rose-700">Limitações</p>
                  <AuditList items={assessment.weaknesses} emptyText="Não informadas." />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-rose-200 bg-white/70 p-4">
            <h4 className="mb-2 flex items-center gap-2 font-semibold text-rose-800">
              <AlertTriangle className="h-4 w-4" /> Riscos e trade-offs
            </h4>
            <AuditList items={decision.risks} emptyText="Nenhum risco adicional destacado." />
          </div>
          <div className="rounded-lg border border-blue-200 bg-white/70 p-4">
            <h4 className="mb-2 flex items-center gap-2 font-semibold text-blue-800">
              <SearchCheck className="h-4 w-4" /> Verificações necessárias
            </h4>
            <AuditList items={decision.verification_needed} emptyText="Nenhuma verificação adicional indicada." />
          </div>
        </div>

        <div className="rounded-lg border border-amber-300 bg-white/70 p-4">
          <h4 className="mb-2 flex items-center gap-2 font-semibold text-amber-900">
            <Target className="h-4 w-4" /> Próximos passos
          </h4>
          <AuditList items={decision.next_steps} emptyText="Nenhum próximo passo sugerido." />
        </div>
      </CardContent>
    </Card>
  )
}
