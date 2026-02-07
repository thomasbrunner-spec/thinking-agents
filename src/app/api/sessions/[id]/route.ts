import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  const userId = (session.user as any).id

  const analysisSession = await prisma.analysisSession.findFirst({
    where: {
      id: params.id,
      userId,
    },
    include: {
      agentResults: {
        orderBy: { createdAt: 'asc' },
      },
      metaSynthesis: true,
    },
  })

  if (!analysisSession) {
    return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 })
  }

  return NextResponse.json(analysisSession)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  const userId = (session.user as any).id

  await prisma.analysisSession.deleteMany({
    where: {
      id: params.id,
      userId,
    },
  })

  return NextResponse.json({ success: true })
}
