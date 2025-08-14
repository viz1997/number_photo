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

    let priceId = process.env.STRIPE_PRICE_ID
    
    // 检查价格 ID 是否有效
    if (!priceId || priceId.startsWith('prod_')) {
      console.error("Invalid STRIPE_PRICE_ID:", priceId)
      return NextResponse.json({
        error: "Invalid STRIPE_PRICE_ID configuration",
        details: "Please create a Price in Stripe Dashboard and set STRIPE_PRICE_ID to the price ID (starts with 'price_')"
      }, { status: 500 })
    }

    // 验证价格是否存在
    try {
      await stripe.prices.retrieve(priceId)
    } catch (priceError: any) {
      console.error("Price not found:", priceError.message)
      return NextResponse.json({
        error: "Price not found in Stripe",
        details: `The price ID '${priceId}' does not exist in your Stripe account. Please create a price for ¥500 in your Stripe Dashboard.`
      }, { status: 500 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      ui_mode: "custom",
      return_url: returnUrl || fallbackReturnUrl,
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
