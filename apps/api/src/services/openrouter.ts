interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenRouterResponse {
  choices: {
    message: {
      content: string
    }
  }[]
}

interface CodeReviewContext {
  ticketTitle: string
  ticketDescription: string
  acceptanceCriteria: string | null
  projectName: string
  techStack: string[]
}

export async function generateCodeReview(
  diff: string,
  context: CodeReviewContext,
  apiKey: string
): Promise<string> {
  const systemPrompt = `You are a friendly, encouraging code reviewer for itay.dev, a platform that helps developers learn by contributing to real projects.

Your role is to:
1. Celebrate what the contributor did well
2. Provide specific, actionable suggestions with code examples
3. Check if the code meets the acceptance criteria
4. Help them learn without being condescending

Keep your review concise but helpful. Use markdown formatting.
Always start with something positive.`

  const userPrompt = `Please review this PR for the following ticket:

## Ticket: ${context.ticketTitle}

**Description:** ${context.ticketDescription}

**Acceptance Criteria:**
${context.acceptanceCriteria || 'No specific criteria provided'}

**Project:** ${context.projectName}
**Tech Stack:** ${context.techStack.join(', ')}

---

## PR Diff:

\`\`\`diff
${diff.slice(0, 15000)}
\`\`\`
${diff.length > 15000 ? '\n(Diff truncated for length)' : ''}

---

Provide your code review with:
1. What's done well (be specific and encouraging)
2. Suggestions for improvement (with code examples if applicable)
3. Whether the acceptance criteria appear to be met`

  const messages: OpenRouterMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://itay.dev',
      'X-Title': 'itay.dev Code Review',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3-haiku',
      messages,
      max_tokens: 2000,
      temperature: 0.3,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`)
  }

  const data = await response.json() as OpenRouterResponse
  return data.choices[0]?.message?.content || 'Unable to generate review'
}
