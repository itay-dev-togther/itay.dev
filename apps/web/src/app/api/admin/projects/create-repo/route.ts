import { createClient } from '@/lib/supabase/server'
import { createRepoFromTemplate, GITHUB_OWNER } from '@/lib/github/client'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
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
    const { project_id, template_owner, template_repo, repo_name } = body

    if (!project_id || !template_owner || !template_repo || !repo_name) {
      return NextResponse.json(
        { error: 'project_id, template_owner, template_repo, and repo_name are required' },
        { status: 400 }
      )
    }

    // Get project
    const { data: project, error: projectError } = await supabase
      .schema('itay')
      .from('projects')
      .select('*')
      .eq('id', project_id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.github_repo_url) {
      return NextResponse.json(
        { error: 'Project already has a GitHub repository linked' },
        { status: 400 }
      )
    }

    // Create repo from template
    const repo = await createRepoFromTemplate({
      templateOwner: template_owner,
      templateRepo: template_repo,
      name: repo_name,
      description: project.description || undefined,
      isPrivate: false,
    })

    // Update project with repo info
    const { data: updatedProject, error: updateError } = await supabase
      .schema('itay')
      .from('projects')
      .update({
        github_repo_url: repo.html_url,
        github_repo_name: `${GITHUB_OWNER}/${repo.name}`,
        template_id: `${template_owner}/${template_repo}`,
      })
      .eq('id', project_id)
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
    console.error('Create repo error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create repository' },
      { status: 500 }
    )
  }
}
