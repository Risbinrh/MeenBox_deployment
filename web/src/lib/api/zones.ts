import { ZoneCheckResponse, DeliverySlot } from "@/types/zones"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

export async function checkZone(
    latitude: number,
    longitude: number
): Promise<ZoneCheckResponse | null> {
    try {
        const response = await fetch(`${BACKEND_URL}/store/zones/check`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-publishable-api-key": API_KEY,
            },
            body: JSON.stringify({ latitude, longitude }),
        })

        if (!response.ok) {
            const error = await response.json()
            console.error("Zone check failed:", error)
            return null
        }

        return await response.json()
    } catch (error) {
        console.error("Error checking zone:", error)
        return null
    }
}

export async function getDeliverySlots(
    zoneId?: string
): Promise<{ delivery_slots: DeliverySlot[] }> {
    try {
        const url = zoneId
            ? `${BACKEND_URL}/store/delivery-slots?zoneId=${zoneId}`
            : `${BACKEND_URL}/store/delivery-slots`

        const response = await fetch(url, {
            headers: {
                "x-publishable-api-key": API_KEY,
            },
        })

        if (!response.ok) {
            throw new Error("Failed to fetch delivery slots")
        }

        return await response.json()
    } catch (error) {
        console.error("Error fetching delivery slots:", error)
        // Return default slots on error
        return {
            delivery_slots: [
                {
                    id: "sunrise",
                    name: "Sunrise Delivery",
                    name_tamil: "விடியற்காலை டெலிவரி",
                    time_range: "6:00 AM - 8:00 AM",
                    icon: "🌅",
                    description: "Perfect for early morning cooking",
                },
                {
                    id: "morning",
                    name: "Morning Delivery",
                    name_tamil: "காலை டெலிவரி",
                    time_range: "8:00 AM - 12:00 PM",
                    icon: "🌞",
                    description: "Standard morning delivery",
                },
                {
                    id: "evening",
                    name: "Evening Delivery",
                    name_tamil: "மாலை டெலிவரி",
                    time_range: "4:00 PM - 7:00 PM",
                    icon: "🌆",
                    description: "Evening delivery for dinner prep",
                },
            ],
        }
    }
}

export function formatCurrency(amountInPaise: number): string {
    return `₹${(amountInPaise / 100).toFixed(0)}`
}
