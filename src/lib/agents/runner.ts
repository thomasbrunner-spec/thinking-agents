import Anthropic from '@anthropic-ai/sdk'
import { AGENT_PROMPTS, AgentType, AGENT_TYPES } from './prompts'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function runAgent(agentType: AgentType, question: string): Promise<string> {
  const agent = AGENT_PROMPTS[agentType]

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: agent.systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Analysiere folgende Frage/Entscheidung aus deiner spezifischen Perspektive:\n\n${question}`,
      },
    ],
  })

  const textBlock = message.content.find((block) => block.type === 'text')
  return textBlock ? textBlock.text : 'Keine Antwort erhalten.'
}

export async function runMetaSynthesis(
  question: string,
  agentResults: Record<AgentType, string>
): Promise<string> {
  const meta = AGENT_PROMPTS.meta

  const resultsText = AGENT_TYPES.map((type) => {
    const agent = AGENT_PROMPTS[type]
    return `## ${agent.icon} ${agent.name}\n\n${agentResults[type]}`
  }).join('\n\n---\n\n')

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: meta.systemPrompt,
    messages: [
      {
        role: 'user',
        content: `# Ursprüngliche Fragestellung:\n${question}\n\n# Agenten-Analysen:\n\n${resultsText}\n\nErstelle nun die Meta-Synthese aus allen 5 Perspektiven.`,
      },
    ],
  })

  const textBlock = message.content.find((block) => block.type === 'text')
  return textBlock ? textBlock.text : 'Keine Meta-Synthese erhalten.'
}

export async function runAllAgents(
  question: string,
  onAgentComplete?: (agentType: AgentType, result: string) => Promise<void>
): Promise<{ agentResults: Record<string, string>; metaSynthesis: string }> {
  // Run all 5 agents in parallel
  const results = await Promise.all(
    AGENT_TYPES.map(async (type) => {
      const result = await runAgent(type, question)
      if (onAgentComplete) {
        await onAgentComplete(type, result)
      }
      return { type, result }
    })
  )

  const agentResults: Record<string, string> = {}
  for (const { type, result } of results) {
    agentResults[type] = result
  }

  // Run meta synthesis with all results
  const metaSynthesis = await runMetaSynthesis(question, agentResults as Record<AgentType, string>)

  return { agentResults, metaSynthesis }
}
