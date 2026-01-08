import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import crypto from "crypto"

interface VerifyPaymentBody {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
    cart_id?: string
}

export async function POST(
    req: MedusaRequest<VerifyPaymentBody>,
    res: MedusaResponse
): Promise<void> {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            cart_id,
        } = req.body

        // Validate required fields
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            res.status(400).json({
                error: "MISSING_FIELDS",
                message: "Missing required payment verification fields",
            })
            return
        }

        // Check if Razorpay secret is configured
        const secret = process.env.RAZORPAY_KEY_SECRET
        if (!secret) {
            res.status(500).json({
                error: "PAYMENT_NOT_CONFIGURED",
                message: "Razorpay secret not configured",
            })
            return
        }

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id
        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(body)
            .digest("hex")

        const isValid = expectedSignature === razorpay_signature

        if (!isValid) {
            res.status(400).json({
                error: "INVALID_SIGNATURE",
                message: "Payment verification failed - signature mismatch",
                verified: false,
            })
            return
        }

        // Payment verified successfully
        // Here you would typically:
        // 1. Update the cart/order status
        // 2. Create the order in Medusa
        // 3. Store payment details

        res.json({
            success: true,
            verified: true,
            payment: {
                order_id: razorpay_order_id,
                payment_id: razorpay_payment_id,
            },
            message: "Payment verified successfully",
        })
    } catch (error: any) {
        console.error("Payment verification failed:", error)
        res.status(500).json({
            error: "VERIFICATION_FAILED",
            message: error.message || "Failed to verify payment",
            verified: false,
        })
    }
}
