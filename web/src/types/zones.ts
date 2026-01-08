export interface Zone {
    id: string
    zone_name: string
    center_lat: number
    center_lng: number
    radius_km: number
    delivery_charge: number // in paise
    min_order_amount: number // in paise
    is_active: boolean
    delivery_slots: DeliverySlot[]
}

export interface DeliverySlot {
    id: string
    name: string
    name_tamil: string
    time_range: string
    icon: string
    description: string
}

export interface ZoneCheckResponse {
    zone: {
        id: string
        zone_name: string
        delivery_charge: number
        min_order_amount: number
        delivery_slots: DeliverySlot[]
    }
}

export interface ZoneCheckError {
    error: string
    message: string
}
