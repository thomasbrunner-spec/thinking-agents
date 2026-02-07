import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { runAllAgents } from '@/lib/agents/runner'
import { AgentType, AGENT_TYPES } from '@/lib/agents/prompts'

export const maxDuration = 300 // 5 min timeout for long AI runs

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  const { question } = await req.json()
  if (!question || question.trim().length === 0) {
    return NextResponse.json({ error: 'Bitte eine Frage eingeben' }, { status: 400 })
  }

  const userId = (session.user as any).id

  // Create analysis session
  const analysisSession = await prisma.analysisSession.create({
    data: {
      userId,
      question,
      status: 'running',
      agentResults: {
        create: AGENT_TYPES.map((type) => ({
          agentType: type,
          content: '',
          status: 'running',
        })),
      },
    },
    include: { agentResults: true },
  })

  // Run agents (don't await - return session ID immediately for polling)
  runAllAgents(
    question,
    async (agentType: AgentType, result: string) => {
      await prisma.agentResult.updateMany({
        where: {
          sessionId: analysisSession.id,
          agentType,
        },
        data: {
          content: result,
          status: 'completed',
        },
      })
    }
  )
    .then(async ({ metaSynthesis }) => {
      await prisma.metaSynthesis.create({
        data: {
          sessionId: analysisSession.id,
          content: metaSynthesis,
        },
      })
      await prisma.analysisSession.update({
        where: { id: analysisSession.id },
        data: { status: 'completed' },
      })
    })
    .catch(async (error) => {
      console.error('Agent run error:', error)
      await prisma.analysisSession.update({
        where: { id: analysisSession.id },
        data: { status: 'error' },
      })
    })

  return NextResponse.json({ sessionId: analysisSession.id })
}
