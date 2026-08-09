// ─── CartItem ─────────────────────────────────────────────────────────────────
// Used in: useCart, CartPage, CheckoutSummary, StockBadge, FeaturedProductsSection
export interface CartItem {
  id:              string
  name:            string
  slug:            string
  price:           number
  image:           string
  stockQuantity:   number
  deliveryCharges: number   // 0 = free delivery
  quantity:        number
}

// ─── Stock Validation (optional server sync) ──────────────────────────────────
export interface ValidationResult {
  product:       string
  available:     boolean
  reason?:       string
  stockQuantity?: number
}

export interface ValidationResponse {
  results: ValidationResult[]
}