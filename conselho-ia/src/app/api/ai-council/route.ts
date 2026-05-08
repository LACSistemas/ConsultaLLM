import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Brain, Sparkles, Zap } from 'lucide-react'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Conselheiro 1: OpenAI
    const openaiResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Você é um conselheiro experiente que fornece respostas diretas e práticas. Seja conciso e objetivo.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    })

    // Conselheiro 2: Gemini
    const geminiModel = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' })
    const geminiResponse = await geminiModel.generateContent(
      'Você é um conselheiro inovador que pensa fora da caixa. Forneça uma perspectiva criativa e única. Seja conciso. Pergunta: ' + prompt
    )

    // Conselheiro 3: "Anthropic" (usando Gemini)
    const mockAnthropicResponse = await geminiModel.generateContent(
      'Você é um conselheiro analítico da Anthropic que foca em aspectos éticos e de segurança. Forneça uma resposta equilibrada considerando múltiplas perspectivas. Seja conciso. Pergunta: ' + prompt
    )

    const counselors = [
      {
        name: 'Conselheiro OpenAI',
        response: openaiResponse.choices[0]?.message?.content || 'Erro ao gerar resposta',
        icon: 'brain',
        color: 'border-blue-500'
      },
      {
        name: 'Conselheiro Gemini',
        response: geminiResponse.response.text() || 'Erro ao gerar resposta',
        icon: 'sparkles',
        color: 'border-green-500'
      },
      {
        name: 'Conselheiro Anthropic',
        response: mockAnthropicResponse.response.text() || 'Erro ao gerar resposta',
        icon: 'zap',
        color: 'border-purple-500'
      }
    ]

    // CEO Decision (OpenAI)
    const ceoPrompt = `
Como CEO, analise as seguintes respostas de conselheiros para a pergunta: "${prompt}"

Conselheiro OpenAI: ${counselors[0].response}
Conselheiro Gemini: ${counselors[1].response}
Conselheiro Anthropic: ${counselors[2].response}

Forneça uma decisão final que considere o melhor de cada resposta. Seja conciso e direto.
Formato:
DECISÃO: [sua decisão final]
RACIOCÍNIO: [breve explicação de por que escolheu essa decisão]
`

    const ceoResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Você é um CEO experiente que toma decisões baseadas em análise de múltiplas perspectivas.'
        },
        {
          role: 'user',
          content: ceoPrompt
        }
      ],
      max_tokens: 200,
      temperature: 0.5,
    })

    const ceoText = ceoResponse.choices[0]?.message?.content || ''
    const decisionMatch = ceoText.match(/DECISÃO:\s*(.+?)(?=RACIOCÍNIO:|$)/s)
    const reasoningMatch = ceoText.match(/RACIOCÍNIO:\s*(.+)/s)

    const ceoDecision = {
      decision: decisionMatch?.[1]?.trim() || ceoText,
      reasoning: reasoningMatch?.[1]?.trim() || 'Análise baseada nas múltiplas perspectivas fornecidas.'
    }

    return NextResponse.json({
      counselors,
      ceoDecision
    })

  } catch (error) {
    console.error('Error in AI Council:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}