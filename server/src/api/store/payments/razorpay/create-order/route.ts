import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import Razorpay from "razorpay"

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "",
})

interface CreateOrderBody {
    amount: number      // Amount in paise
    currency?: string   // Default: INR
    receipt?: string    // Order receipt ID
    notes?: Record<string, string>
}

export async function POST(
    req: MedusaRequest<CreateOrderBody>,
    res: MedusaResponse
): Promise<void> {
    try {
        const { amount, currency = "INR", receipt, notes } = req.body

        // Validate amount
        if (!amount || amount < 100) {
            res.status(400).json({
                error: "INVALID_AMOUNT",
                message: "Amount must be at least 100 paise (₹1)",
            })
            return
        }

        // Check if Razorpay credentials are configured
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            res.status(500).json({
                error: "PAYMENT_NOT_CONFIGURED",
                message: "Razorpay credentials not configured",
            })
            return
        }

        // Create Razorpay order
        const options = {
            amount: amount, // Amount in paise
            currency: currency,
            receipt: receipt || `order_${Date.now()}`,
            notes: notes || {},
        }

        const order = await razorpay.orders.create(options)

        res.json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
                receipt: order.receipt,
                status: order.status,
            },
            key_id: process.env.RAZORPAY_KEY_ID, // Frontend needs this
        })
    } catch (error: any) {
        console.error("Razorpay order creation failed:", error)
        res.status(500).json({
            error: "ORDER_CREATION_FAILED",
            message: error.message || "Failed to create payment order",
        })
    }
}
