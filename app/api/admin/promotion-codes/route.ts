import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is not set")
  return new Stripe(secretKey, { apiVersion: "2025-07-30.basil" })
}

// 创建促销码
export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe()
    const body = await request.json()
    
    const {
      coupon_id,
      code,
      customer,
      max_redemptions,
      expires_at,
      restrictions
    } = body

    // 验证必要参数
    if (!coupon_id) {
      return NextResponse.json({
        error: "Missing required fields",
        details: "coupon_id is required"
      }, { status: 400 })
    }

    const promotionCodeData: any = {
      coupon: coupon_id
    }

    if (code) {
      promotionCodeData.code = code.toUpperCase()
    }

    if (customer) {
      promotionCodeData.customer = customer
    }

    if (max_redemptions) {
      promotionCodeData.max_redemptions = max_redemptions
    }

    if (expires_at) {
      promotionCodeData.expires_at = Math.floor(new Date(expires_at).getTime() / 1000)
    }

    if (restrictions) {
      promotionCodeData.restrictions = restrictions
    }

    const promotionCode = await stripe.promotionCodes.create(promotionCodeData)

    return NextResponse.json({
      success: true,
      promotionCode: {
        id: promotionCode.id,
        code: promotionCode.code,
        coupon: promotionCode.coupon.id,
        customer: promotionCode.customer,
        max_redemptions: promotionCode.max_redemptions,
        expires_at: promotionCode.expires_at,
        restrictions: promotionCode.restrictions,
        active: promotionCode.active,
        created: promotionCode.created
      }
    })
  } catch (error: any) {
    console.error("Create promotion code error:", error)
    const message = error?.raw?.message || error?.message || "Failed to create promotion code"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// 获取所有促销码
export async function GET() {
  try {
    const stripe = getStripe()
    const promotionCodes = await stripe.promotionCodes.list({ limit: 100 })

    return NextResponse.json({
      success: true,
      promotionCodes: promotionCodes.data.map(promo => ({
        id: promo.id,
        code: promo.code,
        coupon: promo.coupon.id,
        customer: promo.customer,
        max_redemptions: promo.max_redemptions,
        expires_at: promo.expires_at,
        restrictions: promo.restrictions,
        active: promo.active,
        created: promo.created
      }))
    })
  } catch (error: any) {
    console.error("List promotion codes error:", error)
    const message = error?.raw?.message || error?.message || "Failed to list promotion codes"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
