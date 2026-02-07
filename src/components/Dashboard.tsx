'use client'

import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { InputTab } from './tabs/InputTab'
import { ResultsTab } from './tabs/ResultsTab'
import { PromptsTab } from './tabs/PromptsTab'
import { Sidebar } from './Sidebar'

type Tab = 'eingabe' | 'ergebnisse' | 'prompts'

interface SessionSummary {
  id: string
  question: string
  status: string
  createdAt: string
}

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('eingabe')
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const loadSessions = async () => {
    const res = await fetch('/api/sessions')
    if (res.ok) {
      const data = await res.json()
      setSessions(data)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [])

  const handleNewAnalysis = (sessionId: string) => {
    setCurrentSessionId(sessionId)
    setActiveTab('ergebnisse')
    loadSessions()
  }

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId)
    setActiveTab('ergebnisse')
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'eingabe', label: 'Eingabe' },
    { key: 'ergebnisse', label: 'Ergebnisse' },
    { key: 'prompts', label: 'System-Prompts' },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onRefresh={loadSessions}
      />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-0'}`}>
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Thinking Agents</h1>
                  <p className="text-xs text-gray-500">5 Perspektiven für bessere Entscheidungen</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => signOut()}
              className="text-sm text-gray-500 hover:text-gray-700 transition"
            >
              Abmelden
            </button>
          </div>

          {/* Tabs */}
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition ${
                    activeTab === tab.key
                      ? 'text-primary-700 bg-primary-50 border-b-2 border-primary-500'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Tab Content */}
        <main className="max-w-5xl mx-auto px-6 py-8">
          {activeTab === 'eingabe' && (
            <InputTab onAnalysisStarted={handleNewAnalysis} />
          )}
          {activeTab === 'ergebnisse' && (
            <ResultsTab sessionId={currentSessionId} />
          )}
          {activeTab === 'prompts' && <PromptsTab />}
        </main>
      </div>
    </div>
  )
}
