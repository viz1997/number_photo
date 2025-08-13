import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is not set")
  return new Stripe(secretKey, { apiVersion: "2025-07-30.basil" })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // If payment is complete, mark the associated photo record as paid
    if (session.payment_status === "paid") {
      const photoRecordId = (session.metadata as any)?.photoRecordId as string | undefined
      if (photoRecordId) {
        try {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
          const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
          
          console.log('Payment completed, updating photo record:', {
            photoRecordId,
            supabaseUrl: supabaseUrl ? 'Set' : 'Missing',
            serviceRoleKey: serviceRoleKey ? 'Set' : 'Missing'
          })
          
          if (supabaseUrl && serviceRoleKey) {
            const admin = createClient(supabaseUrl, serviceRoleKey)
            const { error } = await admin
              .from('photos')
              .update({
                is_paid: true,
                email: session.customer_email ?? undefined,
              })
              .eq('id', photoRecordId)
              
            if (error) {
              console.error('Failed to update photo record as paid:', error)
            } else {
              console.log('Successfully updated photo record as paid:', photoRecordId)
            }
          } else {
            console.error("Missing Supabase configuration:", {
              supabaseUrl: !!supabaseUrl,
              serviceRoleKey: !!serviceRoleKey
            })
            console.warn("SUPABASE_SERVICE_ROLE_KEY is required to update payment status")
          }
        } catch (e) {
          console.error("Failed to update photo record as paid:", e)
        }
      }
    }

    return NextResponse.json({
      status: session.payment_status === "paid" ? "complete" : "incomplete",
      session: {
        id: session.id,
        payment_status: session.payment_status,
        status: session.status,
        customer_email: session.customer_email,
        metadata: session.metadata,
      },
    })
  } catch (error: any) {
    console.error("session-status error", error)
    const message = error?.raw?.message || error?.message || "Failed to retrieve session status"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
