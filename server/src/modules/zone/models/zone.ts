import { model } from "@medusajs/framework/utils"

const Zone = model.define("zone", {
    id: model.id().primaryKey(),
    zone_name: model.text(),
    center_lat: model.number(),
    center_lng: model.number(),
    radius_km: model.number(),
    delivery_charge: model.number(), // in paise
    min_order_amount: model.number(), // in paise
    is_active: model.boolean().default(true),
    delivery_slots: model.json(),
})

export default Zone
