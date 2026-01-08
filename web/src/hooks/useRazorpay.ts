'use client';

import { useState, useCallback } from 'react';

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
}

interface PaymentResult {
  success: boolean;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  error?: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: any) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
      close: () => void;
    };
  }
}

export function useRazorpay() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Razorpay script dynamically
  const loadRazorpayScript = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  // Create Razorpay order
  const createOrder = useCallback(async (
    amount: number, // Amount in paise
    receipt?: string,
    notes?: Record<string, string>
  ): Promise<{ order: RazorpayOrder; key_id: string } | null> => {
    try {
      const response = await fetch('/api/store/payments/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, receipt, notes }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order');
      }

      return { order: data.order, key_id: data.key_id };
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, []);

  // Verify payment
  const verifyPayment = useCallback(async (
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string,
    cart_id?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/store/payments/razorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          cart_id,
        }),
      });

      const data = await response.json();
      return data.verified === true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, []);

  // Main payment function
  const processPayment = useCallback(async (options: {
    amount: number; // Amount in paise
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    cartId?: string;
    description?: string;
  }): Promise<PaymentResult> => {
    setIsLoading(true);
    setError(null);

    try {
      // Load Razorpay script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Create order
      const orderResult = await createOrder(
        options.amount,
        `cart_${options.cartId || Date.now()}`,
        { cart_id: options.cartId || '' }
      );

      if (!orderResult) {
        throw new Error('Failed to create payment order');
      }

      const { order, key_id } = orderResult;

      // Open Razorpay checkout
      return new Promise((resolve) => {
        const razorpayOptions: RazorpayOptions = {
          key: key_id,
          amount: order.amount,
          currency: order.currency,
          name: 'FreshCatch',
          description: options.description || 'Fresh Fish Order',
          order_id: order.id,
          prefill: {
            name: options.customerName,
            email: options.customerEmail,
            contact: options.customerPhone,
          },
          theme: {
            color: '#0066cc',
          },
          handler: async (response) => {
            // Verify payment
            const verified = await verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              options.cartId
            );

            if (verified) {
              resolve({
                success: true,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
            } else {
              resolve({
                success: false,
                error: 'Payment verification failed',
              });
            }
          },
          modal: {
            ondismiss: () => {
              resolve({
                success: false,
                error: 'Payment cancelled by user',
              });
            },
          },
        };

        const razorpay = new window.Razorpay(razorpayOptions);
        razorpay.open();
      });
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [loadRazorpayScript, createOrder, verifyPayment]);

  return {
    processPayment,
    isLoading,
    error,
  };
}
