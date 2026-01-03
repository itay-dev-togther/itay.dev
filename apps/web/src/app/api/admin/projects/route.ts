import { createClient } from '@/lib/supabase/server'
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
    const { name, description, difficulty, tech_stack, status } = body

    if (!name || !difficulty || !status) {
      return NextResponse.json(
        { error: 'name, difficulty, and status are required' },
        { status: 400 }
      )
    }

    // Create project
    const { data: project, error: createError } = await supabase
      .schema('itay')
      .from('projects')
      .insert({
        name,
        description: description || null,
        difficulty,
        tech_stack: tech_stack || [],
        status,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating project:', createError)
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }

    return NextResponse.json({ project })

  } catch (error) {
    console.error('Create project error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function GET() {
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

    const { data: projects, error } = await supabase
      .schema('itay')
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }

    return NextResponse.json({ projects })

  } catch (error) {
    console.error('Get projects error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
