'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

const AGENT_CARDS = [
  {
    name: 'Multi-Agenten-Debatte',
    icon: '🎭',
    color: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    description: 'Lässt 3 Expert-Personas mit fundamental unterschiedlichen Philosophien debattieren',
  },
  {
    name: 'Zeitliche Triangulation',
    icon: '⏳',
    color: 'from-sky-500 to-sky-600',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    description: 'Analysiert das Problem aus 3 Zeitperspektiven (Vergangenheit, Gegenwart, Zukunft)',
  },
  {
    name: 'Red Teaming',
    icon: '🔴',
    color: 'from-red-500 to-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    description: 'Greift Konzepte systematisch an, um Schwachstellen aufzudecken',
  },
  {
    name: 'Paradox Engineering',
    icon: '🔀',
    color: 'from-green-500 to-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    description: 'Löst scheinbare Widersprüche auf, ohne Kompromisse zu machen',
  },
  {
    name: 'First Principles',
    icon: '📐',
    color: 'from-orange-500 to-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    description: 'Zerlegt Probleme in fundamentale Wahrheiten und baut von Null neu auf',
  },
]

interface InputTabProps {
  onAnalysisStarted: (sessionId: string) => void
}

export function InputTab({ onAnalysisStarted }: InputTabProps) {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!question.trim()) {
      toast.error('Bitte gib eine Frage oder Entscheidung ein.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/agents/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Fehler beim Starten der Analyse')
      }

      const { sessionId } = await res.json()
      toast.success('Analyse gestartet! Die 5 Agenten arbeiten jetzt...')
      setQuestion('')
      onAnalysisStarted(sessionId)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Question Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Deine Frage oder Entscheidung
        </label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={`Beschreibe dein Problem, deine Strategie oder die Entscheidung, bei der du Hilfe brauchst...\n\nBeispiele:\n• Sollen wir unser Team schnell skalieren oder auf Qualität setzen?\n• Wie können wir KI-Beratung sowohl erschwinglich als auch hochwertig anbieten?\n• Unser Onboarding dauert 3 Monate - wie können wir das radikal verkürzen?`}
          className="w-full h-48 px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition resize-none text-gray-800 placeholder:text-gray-400"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-400">{question.length} Zeichen</span>
          <button
            onClick={handleSubmit}
            disabled={loading || !question.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-700 text-white font-medium hover:from-primary-600 hover:to-primary-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/25"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Agenten arbeiten...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Agenten befragen
              </>
            )}
          </button>
        </div>
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {AGENT_CARDS.slice(0, 3).map((agent) => (
          <div
            key={agent.name}
            className={`${agent.bg} ${agent.border} border rounded-xl p-4 transition hover:shadow-md`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{agent.icon}</span>
              <h3 className="font-semibold text-gray-800 text-sm">{agent.name}</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{agent.description}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AGENT_CARDS.slice(3).map((agent) => (
          <div
            key={agent.name}
            className={`${agent.bg} ${agent.border} border rounded-xl p-4 transition hover:shadow-md`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{agent.icon}</span>
              <h3 className="font-semibold text-gray-800 text-sm">{agent.name}</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{agent.description}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-semibold text-primary-700 mb-3">Wie es funktioniert</h3>
        <ol className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span className="font-semibold text-primary-600">1.</span>
            Beschreibe deine Frage oder Entscheidung oben
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-primary-600">2.</span>
            Alle 5 Agenten analysieren deine Frage aus ihrer Perspektive
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-primary-600">3.</span>
            Eine Meta-Synthese führt alle Erkenntnisse zusammen
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-primary-600">4.</span>
            Du erhältst eine ganzheitliche Handlungsempfehlung
          </li>
        </ol>
      </div>
    </div>
  )
}
