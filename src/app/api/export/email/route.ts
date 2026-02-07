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

  const { sessionId, email } = await req.json()
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

  // Build plain text email content
  let emailBody = `THINKING AGENTS - Analyse\n\n`
  emailBody += `Fragestellung: ${analysisSession.question}\n`
  emailBody += `Datum: ${new Date(analysisSession.createdAt).toLocaleDateString('de-DE')}\n\n`
  emailBody += `${'='.repeat(60)}\n\n`

  for (const result of analysisSession.agentResults) {
    const agent = AGENT_PROMPTS[result.agentType as keyof typeof AGENT_PROMPTS]
    emailBody += `${agent?.icon || ''} ${agent?.name || result.agentType}\n`
    emailBody += `${'-'.repeat(40)}\n`
    emailBody += `${result.content}\n\n`
  }

  if (analysisSession.metaSynthesis) {
    emailBody += `${'='.repeat(60)}\n`
    emailBody += `🔗 META-SYNTHESE\n`
    emailBody += `${'-'.repeat(40)}\n`
    emailBody += `${analysisSession.metaSynthesis.content}\n`
  }

  // If SMTP is configured, send via nodemailer
  // For now, return content for client-side mailto: link
  const subject = encodeURIComponent(`Thinking Agents: ${analysisSession.question.substring(0, 60)}...`)
  const body = encodeURIComponent(emailBody)
  const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`

  return NextResponse.json({
    mailtoLink,
    plainText: emailBody,
  })
}
