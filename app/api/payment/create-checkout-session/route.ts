import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is not set")
  // Upgrade API version to support ui_mode: custom
  return new Stripe(secretKey, { apiVersion: "2025-07-30.basil" })
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe()
    const { email, photoRecordId, returnUrl } = await request.json().catch(() => ({ }))

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const fallbackReturnUrl = `${origin}/payment/complete?session_id={CHECKOUT_SESSION_ID}`

    const priceId = process.env.STRIPE_PRICE_ID
    if (!priceId) {
      return NextResponse.json({
        error: "Missing STRIPE_PRICE_ID",
        details: "Set STRIPE_PRICE_ID to a pre-created Price (e.g., price_...) in your environment."
      }, { status: 500 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      ui_mode: "custom",
      return_url: returnUrl || fallbackReturnUrl,
      allow_promotion_codes: true, // 启用促销码功能
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: email || undefined,
      metadata: {
        email: email || "",
        photoRecordId: photoRecordId || "",
        service: "my_number_card_photo",
      },
    })

    return NextResponse.json({ clientSecret: session.client_secret })
  } catch (error: any) {
    console.error("create-checkout-session (custom) error", error)
    const message = error?.raw?.message || error?.message || "Failed to create checkout session"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
