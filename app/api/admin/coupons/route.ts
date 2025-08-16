import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is not set")
  return new Stripe(secretKey, { apiVersion: "2025-07-30.basil" })
}

// 创建优惠券
export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe()
    const body = await request.json()
    
    const {
      name,
      percent_off,
      amount_off,
      currency,
      duration,
      max_redemptions,
      redeem_by,
      applies_to
    } = body

    // 验证必要参数
    if (!percent_off && !amount_off) {
      return NextResponse.json({
        error: "Missing required fields",
        details: "Either percent_off or amount_off is required"
      }, { status: 400 })
    }

    if (amount_off && !currency) {
      return NextResponse.json({
        error: "Missing required fields",
        details: "currency is required when amount_off is specified"
      }, { status: 400 })
    }

    const couponData: any = {
      duration: duration || "once"
    }

    if (name) {
      couponData.name = name
    }

    if (percent_off) {
      couponData.percent_off = percent_off
    }

    if (amount_off) {
      couponData.amount_off = amount_off
      couponData.currency = currency
    }

    if (max_redemptions) {
      couponData.max_redemptions = max_redemptions
    }

    if (redeem_by) {
      couponData.redeem_by = Math.floor(new Date(redeem_by).getTime() / 1000)
    }

    if (applies_to) {
      couponData.applies_to = applies_to
    }

    const coupon = await stripe.coupons.create(couponData)

    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon.id,
        name: coupon.name,
        percent_off: coupon.percent_off,
        amount_off: coupon.amount_off,
        currency: coupon.currency,
        duration: coupon.duration,
        max_redemptions: coupon.max_redemptions,
        redeem_by: coupon.redeem_by,
        applies_to: coupon.applies_to,
        valid: coupon.valid,
        created: coupon.created
      }
    })
  } catch (error: any) {
    console.error("Create coupon error:", error)
    const message = error?.raw?.message || error?.message || "Failed to create coupon"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// 获取所有优惠券
export async function GET() {
  try {
    const stripe = getStripe()
    const coupons = await stripe.coupons.list({ limit: 100 })

    return NextResponse.json({
      success: true,
      coupons: coupons.data.map(coupon => ({
        id: coupon.id,
        name: coupon.name,
        percent_off: coupon.percent_off,
        amount_off: coupon.amount_off,
        currency: coupon.currency,
        duration: coupon.duration,
        max_redemptions: coupon.max_redemptions,
        redeem_by: coupon.redeem_by,
        applies_to: coupon.applies_to,
        valid: coupon.valid,
        created: coupon.created
      }))
    })
  } catch (error: any) {
    console.error("List coupons error:", error)
    const message = error?.raw?.message || error?.message || "Failed to list coupons"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// 更新优惠券
export async function PUT(request: NextRequest) {
  try {
    const stripe = getStripe()
    const body = await request.json()
    
    const { id, name, max_redemptions, redeem_by } = body

    if (!id) {
      return NextResponse.json({
        error: "Missing required fields",
        details: "id is required"
      }, { status: 400 })
    }

    const updateData: any = {}

    if (name !== undefined) {
      updateData.name = name
    }

    if (max_redemptions !== undefined) {
      updateData.max_redemptions = max_redemptions
    }

    if (redeem_by !== undefined) {
      updateData.redeem_by = Math.floor(new Date(redeem_by).getTime() / 1000)
    }

    const coupon = await stripe.coupons.update(id, updateData)

    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon.id,
        name: coupon.name,
        percent_off: coupon.percent_off,
        amount_off: coupon.amount_off,
        currency: coupon.currency,
        duration: coupon.duration,
        max_redemptions: coupon.max_redemptions,
        redeem_by: coupon.redeem_by,
        applies_to: coupon.applies_to,
        valid: coupon.valid,
        created: coupon.created
      }
    })
  } catch (error: any) {
    console.error("Update coupon error:", error)
    const message = error?.raw?.message || error?.message || "Failed to update coupon"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// 删除优惠券
export async function DELETE(request: NextRequest) {
  try {
    const stripe = getStripe()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({
        error: "Missing required fields",
        details: "id is required"
      }, { status: 400 })
    }

    await stripe.coupons.del(id)

    return NextResponse.json({
      success: true,
      message: "Coupon deleted successfully"
    })
  } catch (error: any) {
    console.error("Delete coupon error:", error)
    const message = error?.raw?.message || error?.message || "Failed to delete coupon"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
