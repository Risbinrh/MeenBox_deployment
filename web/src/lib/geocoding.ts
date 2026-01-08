// Geocoding utility to convert address to coordinates
// Uses Google Maps Geocoding API or fallback to browser geolocation

interface GeocodeResult {
    latitude: number
    longitude: number
    formatted_address: string
}

/**
 * Convert address string to GPS coordinates using Google Maps Geocoding API
 * Requires NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in environment variables
 */
export async function geocodeAddress(
    address: string
): Promise<GeocodeResult | null> {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
        console.warn("Google Maps API key not configured. Using fallback.")
        return null
    }

    try {
        const encodedAddress = encodeURIComponent(address)
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`

        const response = await fetch(url)
        const data = await response.json()

        if (data.status === "OK" && data.results.length > 0) {
            const result = data.results[0]
            return {
                latitude: result.geometry.location.lat,
                longitude: result.geometry.location.lng,
                formatted_address: result.formatted_address,
            }
        } else {
            console.error("Geocoding failed:", data.status)
            return null
        }
    } catch (error) {
        console.error("Error geocoding address:", error)
        return null
    }
}

/**
 * Get user's current location using browser geolocation API
 */
export function getCurrentLocation(): Promise<GeocodeResult | null> {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            console.error("Geolocation not supported")
            resolve(null)
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    formatted_address: "Current Location",
                })
            },
            (error) => {
                console.error("Error getting location:", error)
                resolve(null)
            }
        )
    })
}

/**
 * Reverse geocode coordinates to address
 */
export async function reverseGeocode(
    latitude: number,
    longitude: number
): Promise<string | null> {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
        return null
    }

    try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`

        const response = await fetch(url)
        const data = await response.json()

        if (data.status === "OK" && data.results.length > 0) {
            return data.results[0].formatted_address
        }

        return null
    } catch (error) {
        console.error("Error reverse geocoding:", error)
        return null
    }
}
