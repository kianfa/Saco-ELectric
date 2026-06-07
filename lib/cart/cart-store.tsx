"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { toast } from "sonner"

const CART_STORAGE_KEY = "industrial-electrical-cart-v1"
const FALLBACK_MAX_QUANTITY = 99

export interface CartItem {
  productId: string
  slug: string
  name: string
  model: string | null
  sku: string | null
  brandName: string | null
  price: number
  oldPrice: number | null
  mainImageUrl: string | null
  quantity: number
  stockQuantity: number
}

export type AddToCartProduct = Omit<CartItem, "quantity">

export interface CartTotals {
  subtotal: number
  discount: number
  payable: number
  totalQuantity: number
  uniqueItems: number
}

interface CartContextValue {
  items: CartItem[]
  isHydrated: boolean
  addToCart: (product: AddToCartProduct, quantity?: number) => boolean
  removeFromCart: (productId: string) => void
  increaseQuantity: (productId: string) => void
  decreaseQuantity: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartItemsCount: () => number
  totals: CartTotals
}

const CartContext = createContext<CartContextValue | null>(null)

function normalizeQuantity(quantity: number) {
  if (!Number.isFinite(quantity)) return 1
  return Math.max(1, Math.floor(quantity))
}

function getMaxAllowedQuantity(stockQuantity: number) {
  return stockQuantity > 0 ? stockQuantity : FALLBACK_MAX_QUANTITY
}

function calculateTotals(items: CartItem[]): CartTotals {
  return items.reduce<CartTotals>(
    (totals, item) => {
      const quantity = normalizeQuantity(item.quantity)
      const lineSubtotal = (item.oldPrice ?? item.price) * quantity
      const linePayable = item.price * quantity

      totals.subtotal += lineSubtotal
      totals.payable += linePayable
      totals.discount += Math.max(0, lineSubtotal - linePayable)
      totals.totalQuantity += quantity
      totals.uniqueItems += 1

      return totals
    },
    { subtotal: 0, discount: 0, payable: 0, totalQuantity: 0, uniqueItems: 0 }
  )
}

function parseStoredCart(value: string | null): CartItem[] {
  if (!value) return []

  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((item): item is CartItem => {
        return Boolean(
          item &&
            typeof item.productId === "string" &&
            typeof item.slug === "string" &&
            typeof item.name === "string" &&
            typeof item.price === "number" &&
            typeof item.quantity === "number"
        )
      })
      .map((item) => ({
        ...item,
        quantity: Math.min(
          normalizeQuantity(item.quantity),
          getMaxAllowedQuantity(Number(item.stockQuantity) || 0)
        ),
        stockQuantity: Number(item.stockQuantity) || 0,
        oldPrice: typeof item.oldPrice === "number" ? item.oldPrice : null,
        model: item.model ?? null,
        sku: item.sku ?? null,
        brandName: item.brandName ?? null,
        mainImageUrl: item.mainImageUrl ?? null,
      }))
  } catch {
    return []
  }
}

function showStockWarning() {
  toast.warning("تعداد انتخاب‌شده بیشتر از موجودی انبار است")
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setItems(parseStoredCart(window.localStorage.getItem(CART_STORAGE_KEY)))
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [isHydrated, items])

  const addToCart = useCallback((product: AddToCartProduct, quantity = 1) => {
    const requestedQuantity = normalizeQuantity(quantity)
    const maxQuantity = getMaxAllowedQuantity(product.stockQuantity)

    if (product.stockQuantity === 0) {
      toast.error("این محصول در حال حاضر ناموجود است")
      return false
    }

    let added = false
    let stockLimited = false

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.productId === product.productId)
      const currentQuantity = existingItem?.quantity ?? 0
      const nextQuantity = currentQuantity + requestedQuantity
      const safeQuantity = Math.min(nextQuantity, maxQuantity)

      if (safeQuantity < nextQuantity) {
        stockLimited = true
      }

      if (existingItem) {
        if (safeQuantity === existingItem.quantity) {
          return currentItems
        }

        added = true
        return currentItems.map((item) =>
          item.productId === product.productId
            ? {
                ...item,
                ...product,
                quantity: safeQuantity,
              }
            : item
        )
      }

      if (safeQuantity <= 0) {
        return currentItems
      }

      added = true
      return [...currentItems, { ...product, quantity: safeQuantity }]
    })

    if (stockLimited) {
      showStockWarning()
    }

    if (added) {
      toast.success("محصول به سبد خرید اضافه شد")
    }

    return added
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.productId !== productId))
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    const requestedQuantity = normalizeQuantity(quantity)

    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.productId !== productId) return item

        const maxQuantity = getMaxAllowedQuantity(item.stockQuantity)
        if (requestedQuantity > maxQuantity) {
          showStockWarning()
        }

        return {
          ...item,
          quantity: Math.min(requestedQuantity, maxQuantity),
        }
      })
    )
  }, [])

  const increaseQuantity = useCallback(
    (productId: string) => {
      const item = items.find((cartItem) => cartItem.productId === productId)
      if (!item) return
      updateQuantity(productId, item.quantity + 1)
    },
    [items, updateQuantity]
  )

  const decreaseQuantity = useCallback(
    (productId: string) => {
      const item = items.find((cartItem) => cartItem.productId === productId)
      if (!item) return

      if (item.quantity <= 1) {
        removeFromCart(productId)
        return
      }

      updateQuantity(productId, item.quantity - 1)
    },
    [items, removeFromCart, updateQuantity]
  )

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const totals = useMemo(() => calculateTotals(items), [items])

  const getCartTotal = useCallback(() => totals.payable, [totals.payable])
  const getCartItemsCount = useCallback(() => totals.totalQuantity, [totals.totalQuantity])

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isHydrated,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartItemsCount,
      totals,
    }),
    [
      addToCart,
      clearCart,
      decreaseQuantity,
      getCartItemsCount,
      getCartTotal,
      increaseQuantity,
      isHydrated,
      items,
      removeFromCart,
      totals,
      updateQuantity,
    ]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used inside CartProvider")
  }
  return context
}
