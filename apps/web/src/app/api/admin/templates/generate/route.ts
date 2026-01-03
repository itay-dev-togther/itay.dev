import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

interface TicketTemplate {
  title: string
  description: string
  acceptance_criteria: string
  difficulty: string
}

interface Template {
  id: string
  name: string
  description: string | null
  difficulty: string
  tech_stack: string[]
  default_tickets: TicketTemplate[]
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .schema('itay')
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get request body
    const body = await request.json()
    const { templateId, projectName, customGoals, variations } = body

    if (!templateId || !projectName) {
      return NextResponse.json({ error: 'Template ID and project name are required' }, { status: 400 })
    }

    // Get template
    const { data: template, error: templateError } = await supabase
      .schema('itay')
      .from('project_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (templateError || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    const typedTemplate = template as Template

    // Check if OpenRouter API key is available
    if (!OPENROUTER_API_KEY) {
      // Fallback: return template content with minimal customization
      console.warn('OpenRouter API key not configured, using fallback generation')
      return NextResponse.json({
        content: {
          name: projectName,
          description: typedTemplate.description || `A ${typedTemplate.difficulty} level project using ${typedTemplate.tech_stack.join(', ')}.`,
          tickets: typedTemplate.default_tickets || [],
        }
      })
    }

    // Build prompt for AI generation
    const prompt = buildGenerationPrompt(typedTemplate, projectName, customGoals, variations)

    // Call OpenRouter
    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://itay.dev',
        'X-Title': 'itay.dev Project Generator',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: [
          {
            role: 'system',
            content: `You are a technical project planner for a developer learning platform called itay.dev.
Your job is to create detailed, educational project specifications that help developers learn by building real features.
Always respond with valid JSON in the exact format specified.
Be specific, practical, and educational in your descriptions.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      console.error('OpenRouter error:', errorText)
      // Fallback to template content
      return NextResponse.json({
        content: {
          name: projectName,
          description: typedTemplate.description || `A ${typedTemplate.difficulty} level project.`,
          tickets: typedTemplate.default_tickets || [],
        }
      })
    }

    const aiResult = await aiResponse.json()
    const aiContent = aiResult.choices?.[0]?.message?.content

    if (!aiContent) {
      throw new Error('No content from AI')
    }

    // Parse AI response
    const generatedContent = parseAIResponse(aiContent, projectName, typedTemplate)

    return NextResponse.json({ content: generatedContent })

  } catch (error) {
    console.error('Generate project error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred during generation' },
      { status: 500 }
    )
  }
}

function buildGenerationPrompt(
  template: Template,
  projectName: string,
  customGoals: string,
  variations: string
): string {
  const ticketExamples = template.default_tickets?.slice(0, 3).map(t =>
    `- "${t.title}" (${t.difficulty})`
  ).join('\n') || 'No example tickets'

  return `Generate a project specification for a developer learning project.

PROJECT NAME: ${projectName}
TEMPLATE: ${template.name}
DIFFICULTY LEVEL: ${template.difficulty}
TECH STACK: ${template.tech_stack.join(', ')}

TEMPLATE DESCRIPTION:
${template.description || 'No description provided'}

EXAMPLE TICKETS FROM TEMPLATE:
${ticketExamples}

${customGoals ? `CUSTOM GOALS:\n${customGoals}\n` : ''}
${variations ? `VARIATIONS:\n${variations}\n` : ''}

Please generate:
1. A compelling project description (2-3 paragraphs) that explains what the project is, what developers will learn, and why it's valuable
2. 5-8 tickets that break down the project into achievable tasks

Respond with ONLY valid JSON in this exact format:
{
  "name": "${projectName}",
  "description": "Full project description here...",
  "tickets": [
    {
      "title": "Ticket title",
      "description": "What this ticket involves",
      "acceptance_criteria": "- [ ] Criteria 1\\n- [ ] Criteria 2\\n- [ ] Criteria 3",
      "difficulty": "beginner|intermediate|advanced"
    }
  ]
}

Make tickets progressively build on each other. Start with setup/foundation, then core features, then polish.
Acceptance criteria should be specific and testable.
Match the overall difficulty level (${template.difficulty}) but allow individual tickets to vary.`
}

function parseAIResponse(
  aiContent: string,
  projectName: string,
  template: Template
): { name: string; description: string; tickets: TicketTemplate[] } {
  try {
    // Try to extract JSON from the response
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const parsed = JSON.parse(jsonMatch[0])

    return {
      name: parsed.name || projectName,
      description: parsed.description || template.description || '',
      tickets: Array.isArray(parsed.tickets)
        ? parsed.tickets.map((t: TicketTemplate) => ({
            title: t.title || 'Untitled',
            description: t.description || '',
            acceptance_criteria: t.acceptance_criteria || '',
            difficulty: t.difficulty || 'beginner',
          }))
        : template.default_tickets || [],
    }
  } catch (parseError) {
    console.error('Failed to parse AI response:', parseError)
    // Return fallback
    return {
      name: projectName,
      description: template.description || '',
      tickets: template.default_tickets || [],
    }
  }
}
