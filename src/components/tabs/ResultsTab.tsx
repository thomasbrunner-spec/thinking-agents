'use client'

import { useState, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'

const AGENT_META: Record<string, { name: string; icon: string; bg: string; border: string; headerBg: string }> = {
  debate: { name: 'Multi-Agenten-Debatte', icon: '🎭', bg: 'bg-purple-50', border: 'border-purple-200', headerBg: 'bg-purple-100' },
  temporal: { name: 'Zeitliche Triangulation', icon: '⏳', bg: 'bg-sky-50', border: 'border-sky-200', headerBg: 'bg-sky-100' },
  redteam: { name: 'Red Teaming', icon: '🔴', bg: 'bg-red-50', border: 'border-red-200', headerBg: 'bg-red-100' },
  paradox: { name: 'Paradox Engineering', icon: '🔀', bg: 'bg-green-50', border: 'border-green-200', headerBg: 'bg-green-100' },
  firstprinciples: { name: 'First Principles', icon: '📐', bg: 'bg-orange-50', border: 'border-orange-200', headerBg: 'bg-orange-100' },
}

interface AgentResult {
  id: string
  agentType: string
  content: string
  status: string
}

interface AnalysisSession {
  id: string
  question: string
  status: string
  createdAt: string
  agentResults: AgentResult[]
  metaSynthesis: { content: string } | null
}

interface ResultsTabProps {
  sessionId: string | null
}

export function ResultsTab({ sessionId }: ResultsTabProps) {
  const [session, setSession] = useState<AnalysisSession | null>(null)
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  const loadSession = useCallback(async () => {
    if (!sessionId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/sessions/${sessionId}`)
      if (res.ok) {
        const data = await res.json()
        setSession(data)
        // Auto-expand all agents
        const agentTypes = data.agentResults.map((r: AgentResult) => r.agentType)
        setExpandedAgents(new Set(agentTypes))
      }
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    loadSession()
  }, [loadSession])

  // Poll for updates while running
  useEffect(() => {
    if (!session || session.status !== 'running') return
    const interval = setInterval(loadSession, 3000)
    return () => clearInterval(interval)
  }, [session, loadSession])

  const toggleAgent = (agentType: string) => {
    setExpandedAgents((prev) => {
      const next = new Set(prev)
      if (next.has(agentType)) {
        next.delete(agentType)
      } else {
        next.add(agentType)
      }
      return next
    })
  }

  const handleExportPDF = async () => {
    if (!sessionId) return
    try {
      const res = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
      if (!res.ok) throw new Error('Export fehlgeschlagen')
      const data = await res.json()

      // Generate PDF client-side using jspdf
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      let y = 20

      doc.setFontSize(18)
      doc.text('Thinking Agents - Analyse', 20, y)
      y += 10

      doc.setFontSize(10)
      doc.text(`Datum: ${new Date(data.createdAt).toLocaleDateString('de-DE')}`, 20, y)
      y += 10

      doc.setFontSize(12)
      doc.text('Fragestellung:', 20, y)
      y += 7

      doc.setFontSize(10)
      const questionLines = doc.splitTextToSize(data.question, 170)
      doc.text(questionLines, 20, y)
      y += questionLines.length * 5 + 10

      for (const agent of data.agents) {
        if (y > 260) {
          doc.addPage()
          y = 20
        }
        doc.setFontSize(14)
        doc.text(`${agent.icon} ${agent.name}`, 20, y)
        y += 8

        doc.setFontSize(9)
        const contentLines = doc.splitTextToSize(agent.content.replace(/[#*`]/g, ''), 170)
        for (const line of contentLines) {
          if (y > 280) {
            doc.addPage()
            y = 20
          }
          doc.text(line, 20, y)
          y += 4.5
        }
        y += 8
      }

      if (data.metaSynthesis) {
        doc.addPage()
        y = 20
        doc.setFontSize(16)
        doc.text('Meta-Synthese', 20, y)
        y += 10

        doc.setFontSize(9)
        const metaLines = doc.splitTextToSize(data.metaSynthesis.replace(/[#*`]/g, ''), 170)
        for (const line of metaLines) {
          if (y > 280) {
            doc.addPage()
            y = 20
          }
          doc.text(line, 20, y)
          y += 4.5
        }
      }

      doc.save(`thinking-agents-${sessionId.substring(0, 8)}.pdf`)
      toast.success('PDF wurde heruntergeladen!')
    } catch (error) {
      toast.error('PDF-Export fehlgeschlagen')
    }
  }

  const handleExportEmail = async () => {
    if (!sessionId) return
    try {
      const res = await fetch('/api/export/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, email: '' }),
      })
      if (!res.ok) throw new Error('Export fehlgeschlagen')
      const { mailtoLink } = await res.json()
      window.open(mailtoLink, '_blank')
    } catch (error) {
      toast.error('Email-Export fehlgeschlagen')
    }
  }

  const handleCopyAll = async () => {
    if (!session) return
    let text = `# Thinking Agents Analyse\n\n## Fragestellung\n${session.question}\n\n`

    for (const result of session.agentResults) {
      const meta = AGENT_META[result.agentType]
      text += `---\n\n## ${meta?.icon} ${meta?.name}\n\n${result.content}\n\n`
    }

    if (session.metaSynthesis) {
      text += `---\n\n## 🔗 Meta-Synthese\n\n${session.metaSynthesis.content}\n`
    }

    await navigator.clipboard.writeText(text)
    toast.success('In Zwischenablage kopiert!')
  }

  if (!sessionId) {
    return (
      <div className="text-center py-20 text-gray-400">
        <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-lg">Wähle eine Analyse aus der Seitenleiste oder starte eine neue.</p>
      </div>
    )
  }

  if (loading && !session) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-primary-500 rounded-full typing-dot" />
          <div className="w-3 h-3 bg-primary-500 rounded-full typing-dot" />
          <div className="w-3 h-3 bg-primary-500 rounded-full typing-dot" />
        </div>
      </div>
    )
  }

  if (!session) return null

  const completedCount = session.agentResults.filter((r) => r.status === 'completed').length
  const totalCount = session.agentResults.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs text-gray-400 mb-1">Fragestellung</p>
            <p className="text-gray-800 font-medium">{session.question}</p>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(session.createdAt).toLocaleDateString('de-DE', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        {session.status === 'running' && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Fortschritt</span>
              <span>{completedCount}/{totalCount} Agenten fertig</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Export Buttons */}
      {session.status === 'completed' && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition border border-red-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            PDF Export
          </button>
          <button
            onClick={handleExportEmail}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition border border-blue-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Per E-Mail senden
          </button>
          <button
            onClick={handleCopyAll}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-gray-700 text-sm font-medium hover:bg-gray-100 transition border border-gray-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Kopieren
          </button>
        </div>
      )}

      {/* Agent Results */}
      <div className="space-y-4">
        {session.agentResults.map((result) => {
          const meta = AGENT_META[result.agentType]
          if (!meta) return null
          const isExpanded = expandedAgents.has(result.agentType)

          return (
            <div
              key={result.id}
              className={`rounded-xl border overflow-hidden transition ${
                result.status === 'running' ? 'agent-running border-indigo-300' : `${meta.border}`
              }`}
            >
              <button
                onClick={() => toggleAgent(result.agentType)}
                className={`w-full flex items-center justify-between p-4 ${meta.headerBg} hover:opacity-90 transition`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{meta.icon}</span>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800 text-sm">{meta.name}</h3>
                    {result.status === 'running' && (
                      <span className="text-xs text-gray-500">Analysiert...</span>
                    )}
                    {result.status === 'completed' && (
                      <span className="text-xs text-green-600">Fertig</span>
                    )}
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isExpanded && (
                <div className={`p-5 ${meta.bg}`}>
                  {result.status === 'running' ? (
                    <div className="flex items-center gap-3 py-8 justify-center">
                      <div className="flex space-x-1.5">
                        <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                      </div>
                      <span className="text-sm text-gray-500">Agent analysiert...</span>
                    </div>
                  ) : result.content ? (
                    <div className="markdown-content text-sm text-gray-700">
                      <ReactMarkdown>{result.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-4">Kein Ergebnis</p>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* Meta Synthesis */}
        {session.metaSynthesis && (
          <div className="rounded-xl border border-indigo-200 overflow-hidden">
            <div className="p-4 bg-indigo-100">
              <div className="flex items-center gap-3">
                <span className="text-xl">🔗</span>
                <h3 className="font-semibold text-gray-800">Meta-Synthese</h3>
              </div>
            </div>
            <div className="p-5 bg-indigo-50">
              <div className="markdown-content text-sm text-gray-700">
                <ReactMarkdown>{session.metaSynthesis.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {session.status === 'running' && !session.metaSynthesis && (
          <div className="rounded-xl border border-gray-200 p-6 text-center bg-gray-50">
            <p className="text-sm text-gray-500">
              Die Meta-Synthese wird erstellt, sobald alle Agenten fertig sind...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
