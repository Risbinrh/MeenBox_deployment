"use client"

import { useState } from "react"
import DeliverySlotPicker from "@/components/DeliverySlotPicker"
import DeliveryChargeDisplay from "@/components/DeliveryChargeDisplay"
import { checkZone } from "@/lib/api/zones"
import { DeliverySlot, ZoneCheckResponse } from "@/types/zones"
import { geocodeAddress, getCurrentLocation, reverseGeocode } from "@/lib/geocoding"

export default function ZoneDeliveryDemoPage() {
    const [address, setAddress] = useState<string>("")
    const [zoneData, setZoneData] = useState<ZoneCheckResponse | null>(null)
    const [deliverySlots, setDeliverySlots] = useState<DeliverySlot[]>([])
    const [selectedSlot, setSelectedSlot] = useState<string>("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string>("")
    const [detectedLocation, setDetectedLocation] = useState<string>("")

    // Mock cart total (in paise)
    const [cartTotal] = useState(35000) // ₹350

    const handleCheckZone = async () => {
        if (!address.trim()) {
            setError("Please enter your delivery address")
            return
        }

        setLoading(true)
        setError("")
        setDetectedLocation("")

        // Geocode the address to get coordinates
        const geocodeResult = await geocodeAddress(address)

        if (!geocodeResult) {
            setError("Could not find this address. Please check and try again.")
            setLoading(false)
            return
        }

        setDetectedLocation(geocodeResult.formatted_address)

        // Check zone with the coordinates
        const result = await checkZone(
            geocodeResult.latitude,
            geocodeResult.longitude
        )

        if (result) {
            setZoneData(result)
            setDeliverySlots(result.zone.delivery_slots)
        } else {
            setError("Sorry, we don't deliver to this area yet.")
            setZoneData(null)
        }

        setLoading(false)
    }

    const handleUseCurrentLocation = async () => {
        setLoading(true)
        setError("")

        // Get current location from browser
        const location = await getCurrentLocation()

        if (!location) {
            setError("Could not get your location. Please enable location access.")
            setLoading(false)
            return
        }

        // Reverse geocode to get readable address (requires Google Maps API key)
        const reverseGeocoded = await reverseGeocode(
            location.latitude,
            location.longitude
        )

        if (!reverseGeocoded) {
            setError("Google Maps API key is required to auto-fill address. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file.")
            setLoading(false)
            return
        }

        // Set the address field with the reverse geocoded address
        setAddress(reverseGeocoded)
        setDetectedLocation(reverseGeocoded)

        // Check zone with the coordinates
        const result = await checkZone(location.latitude, location.longitude)

        if (result) {
            setZoneData(result)
            setDeliverySlots(result.zone.delivery_slots)
        } else {
            setError("Sorry, we don't deliver to your current location.")
            setZoneData(null)
        }

        setLoading(false)
    }

    const testAddress = async (testAddr: string) => {
        setAddress(testAddr)
        setLoading(true)
        setError("")

        const geocodeResult = await geocodeAddress(testAddr)

        if (geocodeResult) {
            setDetectedLocation(geocodeResult.formatted_address)
            const result = await checkZone(
                geocodeResult.latitude,
                geocodeResult.longitude
            )

            if (result) {
                setZoneData(result)
                setDeliverySlots(result.zone.delivery_slots)
            }
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-white py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Zone-Based Delivery Demo
                </h1>
                <p className="text-gray-600 mb-8">
                    Enter your delivery address to check zone and delivery charges
                </p>

                <div className="grid gap-6">
                    {/* Address Input Section */}
                    <div className="bg-white rounded-xs shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            1. Enter Your Delivery Address
                        </h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Enter your complete address including area, city, and pincode
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Delivery Address
                                </label>
                                <textarea
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b18b5e] resize-none"
                                    placeholder="e.g., 123 Anna Salai, T Nagar, Chennai, Tamil Nadu 600017"
                                    rows={3}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault()
                                            handleCheckZone()
                                        }
                                    }}
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleCheckZone}
                                    disabled={loading}
                                    className="flex-1 bg-[#b18b5e] text-white py-2 px-4 rounded-md hover:bg-[#8c6b42] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                                >
                                    {loading ? "Checking..." : "Check Delivery Zone"}
                                </button>
                                <button
                                    onClick={handleUseCurrentLocation}
                                    disabled={loading}
                                    className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                    Use My Location
                                </button>
                            </div>

                            {detectedLocation && (
                                <div className="bg-[#b18b5e]/10 border border-[#b18b5e]/20 rounded-md p-3">
                                    <p className="text-sm text-[#b18b5e]">
                                        <strong>📍 Detected:</strong> {detectedLocation}
                                    </p>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Zone Info & Delivery Charge */}
                    {zoneData && (
                        <div className="bg-white rounded-xs shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">
                                2. Delivery Information
                            </h2>
                            <DeliveryChargeDisplay
                                zoneName={zoneData.zone.zone_name}
                                deliveryCharge={zoneData.zone.delivery_charge}
                                minOrderAmount={zoneData.zone.min_order_amount}
                                currentCartTotal={cartTotal}
                            />
                            <div className="mt-4 text-sm text-gray-600">
                                <p>Current cart total: ₹{(cartTotal / 100).toFixed(0)}</p>
                            </div>
                        </div>
                    )}

                    {/* Delivery Slot Picker */}
                    {zoneData && deliverySlots.length > 0 && (
                        <div className="bg-white rounded-xs shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">
                                3. Select Delivery Time
                            </h2>
                            <DeliverySlotPicker
                                slots={deliverySlots}
                                selectedSlot={selectedSlot}
                                onSlotSelect={setSelectedSlot}
                            />
                        </div>
                    )}

                    {/* Order Summary */}
                    {zoneData && selectedSlot && (
                        <div className="bg-white rounded-xs shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">₹{(cartTotal / 100).toFixed(0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Delivery Charge</span>
                                    <span className="font-medium">
                                        {zoneData.zone.delivery_charge === 0
                                            ? "FREE"
                                            : `₹${(zoneData.zone.delivery_charge / 100).toFixed(0)}`}
                                    </span>
                                </div>
                                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span>
                                        ₹{((cartTotal + zoneData.zone.delivery_charge) / 100).toFixed(0)}
                                    </span>
                                </div>
                            </div>

                            <button
                                disabled={cartTotal < zoneData.zone.min_order_amount}
                                className="w-full mt-6 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
                            >
                                {cartTotal < zoneData.zone.min_order_amount
                                    ? "Minimum Order Not Met"
                                    : "Place Order"}
                            </button>
                        </div>
                    )}

                    {/* Test Addresses Helper */}
                    <div className="bg-[#b18b5e]/10 border border-[#b18b5e]/20 rounded-xs p-4">
                        <h3 className="font-semibold text-[#3d2b1f] mb-2">
                            🧪 Test with Sample Chennai Addresses
                        </h3>
                        <p className="text-sm text-[#8c6b42] mb-3">
                            Try these addresses to test different delivery zones:
                        </p>
                        <div className="grid gap-2 text-sm">
                            <button
                                onClick={() => testAddress("Anna Salai, Chennai, Tamil Nadu")}
                                className="bg-white border border-[#b18b5e]/30 rounded px-3 py-2 hover:bg-[#b18b5e]/10 text-left"
                            >
                                <div className="font-medium">Zone A - City Center</div>
                                <div className="text-xs text-gray-600">Anna Salai, Chennai</div>
                            </button>
                            <button
                                onClick={() => testAddress("Adyar, Chennai, Tamil Nadu")}
                                className="bg-white border border-[#b18b5e]/30 rounded px-3 py-2 hover:bg-[#b18b5e]/10 text-left"
                            >
                                <div className="font-medium">Zone B - Adyar</div>
                                <div className="text-xs text-gray-600">Adyar, Chennai</div>
                            </button>
                            <button
                                onClick={() => testAddress("Velachery, Chennai, Tamil Nadu")}
                                className="bg-white border border-[#b18b5e]/30 rounded px-3 py-2 hover:bg-[#b18b5e]/10 text-left"
                            >
                                <div className="font-medium">Zone C - Velachery</div>
                                <div className="text-xs text-gray-600">Velachery, Chennai</div>
                            </button>
                            <button
                                onClick={() => testAddress("Tambaram, Chennai, Tamil Nadu")}
                                className="bg-white border border-[#b18b5e]/30 rounded px-3 py-2 hover:bg-[#b18b5e]/10 text-left"
                            >
                                <div className="font-medium">Zone D - Tambaram</div>
                                <div className="text-xs text-gray-600">Tambaram, Chennai</div>
                            </button>
                        </div>

                        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-3">
                            <p className="text-xs text-yellow-800">
                                <strong>⚠️ Note:</strong> Geocoding requires Google Maps API key.
                                Add <code className="bg-yellow-100 px-1">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your <code className="bg-yellow-100 px-1">.env.local</code> file.
                                Without it, you can still use the "Use My Location" button if you allow browser location access.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
