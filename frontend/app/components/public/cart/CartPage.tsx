'use client'

import React            from 'react'
import Link             from 'next/link'
import { useCart }      from '../../home/hooks/useCart'
import CheckoutSummary  from './CheckOutCard'
import StockBadge       from './StockBadge'
import { AppImage }     from '@/app/components/ui/AppImage'

const MAX_QTY = 30

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart()

  // ── Derived totals ──────────────────────────────────────────────────────────
  const totalItems    = cartItems.reduce((s, i) => s + i.quantity, 0)
  const subtotal      = cartItems.reduce((s, i) => s + i.price * i.quantity, 0)
  const deliveryTotal = cartItems.reduce((s, i) => s + (i.deliveryCharges ?? 0), 0)
  const total         = subtotal + deliveryTotal

  // ── Qty with clamp ──────────────────────────────────────────────────────────
  const handleQty = (id: string, raw: number, stock: number) => {
    const clamped = Math.max(1, Math.min(isNaN(raw) ? 1 : raw, stock, MAX_QTY))
    updateQuantity(id, clamped)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1EB] to-[#faf8f5] px-[clamp(16px,5vw,48px)] py-8">
      <div className="max-w-[1400px] mx-auto">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex justify-between items-end mb-8 pb-5 border-b-2 border-[#E8DFD6] flex-wrap gap-5">
          <div>
            <h1 className="text-[32px] font-bold text-[#3E2723] tracking-[-0.5px] m-0">
              Shopping Cart
            </h1>
            {cartItems.length > 0 && (
              <p className="text-sm text-[#8D6E63] mt-2">
                {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
              </p>
            )}
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="px-5 py-2.5 border-[1.5px] border-[#C9A27B] rounded-lg text-sm font-semibold text-[#8B5A3C] hover:bg-[#8B5A3C] hover:text-white transition-all"
            >
              Clear Cart
            </button>
          )}
        </div>

        {cartItems.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* ── Items List ──────────────────────────────────────────────── */}
            <div className="flex-1 min-w-0">

              {/* Desktop Header */}
              <div className="hidden md:grid grid-cols-[100px_1fr_100px_150px_100px_40px] gap-4 p-4 bg-[#F5F1EB] rounded-xl mb-4 text-xs font-semibold text-[#6D4C41] uppercase tracking-[0.5px]">
                <div className="col-span-2">Product</div>
                <div>Price</div>
                <div>Quantity</div>
                <div>Total</div>
                <div />
              </div>

              <div className="flex flex-col gap-4">
                {cartItems.map((item) => {
                  const stock      = item.stockQuantity ?? 0
                  const outOfStock = stock === 0
                  const maxQty     = Math.min(stock, MAX_QTY)

                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-[80px_1fr] md:grid-cols-[100px_1fr_100px_150px_100px_40px] gap-4 p-5 bg-[#FEFDFB] border border-[#E8DFD6] rounded-2xl hover:shadow-lg transition-all"
                    >
                      {/* Image */}
                      <div className="relative w-20 h-20 md:w-[100px] md:h-[100px] rounded-xl overflow-hidden bg-[#F5F1EB]">
                        <AppImage
                          src={item.image}
                          alt={item.name}
                          width={100}
                          height={100}
                          className="w-full h-full rounded-xl"
                        />
                        {outOfStock && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl">
                            <span className="bg-red-600 text-white px-2.5 py-1 rounded-full text-xs font-semibold -rotate-6">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex flex-col justify-center gap-1.5">
                        <h3 className="text-base font-semibold text-[#3E2723] leading-tight">
                          {item.name}
                        </h3>
                        <StockBadge product={item} size="sm" />
                        <p className="text-xs">
                          {(item.deliveryCharges ?? 0) > 0 ? (
                            <span className="text-[#8D6E63]">
                              + ${item.deliveryCharges.toFixed(2)} delivery
                            </span>
                          ) : (
                            <span className="text-[#2E7D32] font-medium">Free Delivery</span>
                          )}
                        </p>
                      </div>

                      {/* Unit Price */}
                      <div className="flex items-center justify-between md:justify-center bg-[#F5F1EB] md:bg-transparent px-4 md:px-0 py-3 md:py-0 rounded-lg md:rounded-none col-span-2 md:col-span-1">
                        <span className="md:hidden text-xs text-[#8D6E63] font-medium">Price</span>
                        <span className="text-base font-semibold text-[#3E2723]">
                          ${Number(item.price || 0).toFixed(2)}
                        </span>
                      </div>

                      {/* Quantity Control */}
                      <div className="flex items-center justify-between md:justify-center bg-[#F5F1EB] md:bg-transparent px-4 md:px-0 py-3 md:py-0 rounded-lg md:rounded-none col-span-2 md:col-span-1">
                        <span className="md:hidden text-xs text-[#8D6E63] font-medium">Qty</span>
                        <div className="flex items-center gap-1 bg-[#F5F1EB] rounded-lg p-1">
                          <button
                            onClick={() => handleQty(item.id, item.quantity - 1, stock)}
                            disabled={item.quantity <= 1 || outOfStock}
                            className="w-8 h-8 bg-[#FEFDFB] rounded-lg text-lg font-semibold text-[#8B5A3C] hover:bg-[#8B5A3C] hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            min={1}
                            max={maxQty}
                            disabled={outOfStock}
                            onChange={(e) => handleQty(item.id, parseInt(e.target.value, 10), stock)}
                            className="w-[50px] text-center bg-transparent text-base font-medium text-[#1f2937] p-2 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          />
                          <button
                            onClick={() => handleQty(item.id, item.quantity + 1, stock)}
                            disabled={item.quantity >= maxQty || outOfStock}
                            className="w-8 h-8 bg-[#FEFDFB] rounded-lg text-lg font-semibold text-[#8B5A3C] hover:bg-[#8B5A3C] hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="flex items-center justify-between md:justify-center bg-[#8B5A3C] md:bg-transparent px-4 md:px-0 py-3 md:py-0 rounded-lg md:rounded-none col-span-2 md:col-span-1">
                        <span className="md:hidden text-xs text-white font-medium">Total</span>
                        <span className="text-base md:text-lg font-bold text-white md:text-[#8B5A3C]">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      {/* Remove */}
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Remove ${item.name}`}
                          className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-700 hover:text-white transition-all"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 py-4">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#8B5A3C] no-underline hover:underline hover:gap-3 transition-all"
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>

            {/* ── Checkout Sidebar ─────────────────────────────────────────── */}
            <div className="w-full lg:w-[380px] flex-shrink-0 sticky top-[150px]">
              <CheckoutSummary
                cartItems={cartItems}
                subtotal={subtotal}
                tax={0}
                total={total}
                deliveryCharges={deliveryTotal}
              />
            </div>
          </div>
        ) : (
          /* ── Empty State ──────────────────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center text-center p-20 bg-[#FEFDFB] rounded-3xl border border-[#E8DFD6]">
            <div className="text-8xl mb-6 opacity-60">🛒</div>
            <h2 className="text-2xl font-semibold text-[#3E2723] mb-3">Your cart is empty</h2>
            <p className="text-[15px] text-[#8D6E63] mb-7">
              Looks like you haven't added any items yet.
            </p>
            <Link
              href="/products"
              className="px-8 py-3.5 bg-gradient-to-r from-[#8B5A3C] to-[#A67C52] text-white no-underline rounded-xl text-sm font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}