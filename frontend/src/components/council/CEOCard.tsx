import {
  AlertTriangle,
  CheckCircle2,
  CircleHelp,
  Compass,
  Eye,
  GitBranch,
  Lightbulb,
  MessageCircleQuestion,
  Scale,
  SearchCheck,
  Split,
  Target,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { CEODecision, ConfidenceLevel } from '@/types'

interface CEOCardProps {
  decision: CEODecision
}

const providerLabels: Record<string, string> = {
  deepseek: 'DeepSeek',
  gemini: 'Gemini',
  anthropic: 'Anthropic',
}

const roleLabels: Record<string, string> = {
  proponent: 'Proponente pragmático',
  skeptic: 'Cético construtivo',
  alternative: 'Explorador de alternativas',
}

const confidenceLabels: Record<ConfidenceLevel, string> = {
  low: 'Baixa',
  medium: 'Moderada',
  high: 'Alta',
}

function AuditList({ items, emptyText }: { items: string[]; emptyText: string }) {
  if (items.length === 0) return <p className="text-sm text-slate-500">{emptyText}</p>

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

function KnowledgeCard({
  title,
  items,
  emptyText,
  icon,
  className,
}: {
  title: string
  items: string[]
  emptyText: string
  icon: React.ReactNode
  className: string
}) {
  return (
    <div className={`rounded-lg border bg-white/75 p-4 ${className}`}>
      <h4 className="mb-2 flex items-center gap-2 font-semibold">{icon}{title}</h4>
      <AuditList items={items} emptyText={emptyText} />
    </div>
  )
}

export default function CEOCard({ decision }: CEOCardProps) {
  const needsClarification = decision.status === 'needs_clarification'
  const confidence = decision.confidence

  return (
    <Card className="border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 via-white to-violet-50 shadow-xl">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl text-indigo-900">
              <Scale className="h-6 w-6" />
              Síntese Plural do Conselho
            </CardTitle>
            <CardDescription className="mt-1 text-indigo-700">
              Conclusão provisória que preserva desacordos, premissas e limites das evidências
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className={needsClarification ? 'bg-sky-200 text-sky-900' : 'bg-indigo-200 text-indigo-900'}>
              {needsClarification ? 'Precisa de esclarecimento' : 'Recomendação provisória'}
            </Badge>
            <Badge variant="outline" className="border-indigo-300 bg-white/70 text-indigo-900">
              Confiança qualitativa: {confidenceLabels[confidence.level]}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <Badge variant="secondary" className="mb-2 bg-indigo-100 text-indigo-800">
            {needsClarification ? 'Orientação provisória' : 'Síntese recomendada'}
          </Badge>
          <p className="whitespace-pre-wrap leading-relaxed text-slate-700">{decision.decision}</p>
        </div>

        {decision.clarifying_questions.length > 0 && (
          <div className="rounded-xl border-2 border-sky-300 bg-sky-50 p-4">
            <h4 className="mb-2 flex items-center gap-2 font-semibold text-sky-900">
              <MessageCircleQuestion className="h-5 w-5" /> Perguntas antes de concluir
            </h4>
            <p className="mb-3 text-sm text-sky-800">
              Responda a estas perguntas em uma nova mensagem para o conselho reavaliar a orientação.
            </p>
            <AuditList items={decision.clarifying_questions} emptyText="Nenhuma pergunta adicional." />
          </div>
        )}

        <Separator />
        <div>
          <Badge variant="outline" className="mb-2 border-indigo-300 text-indigo-800">Raciocínio da síntese</Badge>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{decision.reasoning}</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white/75 p-4">
          <h4 className="mb-2 flex items-center gap-2 font-semibold text-slate-800">
            <Scale className="h-4 w-4" /> Por que a confiança é {confidenceLabels[confidence.level].toLowerCase()}
          </h4>
          <p className="mb-3 text-sm leading-relaxed text-slate-600">{confidence.rationale}</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">Fatores de apoio</p>
              <AuditList items={confidence.supporting_factors} emptyText="Nenhum fator adicional registrado." />
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-700">Fatores limitantes</p>
              <AuditList items={confidence.limiting_factors} emptyText="Nenhum limite adicional registrado." />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <KnowledgeCard title="Fatos conhecidos" items={decision.known_facts} emptyText="Nenhum fato foi isolado." icon={<CheckCircle2 className="h-4 w-4" />} className="border-emerald-200 text-emerald-800" />
          <KnowledgeCard title="Premissas" items={decision.assumptions} emptyText="Nenhuma premissa explícita." icon={<GitBranch className="h-4 w-4" />} className="border-amber-200 text-amber-800" />
          <KnowledgeCard title="Inferências" items={decision.inferences} emptyText="Nenhuma inferência destacada." icon={<Lightbulb className="h-4 w-4" />} className="border-blue-200 text-blue-800" />
          <KnowledgeCard title="Juízos de valor" items={decision.value_judgments} emptyText="Nenhum valor determinante destacado." icon={<Compass className="h-4 w-4" />} className="border-violet-200 text-violet-800" />
          <KnowledgeCard title="Desconhecidos" items={decision.unknowns} emptyText="Nenhum desconhecido destacado." icon={<CircleHelp className="h-4 w-4" />} className="border-slate-300 text-slate-800" />
          <KnowledgeCard title="Visões minoritárias" items={decision.minority_views} emptyText="Nenhum contraponto minoritário preservado." icon={<Eye className="h-4 w-4" />} className="border-fuchsia-200 text-fuchsia-800" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <KnowledgeCard title="Consensos" items={decision.consensus} emptyText="Nenhum consenso explícito identificado." icon={<CheckCircle2 className="h-4 w-4" />} className="border-emerald-200 text-emerald-800" />
          <KnowledgeCard title="Divergências" items={decision.disagreements} emptyText="Nenhuma divergência relevante identificada." icon={<Split className="h-4 w-4" />} className="border-purple-200 text-purple-800" />
        </div>

        {decision.counselor_assessments.length > 0 && (
          <details className="rounded-lg border border-slate-200 bg-white/75 p-4">
            <summary className="cursor-pointer font-semibold text-slate-800">Ver auditoria das perspectivas</summary>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {decision.counselor_assessments.map((assessment, index) => (
                <div key={`${assessment.provider}-${index}`} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-slate-800">{roleLabels[assessment.role] ?? assessment.role}</span>
                    <Badge variant="outline">Confiabilidade: {confidenceLabels[assessment.reliability]}</Badge>
                  </div>
                  <p className="mb-3 text-xs text-slate-500">Executado por {providerLabels[assessment.provider] ?? assessment.provider}</p>
                  <p className="mb-3 text-xs leading-relaxed text-slate-600">{assessment.contribution}</p>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">Forças</p>
                  <AuditList items={assessment.strengths} emptyText="Não informadas." />
                  <p className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wide text-rose-700">Limitações</p>
                  <AuditList items={assessment.weaknesses} emptyText="Não informadas." />
                </div>
              ))}
            </div>
          </details>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <KnowledgeCard title="Riscos e trade-offs" items={decision.risks} emptyText="Nenhum risco adicional destacado." icon={<AlertTriangle className="h-4 w-4" />} className="border-rose-200 text-rose-800" />
          <KnowledgeCard title="Verificações necessárias" items={decision.verification_needed} emptyText="Nenhuma verificação adicional indicada." icon={<SearchCheck className="h-4 w-4" />} className="border-blue-200 text-blue-800" />
        </div>

        <div className="rounded-lg border border-indigo-200 bg-white/75 p-4 text-indigo-900">
          <h4 className="mb-2 flex items-center gap-2 font-semibold"><Target className="h-4 w-4" /> Próximos passos</h4>
          <AuditList items={decision.next_steps} emptyText="Nenhum próximo passo sugerido." />
        </div>
      </CardContent>
    </Card>
  )
}
