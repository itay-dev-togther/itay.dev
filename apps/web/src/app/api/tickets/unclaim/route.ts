import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ticket_id } = body

    if (!ticket_id) {
      return NextResponse.json({ error: 'ticket_id is required' }, { status: 400 })
    }

    // Get the ticket
    const { data: ticket, error: ticketError } = await supabase
      .schema('itay')
      .from('tickets')
      .select('*')
      .eq('id', ticket_id)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Only the claimer can unclaim
    if (ticket.claimed_by !== user.id) {
      return NextResponse.json({ error: 'You can only release tickets you claimed' }, { status: 403 })
    }

    // Can't unclaim if a PR has been opened
    if (ticket.status === 'in_review' || ticket.status === 'done') {
      return NextResponse.json(
        { error: 'Cannot release a ticket that has a PR submitted or is completed' },
        { status: 400 }
      )
    }

    // Reset the ticket
    const { error: updateError } = await supabase
      .schema('itay')
      .from('tickets')
      .update({
        status: 'available',
        claimed_by: null,
        claimed_at: null,
        branch_name: null,
      })
      .eq('id', ticket_id)

    if (updateError) {
      console.error('Error unclaiming ticket:', updateError)
      return NextResponse.json({ error: 'Failed to release ticket' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unclaim ticket error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
