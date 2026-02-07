'use client'

interface SessionSummary {
  id: string
  question: string
  status: string
  createdAt: string
}

interface SidebarProps {
  sessions: SessionSummary[]
  currentSessionId: string | null
  onSelectSession: (id: string) => void
  isOpen: boolean
  onToggle: () => void
  onRefresh: () => void
}

export function Sidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  isOpen,
  onToggle,
  onRefresh,
}: SidebarProps) {
  if (!isOpen) return null

  const statusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅'
      case 'running': return '⏳'
      case 'error': return '❌'
      default: return '⏸️'
    }
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-gray-100 z-20 flex flex-col">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-700 text-sm">Analyse-Verlauf</h2>
        <div className="flex gap-1">
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-600"
            title="Aktualisieren"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {sessions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center mt-8 px-4">
            Noch keine Analysen. Starte deine erste Analyse im Eingabe-Tab.
          </p>
        ) : (
          <div className="space-y-1">
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelectSession(s.id)}
                className={`w-full text-left p-3 rounded-xl transition text-sm ${
                  currentSessionId === s.id
                    ? 'bg-primary-50 border border-primary-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xs mt-0.5">{statusIcon(s.status)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {s.question.substring(0, 60)}{s.question.length > 60 ? '...' : ''}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(s.createdAt).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
