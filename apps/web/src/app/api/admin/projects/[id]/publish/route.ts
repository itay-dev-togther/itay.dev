import { createClient } from '@/lib/supabase/server'
import { createRepo, createWebhook, GITHUB_OWNER } from '@/lib/github/client'
import { NextResponse } from 'next/server'

const WEBHOOK_URL = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/github`
  : 'https://itay-dev.vercel.app/api/webhooks/github'
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
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

    // Get project
    const { data: project, error: projectError } = await supabase
      .schema('itay')
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.github_repo_url) {
      // Already has a repo, just update status
      const { data: updatedProject, error: updateError } = await supabase
        .schema('itay')
        .from('projects')
        .update({ status: 'active' })
        .eq('id', projectId)
        .select()
        .single()

      if (updateError) {
        return NextResponse.json({ error: 'Failed to update project status' }, { status: 500 })
      }

      return NextResponse.json({ project: updatedProject })
    }

    // Generate repo name from project name
    const repoName = project.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50)

    // Create GitHub repo
    const repo = await createRepo({
      name: repoName,
      description: project.description || `${project.name} - A project on itay.dev`,
      isPrivate: false,
      autoInit: true,
    })

    // Configure webhook for PR events
    if (WEBHOOK_SECRET) {
      try {
        await createWebhook({
          owner: GITHUB_OWNER,
          repo: repo.name,
          webhookUrl: WEBHOOK_URL,
          secret: WEBHOOK_SECRET,
        })
        console.log(`Webhook configured for ${GITHUB_OWNER}/${repo.name}`)
      } catch (webhookError) {
        console.error('Failed to create webhook:', webhookError)
        // Don't fail if webhook creation fails
      }
    }

    // Update project with repo info and set status to active
    const { data: updatedProject, error: updateError } = await supabase
      .schema('itay')
      .from('projects')
      .update({
        github_repo_url: repo.html_url,
        github_repo_name: `${GITHUB_OWNER}/${repo.name}`,
        status: 'active',
      })
      .eq('id', projectId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating project:', updateError)
      return NextResponse.json(
        { error: 'Repo created but failed to update project' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      project: updatedProject,
      repo: {
        url: repo.html_url,
        name: repo.name,
        full_name: repo.full_name,
      },
    })

  } catch (error) {
    console.error('Publish project error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to publish project' },
      { status: 500 }
    )
  }
}
