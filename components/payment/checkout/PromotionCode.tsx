"use client"

import React, { useState } from "react"
import { useCheckout } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X, Tag, CheckCircle } from "lucide-react"

export default function PromotionCode() {
  const checkout = useCheckout()
  const [promotionCode, setPromotionCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [appliedCode, setAppliedCode] = useState<string | null>(null)

  const handleApplyPromotionCode = async () => {
    if (!promotionCode.trim()) {
      setError("Please enter a promotion code")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await checkout.applyPromotionCode(promotionCode.trim())
      
      if (result.type === "error") {
        setError(result.error.message)
      } else {
        // Successfully applied
        setAppliedCode(promotionCode.trim())
        setPromotionCode("")
        setError(null)
      }
    } catch (error) {
      setError("Failed to apply promotion code")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemovePromotionCode = async () => {
    try {
      await checkout.removePromotionCode()
      setAppliedCode(null)
      setError(null)
    } catch (error) {
      setError("Failed to remove promotion code")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleApplyPromotionCode()
    }
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold flex items-center">
        <Tag className="w-4 h-4 mr-2" />
        Promotion Code
      </h4>
      
      {appliedCode ? (
        <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-md">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
              {appliedCode}
            </Badge>
            <span className="text-sm text-emerald-700">Applied</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemovePromotionCode}
            className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="flex space-x-2">
          <Input
            type="text"
            value={promotionCode}
            onChange={(e) => setPromotionCode(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter promotion code"
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={handleApplyPromotionCode}
            disabled={isLoading || !promotionCode.trim()}
            variant="outline"
            size="sm"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-emerald-600" />
            ) : (
              "Apply"
            )}
          </Button>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
          {error}
        </div>
      )}

      {appliedCode && (
        <div className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-md p-2">
          ✓ Promotion code applied successfully! Your total has been updated.
        </div>
      )}
    </div>
  )
}
