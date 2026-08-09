'use client'

import React from 'react'
import { CartItem } from './types/cart'

interface StockBadgeProps {
  product: Pick<CartItem, 'stockQuantity'>
  showOk?: boolean
  size?:   'sm' | 'md' | 'lg'
}

const SIZE = { sm: 'text-xs px-2 py-0.5', md: 'text-sm px-2.5 py-1', lg: 'text-base px-3 py-1.5' }

const StockBadge: React.FC<StockBadgeProps> = ({ product, showOk = false, size = 'sm' }) => {
  const { stockQuantity } = product
  const outOfStock = stockQuantity === 0
  const lowStock   = stockQuantity > 0 && stockQuantity <= 5

  if (!outOfStock && !lowStock && !showOk) return null

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${SIZE[size]} ${
      outOfStock ? 'bg-red-100 text-red-700' : lowStock ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
    }`}>
      {outOfStock ? 'Out of Stock' : lowStock ? `Low Stock (${stockQuantity} left)` : 'In Stock'}
    </span>
  )
}

export default StockBadge