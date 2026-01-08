import { ExecArgs } from "@medusajs/framework/types"
import ZoneModuleService from "../modules/zone/service"

export default async function seedZones({ container }: ExecArgs) {
    const zoneModuleService = container.resolve("zone") as ZoneModuleService

    console.log("🗺️  Seeding delivery zones...")

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

    // Chennai center coordinates (default)
    const centerLat = 13.0827
    const centerLng = 80.2707

    const zones = [
        {
            zone_name: "Zone A - Primary",
            center_lat: centerLat,
            center_lng: centerLng,
            radius_km: 5,
            delivery_charge: 0, // Free delivery
            min_order_amount: 30000, // ₹300 in paise
            is_active: true,
            delivery_slots: deliverySlots,
        },
        {
            zone_name: "Zone B - Secondary",
            center_lat: centerLat,
            center_lng: centerLng,
            radius_km: 10,
            delivery_charge: 3000, // ₹30 in paise
            min_order_amount: 40000, // ₹400 in paise
            is_active: true,
            delivery_slots: deliverySlots,
        },
        {
            zone_name: "Zone C - Extended",
            center_lat: centerLat,
            center_lng: centerLng,
            radius_km: 15,
            delivery_charge: 5000, // ₹50 in paise
            min_order_amount: 50000, // ₹500 in paise
            is_active: true,
            delivery_slots: deliverySlots,
        },
        {
            zone_name: "Zone D - Outer",
            center_lat: centerLat,
            center_lng: centerLng,
            radius_km: 25,
            delivery_charge: 8000, // ₹80 in paise
            min_order_amount: 70000, // ₹700 in paise
            is_active: true,
            delivery_slots: deliverySlots,
        },
    ]

    for (const zoneData of zones) {
        const zone = await zoneModuleService.createZones(zoneData as any)
        console.log(`✅ Created ${zone.zone_name}`)
    }

    console.log("🎉 Zone seeding completed!")
    console.log("\n📍 Business Center: Chennai (13.0827° N, 80.2707° E)")
    console.log("\n🗺️  Delivery Zones:")
    console.log("  Zone A: 0-5 km   | Free delivery | Min order ₹300")
    console.log("  Zone B: 5-10 km  | ₹30 delivery  | Min order ₹400")
    console.log("  Zone C: 10-15 km | ₹50 delivery  | Min order ₹500")
    console.log("  Zone D: 15-25 km | ₹80 delivery  | Min order ₹700")
    console.log("\n⏰ Delivery Slots:")
    console.log("  🌅 Sunrise: 6:00 AM - 8:00 AM")
    console.log("  🌞 Morning: 8:00 AM - 12:00 PM")
    console.log("  🌆 Evening: 4:00 PM - 7:00 PM")
}
