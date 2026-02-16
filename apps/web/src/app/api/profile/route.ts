import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { github_username } = body

    // Validate github_username format if provided
    if (github_username !== null && github_username !== '') {
      if (typeof github_username !== 'string' || github_username.length > 39) {
        return NextResponse.json({ error: 'GitHub username must be 39 characters or less' }, { status: 400 })
      }
      if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(github_username)) {
        return NextResponse.json({ error: 'Invalid GitHub username format' }, { status: 400 })
      }
    }

    const { error } = await supabase
      .schema('itay')
      .from('users')
      .update({
        github_username: github_username || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      console.error('Error updating profile:', error)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
