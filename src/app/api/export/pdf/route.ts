import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AGENT_PROMPTS } from '@/lib/agents/prompts'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  const { sessionId } = await req.json()
  const userId = (session.user as any).id

  const analysisSession = await prisma.analysisSession.findFirst({
    where: { id: sessionId, userId },
    include: {
      agentResults: true,
      metaSynthesis: true,
    },
  })

  if (!analysisSession) {
    return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 })
  }

  // Build HTML for PDF generation (client-side will convert)
  const agentSections = analysisSession.agentResults.map((r) => {
    const agent = AGENT_PROMPTS[r.agentType as keyof typeof AGENT_PROMPTS]
    return {
      name: agent?.name || r.agentType,
      icon: agent?.icon || '📋',
      content: r.content,
    }
  })

  return NextResponse.json({
    question: analysisSession.question,
    createdAt: analysisSession.createdAt,
    agents: agentSections,
    metaSynthesis: analysisSession.metaSynthesis?.content || '',
  })
}
