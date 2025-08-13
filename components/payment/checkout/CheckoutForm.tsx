"use client"

import React, { useState } from "react"
import { PaymentElement, AddressElement, useCheckout } from "@stripe/react-stripe-js"

export default function CheckoutForm() {
  const checkout = useCheckout()
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setMessage("Please enter your email address")
      return
    }
    
    setIsLoading(true)

    try {
      // Update email before confirming
      await checkout.updateEmail(email)
      
      const confirmResult = await checkout.confirm()
      if (confirmResult.type === "error") {
        setMessage(confirmResult.error.message)
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

      <h4 className="text-sm font-semibold">Payment</h4>
      <PaymentElement id="payment-element" />

      <button disabled={isLoading} id="submit" className="mt-4 w-full rounded bg-emerald-600 px-4 py-2 text-white disabled:opacity-50">
        {isLoading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white mx-auto" />
        ) : (
          `Pay ¥${checkout.total.total.amount} now`
        )}
      </button>

      {message && <div id="payment-message" className="text-sm text-red-600">{message}</div>}
    </form>
  )
}
