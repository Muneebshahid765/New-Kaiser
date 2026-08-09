'use client'

import { useState, useEffect, useCallback } from 'react'
import { CartItem } from '../../cart/types/cart'                    // ← single source
import { modals }   from '@/hooks/store/useModalStore'

const CART_KEY   = 'cart'
const CART_EVENT = 'cartUpdated'

const readCart = (): CartItem[] => {
  try { return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]') }
  catch { return [] }
}

const writeCart = (items: CartItem[]): void => {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event(CART_EVENT))
}

export function useCart() {
  const [cartItems,         setCartItems]         = useState<CartItem[]>([])
  const [cartNotification,  setCartNotification]  = useState<{ name: string } | null>(null)

  useEffect(() => {
    const sync = () => setCartItems(readCart())
    sync()
    window.addEventListener(CART_EVENT, sync)
    return () => window.removeEventListener(CART_EVENT, sync)
  }, [])

  useEffect(() => {
    if (!cartNotification) return
    const t = setTimeout(() => setCartNotification(null), 3_000)
    return () => clearTimeout(t)
  }, [cartNotification])

  const addToCart = useCallback((product: Omit<CartItem, 'quantity'>) => {
    if (product.stockQuantity === 0) {
      modals.alert({ title: 'Out of Stock', description: `"${product.name}" is currently unavailable.`, variant: 'warning' })
      return
    }
    const cart = readCart()
    const idx  = cart.findIndex(i => i.id === product.id)
    if (idx >= 0) {
      if (cart[idx].quantity >= product.stockQuantity) {
        modals.alert({ title: 'Cart Limit Reached', description: `Only ${product.stockQuantity} unit(s) of "${product.name}" in stock.`, variant: 'warning' })
        return
      }
      cart[idx].quantity += 1
    } else {
      cart.push({ ...product, quantity: 1 })
    }
    writeCart(cart)
    setCartNotification({ name: product.name })
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    const cart = readCart()
    const idx  = cart.findIndex(i => i.id === id)
    if (idx < 0) return
    quantity <= 0 ? cart.splice(idx, 1) : (cart[idx].quantity = quantity)
    writeCart(cart)
  }, [])

  const removeFromCart = useCallback(
    (id: string) => writeCart(readCart().filter(i => i.id !== id)),
    [],
  )

  const clearCart = useCallback(() => writeCart([]), [])

  return {
    cartItems,
    cartUniqueCount:  cartItems.length,
    cartTotalCount:   cartItems.reduce((s, i) => s + i.quantity, 0),
    cartNotification,
    setCartNotification,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  }
}