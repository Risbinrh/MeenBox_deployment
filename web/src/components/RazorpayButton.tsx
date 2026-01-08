'use client';

import { useState } from 'react';
import { useRazorpay } from '@/hooks/useRazorpay';

interface RazorpayButtonProps {
  amount: number; // Amount in paise
  cartId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  onSuccess: (paymentDetails: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function RazorpayButton({
  amount,
  cartId,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onError,
  disabled = false,
  className = '',
  children,
}: RazorpayButtonProps) {
  const { processPayment, isLoading, error } = useRazorpay();
  const [processing, setProcessing] = useState(false);

  const handleClick = async () => {
    if (disabled || processing) return;

    setProcessing(true);

    const result = await processPayment({
      amount,
      cartId,
      customerName,
      customerEmail,
      customerPhone,
      description: `FreshCatch Order - ₹${(amount / 100).toFixed(2)}`,
    });

    setProcessing(false);

    if (result.success && result.razorpay_order_id && result.razorpay_payment_id && result.razorpay_signature) {
      onSuccess({
        razorpay_order_id: result.razorpay_order_id,
        razorpay_payment_id: result.razorpay_payment_id,
        razorpay_signature: result.razorpay_signature,
      });
    } else if (result.error) {
      onError?.(result.error);
    }
  };

  const isDisabled = disabled || isLoading || processing;

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        w-full py-3 px-6 rounded-lg font-semibold text-white
        transition-all duration-200
        ${isDisabled
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-green-600 hover:bg-green-700 active:scale-[0.98]'
        }
        ${className}
      `}
    >
      {processing || isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Processing...
        </span>
      ) : (
        children || `Pay ₹${(amount / 100).toFixed(2)}`
      )}
    </button>
  );
}

// COD Button component
interface CODButtonProps {
  onConfirm: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function CODButton({
  onConfirm,
  disabled = false,
  className = '',
  children,
}: CODButtonProps) {
  const [processing, setProcessing] = useState(false);

  const handleClick = async () => {
    if (disabled || processing) return;
    setProcessing(true);

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 500));

    onConfirm();
    setProcessing(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || processing}
      className={`
        w-full py-3 px-6 rounded-lg font-semibold text-white
        transition-all duration-200
        ${disabled || processing
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-orange-600 hover:bg-orange-700 active:scale-[0.98]'
        }
        ${className}
      `}
    >
      {processing ? 'Processing...' : children || 'Place Order (Cash on Delivery)'}
    </button>
  );
}
