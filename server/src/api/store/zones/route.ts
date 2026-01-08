import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import ZoneModuleService from "../../../modules/zone/service"
import { ZONE_MODULE } from "../../../modules/zone"

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    const zoneModuleService: ZoneModuleService = req.scope.resolve(ZONE_MODULE)

    const zones = await zoneModuleService.listZones({
        is_active: true,
    })

    res.json({
        zones,
    })
}
