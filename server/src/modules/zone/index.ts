import ZoneModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const ZONE_MODULE = "zone"

export default Module(ZONE_MODULE, {
    service: ZoneModuleService,
})
