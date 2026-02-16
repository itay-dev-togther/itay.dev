import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ id: string; commentId: string }>
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { commentId } = await params
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
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', commentId)
      .eq('user_id', user.id) // RLS also enforces this
      .select('*, user:users(id, name, avatar_url, github_username)')
      .single()

    if (error) {
      console.error('Error updating comment:', error)
      return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 })
    }

    return NextResponse.json({ comment })
  } catch (error) {
    console.error('Comment update error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { commentId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .schema('itay')
      .from('ticket_comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      console.error('Error deleting comment:', error)
      return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Comment delete error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
