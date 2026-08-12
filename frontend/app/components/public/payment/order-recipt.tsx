'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter }  from 'next/navigation'
import OrderSuccess   from './OrderSuccess'
import type { VerifiedPaymentOrder } from '@/app/features/checkout/types/checkout-response.types'

// ─── Loader ───────────────────────────────────────────────────────────────────
const Spinner = () => (
  <div className="min-h-screen bg-[#FAF7F4] flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-[#E8D9C8] border-t-[#7A5C44] rounded-full animate-spin" />
  </div>
)

function ReceiptContent() {
  const router  = useRouter()
  const [order,   setOrder]   = useState<VerifiedPaymentOrder | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const raw = localStorage.getItem('lastOrder')

    if (!raw) {
      // lastOrder nahi mila — products pe redirect karo
      router.replace('/products')
      return
    }

    try {
      setOrder(JSON.parse(raw))
    } catch {
      localStorage.removeItem('lastOrder')
      router.replace('/products')
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleNewCheckout = () => {
    localStorage.removeItem('lastOrder')
    router.replace('/payment')
  }

  if (loading) return <Spinner />

  return <OrderSuccess order={order} onNewCheckout={handleNewCheckout} />
}

export default function OrderReceiptPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <ReceiptContent />
    </Suspense>
  )
}