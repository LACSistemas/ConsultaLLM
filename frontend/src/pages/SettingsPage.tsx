import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getSettings } from '@/api/attachments'
import type { SettingsResponse } from '@/types'

const PROVIDER_LABELS: Record<string, string> = {
  openai: 'OpenAI (CEO)',
  deepseek: 'DeepSeek (Agente A)',
  gemini: 'Google Gemini (Agente B)',
  anthropic: 'Anthropic Claude (Agente C)',
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const { data } = useQuery<SettingsResponse>({
    queryKey: ['settings'],
    queryFn: getSettings,
  })

  const providers = data?.providers ?? {}

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Configurações</CardTitle>
            <CardDescription>
              Status dos provedores de IA configurados via arquivo <code>.env</code>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(PROVIDER_LABELS).map(([key, label]) => {
              const configured = (providers as Record<string, boolean>)[key] ?? false
              return (
                <div key={key} className="flex items-center justify-between p-3 rounded-lg border">
                  <span className="font-medium text-slate-700">{label}</span>
                  <div className="flex items-center gap-2">
                    {configured ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-green-600">Configurado</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-400" />
                        <span className="text-sm text-red-500">Não configurado</span>
                      </>
                    )}
                  </div>
                </div>
              )
            })}

            <div className="mt-6 p-4 bg-slate-50 rounded-lg text-sm text-slate-600">
              <p className="font-semibold mb-2">Como configurar:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Copie o arquivo <code>.env.example</code> para <code>.env</code> na pasta <code>backend/</code></li>
                <li>Preencha as chaves de API de cada provedor</li>
                <li>Reinicie o servidor backend</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
