'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Brain, Crown, Sparkles, Zap, History, MessageSquare, Clock, Lightbulb } from 'lucide-react'

interface CounselorResponse {
  name: string
  response: string
  icon: React.ReactNode
  color: string
  bgColor: string
  textColor: string
}

interface CEODecision {
  decision: string
  reasoning: string
}

interface ConversationHistory {
  id: string
  prompt: string
  counselors: CounselorResponse[]
  ceoDecision: CEODecision
  timestamp: Date
}

export default function AICouncilPage() {
  const [prompt, setPrompt] = useState('')
  const [counselorResponses, setCounselorResponses] = useState<CounselorResponse[]>([])
  const [ceoDecision, setCeoDecision] = useState<CEODecision | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<ConversationHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('ai-council-history')
    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory).map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }))
      setHistory(parsedHistory)
    }
  }, [])

  // Save to localStorage whenever history changes
  useEffect(() => {
    localStorage.setItem('ai-council-history', JSON.stringify(history))
  }, [history])

  const handleSubmit = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    setCounselorResponses([])
    setCeoDecision(null)

    try {
      const response = await fetch('/api/ai-council', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()
      
      const formattedCounselors = data.counselors?.map((counselor: any, index: number) => ({
        ...counselor,
        icon: index === 0 ? <Brain className="h-5 w-5" /> : 
              index === 1 ? <Sparkles className="h-5 w-5" /> : 
              <Zap className="h-5 w-5" />,
        bgColor: index === 0 ? 'bg-blue-50' : 
                 index === 1 ? 'bg-green-50' : 
                 'bg-purple-50',
        textColor: index === 0 ? 'text-blue-700' : 
                   index === 1 ? 'text-green-700' : 
                   'text-purple-700'
      })) || []

      setCounselorResponses(formattedCounselors)
      setCeoDecision(data.ceoDecision || null)
      
      // Add to history
      if (formattedCounselors.length > 0 && data.ceoDecision) {
        const newEntry: ConversationHistory = {
          id: Date.now().toString(),
          prompt: prompt,
          counselors: formattedCounselors,
          ceoDecision: data.ceoDecision,
          timestamp: new Date()
        }
        setHistory(prev => [newEntry, ...prev.slice(0, 9)]) // Keep last 10 conversations
      }
      
      setPrompt('') // Clear input after submission
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadFromHistory = (historyItem: ConversationHistory) => {
    setCounselorResponses(historyItem.counselors)
    setCeoDecision(historyItem.ceoDecision)
    setPrompt(historyItem.prompt)
    setShowHistory(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto max-w-7xl p-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Conselho de IA
            </h1>
          </div>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Consulte múltiplas inteligências artificiais e obtenha a decisão mais informada
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            
            {/* Input Section */}
            <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Lightbulb className="h-6 w-6 text-yellow-500" />
                  Faça sua pergunta ao Conselho
                </CardTitle>
                <CardDescription>
                  Digite sua pergunta ou dilema e receba perspectivas de diferentes IAs especializadas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Ex: Qual é a melhor estratégia para lançar um produto inovador no mercado atual?"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] text-lg resize-none"
                />
                <Button 
                  onClick={handleSubmit} 
                  disabled={isLoading || !prompt.trim()}
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Consultando o Conselho...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Consultar Conselho de IA
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Loading State */}
            {isLoading && (
              <div className="grid gap-6 md:grid-cols-3 mb-8">
                {[
                  { name: 'OpenAI', color: 'border-blue-200', bg: 'bg-blue-50' },
                  { name: 'Gemini', color: 'border-green-200', bg: 'bg-green-50' },
                  { name: 'Anthropic', color: 'border-purple-200', bg: 'bg-purple-50' }
                ].map((counselor, i) => (
                  <Card key={i} className={`animate-pulse border-l-4 ${counselor.color} ${counselor.bg}`}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 bg-gray-300 rounded"></div>
                        <div className="h-6 bg-gray-300 rounded w-24"></div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-300 rounded"></div>
                        <div className="h-4 bg-gray-300 rounded"></div>
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Counselor Responses */}
            {counselorResponses && counselorResponses.length > 0 && (
              <>
                <h2 className="text-3xl font-bold mb-6 text-center text-slate-800">
                  Perspectivas dos Conselheiros
                </h2>
                <div className="grid gap-6 md:grid-cols-3 mb-8">
                  {counselorResponses.map((counselor, index) => (
                    <Card key={index} className={`border-l-4 ${counselor.color} ${counselor.bgColor} shadow-lg hover:shadow-xl transition-shadow`}>
                      <CardHeader>
                        <CardTitle className={`flex items-center gap-2 ${counselor.textColor}`}>
                          {counselor.icon}
                          {counselor.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-700 leading-relaxed">{counselor.response}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {/* CEO Decision */}
            {ceoDecision && (
              <Card className="border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-800 text-2xl">
                    <Crown className="h-8 w-8" />
                    Decisão Final do CEO
                  </CardTitle>
                  <CardDescription className="text-yellow-700">
                    Análise consolidada baseada em todas as perspectivas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Badge variant="secondary" className="mb-3 bg-yellow-200 text-yellow-800">
                      Decisão Recomendada
                    </Badge>
                    <p className="text-slate-700 text-lg leading-relaxed">{ceoDecision.decision}</p>
                  </div>
                  <Separator />
                  <div>
                    <Badge variant="outline" className="mb-3 border-yellow-400 text-yellow-800">
                      Raciocínio Estratégico
                    </Badge>
                    <p className="text-slate-600 leading-relaxed">{ceoDecision.reasoning}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - History */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-slate-600" />
                  Histórico
                </CardTitle>
                <CardDescription>
                  Suas consultas anteriores
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {history.length === 0 ? (
                  <p className="text-slate-500 text-sm italic text-center py-4">
                    Nenhuma consulta ainda
                  </p>
                ) : (
                  history.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => loadFromHistory(item)}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <p className="text-sm font-medium text-slate-700 line-clamp-2 mb-2">
                        {item.prompt}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        {item.timestamp.toLocaleDateString('pt-BR')} às {item.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
                {history.length > 5 && (
                  <Button
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowHistory(!showHistory)}
                    className="w-full"
                  >
                    Ver mais ({history.length - 5})
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
