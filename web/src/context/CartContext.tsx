'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react';
import { medusa, Cart } from '@/lib/medusa';

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  itemCount: number;
  addToCart: (variantId: string, quantity: number) => Promise<void>;
  updateQuantity: (lineItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (lineItemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  clearError: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_ID_KEY = 'freshcatch_cart_id';

// Medusa stores quantities in half-kg units (integers)
// Convert back to kg for display (13 units → 6.5 kg)
function transformCart(cart: Cart | null): Cart | null {
  if (!cart) return null;
  return {
    ...cart,
    items: cart.items?.map(item => ({
      ...item,
      quantity: item.quantity / 2, // Convert half-kg units to kg for display
      // item.total stays the same (already calculated correctly by Medusa)
    })) || [],
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [rawCart, setRawCart] = useState<Cart | null>(null);
  const cart = transformCart(rawCart);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getOrCreateCart = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if we have a cart ID stored
      const storedCartId = localStorage.getItem(CART_ID_KEY);

      if (storedCartId) {
        try {
          // Try to fetch existing cart
          const result = await medusa.getCart(storedCartId);
          const existingCart = result?.cart;

          // Check if cart is completed (has completed_at or no items after completion)
          if (existingCart && !(existingCart as Cart & { completed_at?: string }).completed_at) {
            setRawCart(existingCart);
            return existingCart;
          } else {
            // Cart is completed or invalid, remove and create new
            localStorage.removeItem(CART_ID_KEY);
          }
        } catch {
          // Cart doesn't exist or expired, create new one
          localStorage.removeItem(CART_ID_KEY);
        }
      }

      // Create new cart
      const result = await medusa.createCart();
      if (result?.cart) {
        localStorage.setItem(CART_ID_KEY, result.cart.id);
        setRawCart(result.cart);
        return result.cart;
      }
      return null;
    } catch {
      setError('Failed to initialize cart');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getOrCreateCart();
  }, [getOrCreateCart]);

  const refreshCart = useCallback(async () => {
    const cartId = localStorage.getItem(CART_ID_KEY);
    if (cartId) {
      try {
        const result = await medusa.getCart(cartId);
        const updatedCart = result?.cart;

        // Check if cart is completed
        if (updatedCart && !(updatedCart as Cart & { completed_at?: string }).completed_at) {
          setRawCart(updatedCart);
        } else {
          // Cart is completed, create new one
          localStorage.removeItem(CART_ID_KEY);
          await getOrCreateCart();
        }
      } catch {
        localStorage.removeItem(CART_ID_KEY);
        await getOrCreateCart();
      }
    } else {
      await getOrCreateCart();
    }
  }, [getOrCreateCart]);

  const addToCart = useCallback(async (variantId: string, quantity: number) => {
    // Convert to half-kg units (multiply by 2) to store as integer
    // 2.5 kg → 5 units, 1 kg → 2 units
    const quantityInHalfKg = Math.round(quantity * 2);

    try {
      setIsLoading(true);
      setError(null);

      let currentCart = cart;
      if (!currentCart) {
        currentCart = await getOrCreateCart();
        if (!currentCart) throw new Error('Failed to create cart');
      }

      const result = await medusa.addToCart(currentCart.id, variantId, quantityInHalfKg);

      // If cart was completed or invalid, create a new one and try again
      if (!result || !result.cart) {
        localStorage.removeItem(CART_ID_KEY);
        currentCart = await getOrCreateCart();
        if (!currentCart) throw new Error('Failed to create cart');

        const retryResult = await medusa.addToCart(currentCart.id, variantId, quantity);
        if (retryResult?.cart) {
          setRawCart(retryResult.cart);
        } else {
          throw new Error('Failed to add item after creating new cart');
        }
      } else {
        setRawCart(result.cart);
      }
    } catch (err: unknown) {
      // Check if error is due to completed cart
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('completed') || errorMessage.includes('400')) {
        // Cart is completed, create a new one
        localStorage.removeItem(CART_ID_KEY);
        const newCart = await getOrCreateCart();
        if (newCart) {
          const result = await medusa.addToCart(newCart.id, variantId, quantity);
          if (result?.cart) {
            setRawCart(result.cart);
            return;
          }
        }
      }

      setError('Failed to add item to cart');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [cart, getOrCreateCart]);

  const removeFromCart = useCallback(async (lineItemId: string) => {
    if (!cart) return;

    try {
      setIsLoading(true);
      setError(null);

      const result = await medusa.removeFromCart(cart.id, lineItemId);
      if (result?.cart) {
        setRawCart(result.cart);
      } else {
        await refreshCart();
      }
    } catch (err) {
      console.error('Failed to remove from cart:', err);
      setError('Failed to remove item from cart');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [cart, refreshCart]);

  const updateQuantity = useCallback(async (lineItemId: string, quantity: number) => {
    if (!cart) return;

    try {
      setIsLoading(true);
      setError(null);

      if (quantity <= 0) {
        await removeFromCart(lineItemId);
        return;
      }

      // Convert kg to half-kg units for Medusa (6.5 kg → 13 units)
      const quantityInHalfKg = Math.round(quantity * 2);

      console.log('🔄 UPDATE QUANTITY:', {
        lineItemId: lineItemId.substring(0, 12) + '...',
        currentQuantity: cart.items.find(i => i.id === lineItemId)?.quantity,
        newQuantity: quantity,
        convertedQuantity: quantityInHalfKg,
        cartId: cart.id.substring(0, 12) + '...',
        timestamp: new Date().toISOString()
      });

      const result = await medusa.updateCartItem(cart.id, lineItemId, quantityInHalfKg);

      console.log('✅ UPDATE RESPONSE:', {
        success: !!result?.cart,
        updatedQuantityRaw: result?.cart?.items.find(i => i.id === lineItemId)?.quantity,
        updatedQuantityKg: result?.cart?.items.find(i => i.id === lineItemId)?.quantity ? result.cart.items.find(i => i.id === lineItemId)!.quantity / 2 : 0,
        newSubtotal: result?.cart?.subtotal
      });

      if (result?.cart) {
        setRawCart(result.cart);
      }
    } catch (err) {
      setError('Failed to update item quantity');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [cart, removeFromCart]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Memoize itemCount calculation - count unique items, not total quantity
  const itemCount = useMemo(() =>
    cart?.items?.length || 0
    , [cart?.items]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    cart,
    isLoading,
    error,
    itemCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    refreshCart,
    clearError,
  }), [
    cart,
    isLoading,
    error,
    itemCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    refreshCart,
    clearError,
  ]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
