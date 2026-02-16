import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id: ticketId } = await params
    const supabase = await createClient()

    const { data: comments, error } = await supabase
      .schema('itay')
      .from('ticket_comments')
      .select('*, user:users(id, name, avatar_url, github_username)')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching comments:', error)
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
    }

    return NextResponse.json({ comments: comments || [] })
  } catch (error) {
    console.error('Comments fetch error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id: ticketId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const content = body.content?.trim()

    if (!content) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 })
    }

    if (content.length > 5000) {
      return NextResponse.json({ error: 'Comment must be 5000 characters or less' }, { status: 400 })
    }

    const { data: comment, error } = await supabase
      .schema('itay')
      .from('ticket_comments')
      .insert({
        ticket_id: ticketId,
        user_id: user.id,
        content,
      })
      .select('*, user:users(id, name, avatar_url, github_username)')
      .single()

    if (error) {
      console.error('Error creating comment:', error)
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
    }

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error('Comment create error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
