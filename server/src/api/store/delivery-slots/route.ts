import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import ZoneModuleService from "../../../modules/zone/service"
import { ZONE_MODULE } from "../../../modules/zone"

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    const zoneModuleService: ZoneModuleService = req.scope.resolve(ZONE_MODULE)
    const { zoneId } = req.query as { zoneId?: string }

    // Default delivery slots
    const deliverySlots = [
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
    ]

    // If zoneId is provided, get zone-specific slots
    if (zoneId) {
        const zone = await zoneModuleService.retrieveZone(zoneId)
        if (zone && zone.delivery_slots) {
            res.json({
                delivery_slots: zone.delivery_slots,
            })
            return
        }
    }

    // Return default slots
    res.json({
        delivery_slots: deliverySlots,
    })
}
