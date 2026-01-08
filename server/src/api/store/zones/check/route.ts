import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import ZoneModuleService from "../../../../modules/zone/service"
import { ZONE_MODULE } from "../../../../modules/zone"

export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    const zoneModuleService: ZoneModuleService = req.scope.resolve(ZONE_MODULE)

    const { latitude, longitude } = req.body as {
        latitude: number
        longitude: number
    }

    if (!latitude || !longitude) {
        res.status(400).json({
            error: "Latitude and longitude are required",
        })
        return
    }

    const zone = await zoneModuleService.getZoneByCoordinates(latitude, longitude)

    if (!zone) {
        res.status(404).json({
            error: "Address is outside our delivery area",
            message: "We currently don't deliver to this location. Please try a different address.",
        })
        return
    }

    res.json({
        zone: {
            id: zone.id,
            zone_name: zone.zone_name,
            delivery_charge: zone.delivery_charge,
            min_order_amount: zone.min_order_amount,
            delivery_slots: zone.delivery_slots,
        },
    })
}
