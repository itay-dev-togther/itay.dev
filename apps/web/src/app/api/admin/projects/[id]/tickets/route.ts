import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
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

    const { data: tickets, error } = await supabase
      .schema('itay')
      .from('tickets')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 })
    }

    return NextResponse.json({ tickets })

  } catch (error) {
    console.error('Get tickets error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

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

    // Verify project exists
    const { data: project } = await supabase
      .schema('itay')
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .single()

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get request body
    const body = await request.json()
    const { title, description, acceptance_criteria, difficulty } = body

    if (!title || !difficulty) {
      return NextResponse.json(
        { error: 'title and difficulty are required' },
        { status: 400 }
      )
    }

    // Create ticket
    const { data: ticket, error: createError } = await supabase
      .schema('itay')
      .from('tickets')
      .insert({
        project_id: projectId,
        title,
        description: description || null,
        acceptance_criteria: acceptance_criteria || null,
        difficulty,
        status: 'available',
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating ticket:', createError)
      return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 })
    }

    return NextResponse.json({ ticket })

  } catch (error) {
    console.error('Create ticket error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
