"use client"

import React, { useEffect, useState } from "react"
import { PaymentElement, AddressElement, useCheckout } from "@stripe/react-stripe-js"
import PromotionCode from "./PromotionCode"

export default function CheckoutForm() {
  const checkout = useCheckout()
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")

  // 邮箱验证函数
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim())
  }

  // Prefill email from sessionStorage if present (saved from email dialog in step 2)
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("email")
      if (stored && typeof stored === "string") {
        setEmail(stored)
      }
    } catch {}
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setMessage("Please enter your email address")
      return
    }

    if (!email.includes('@') || !email.includes('.')) {
      setMessage("Please enter a valid email address")
      return
    }
    
    setIsLoading(true)

    try {
      // 仅当创建会话时未传入 customer_email 时，才允许在确认前更新 email，避免 Stripe 报错
      let providedAtCreation = false
      try {
        providedAtCreation = sessionStorage.getItem('emailProvidedAtCheckoutSession') === 'true'
      } catch {}
      if (!providedAtCreation) {
        await checkout.updateEmail(email)
      }
      
      const confirmResult = await checkout.confirm()
      if (confirmResult.type === "error") {
        setMessage(confirmResult.error.message)
      } else {
        // mark payment completed locally and notify parent page to create download token
        try {
          sessionStorage.setItem("email", email)
          sessionStorage.setItem("paymentCompleted", "true")
        } catch {}
        try {
          window.dispatchEvent(new Event("payment-completed"))
        } catch {}
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Payment failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email Input */}
      <div>
        <h4 className="text-sm font-semibold mb-2">Email Address *</h4>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">We'll send your processed photo to this email address</p>
      </div>

      <h4 className="text-sm font-semibold">Billing Address</h4>
      <AddressElement options={{ mode: "billing" }} />

      <PromotionCode />

      <h4 className="text-sm font-semibold">Payment</h4>
      <PaymentElement id="payment-element" />

      <button disabled={isLoading} id="submit" className="mt-4 w-full rounded bg-emerald-600 px-4 py-2 text-white disabled:opacity-50">
        {isLoading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white mx-auto" />
        ) : (
          ` ${checkout.total.total.amount} で購入`
        )}
      </button>

      {message && <div id="payment-message" className="text-sm text-red-600">{message}</div>}
    </form>
  )
}
