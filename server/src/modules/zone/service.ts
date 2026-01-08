import { MedusaService } from "@medusajs/framework/utils"
import Zone from "./models/zone"

class ZoneModuleService extends MedusaService({
    Zone,
}) {
    // Calculate distance between two coordinates using Haversine formula
    calculateDistance(
        lat1: number,
        lng1: number,
        lat2: number,
        lng2: number
    ): number {
        const R = 6371 // Earth's radius in kilometers
        const dLat = this.toRad(lat2 - lat1)
        const dLng = this.toRad(lng2 - lng1)

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) *
            Math.cos(this.toRad(lat2)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2)

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const distance = R * c

        return distance
    }

    private toRad(degrees: number): number {
        return (degrees * Math.PI) / 180
    }

    // Get zone by coordinates
    async getZoneByCoordinates(
        latitude: number,
        longitude: number
    ): Promise<any> {
        const zones = await this.listZones({
            is_active: true,
        })

        // Sort zones by radius (smallest first) to find the most specific zone
        const sortedZones = zones.sort((a, b) => a.radius_km - b.radius_km)

        // Calculate distance from center
        const centerLat = sortedZones[0]?.center_lat || 13.0827
        const centerLng = sortedZones[0]?.center_lng || 80.2707

        const distance = this.calculateDistance(
            centerLat,
            centerLng,
            latitude,
            longitude
        )

        // Find the smallest zone that contains the coordinates
        for (const zone of sortedZones) {
            if (distance <= zone.radius_km) {
                return zone
            }
        }

        return null // Outside all zones
    }

    // Validate minimum order for a zone
    validateMinimumOrder(
        zoneId: string,
        orderAmount: number
    ): { valid: boolean; minAmount?: number } {
        // This would be called with the zone object
        // Implementation will be in the API route
        return { valid: true }
    }
}

export default ZoneModuleService
