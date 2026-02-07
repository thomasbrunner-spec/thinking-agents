'use client'

import { useState } from 'react'
import { AGENT_PROMPTS, AGENT_TYPES } from '@/lib/agents/prompts'

const allAgents = [...AGENT_TYPES, 'meta' as const]

export function PromptsTab() {
  const [selectedAgent, setSelectedAgent] = useState<string>('debate')

  const agent = AGENT_PROMPTS[selectedAgent as keyof typeof AGENT_PROMPTS]

  const agentColors: Record<string, { bg: string; border: string; text: string }> = {
    debate: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
    temporal: { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700' },
    redteam: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
    paradox: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
    firstprinciples: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
    meta: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' },
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">System-Prompts der Agenten</h2>
        <p className="text-sm text-gray-500">
          Hier kannst du die System-Prompts einsehen, die die einzelnen Agenten steuern.
          Jeder Agent hat einen spezifischen Prompt, der seine Perspektive und Methodik definiert.
        </p>
      </div>

      {/* Agent Selector */}
      <div className="flex gap-2 flex-wrap">
        {allAgents.map((type) => {
          const a = AGENT_PROMPTS[type as keyof typeof AGENT_PROMPTS]
          const colors = agentColors[type]
          const isSelected = selectedAgent === type

          return (
            <button
              key={type}
              onClick={() => setSelectedAgent(type)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition border ${
                isSelected
                  ? `${colors.bg} ${colors.border} ${colors.text}`
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span>{a.icon}</span>
              <span>{a.name}</span>
            </button>
          )
        })}
      </div>

      {/* Prompt Display */}
      {agent && (
        <div className={`rounded-xl border ${agentColors[selectedAgent]?.border || 'border-gray-200'} overflow-hidden`}>
          <div className={`p-4 ${agentColors[selectedAgent]?.bg || 'bg-gray-50'}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{agent.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-800">{agent.name}</h3>
                <p className="text-sm text-gray-500">{agent.description}</p>
              </div>
            </div>
          </div>
          <div className="p-5 bg-white">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed bg-gray-50 rounded-lg p-4 border border-gray-100 max-h-[600px] overflow-y-auto">
              {agent.systemPrompt}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
