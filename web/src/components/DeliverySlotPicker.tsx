"use client"

import { useState } from "react"
import { DeliverySlot } from "@/types/zones"

interface DeliverySlotPickerProps {
    slots: DeliverySlot[]
    selectedSlot?: string
    onSlotSelect: (slotId: string) => void
}

export default function DeliverySlotPicker({
    slots,
    selectedSlot,
    onSlotSelect,
}: DeliverySlotPickerProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Delivery Time</h3>
            <div className="grid gap-3">
                {slots.map((slot) => (
                    <button
                        key={slot.id}
                        onClick={() => onSlotSelect(slot.id)}
                        className={`
              flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left
              ${selectedSlot === slot.id
                                ? "border-[#b18b5e] bg-[#b18b5e]/10 text-primary"
                                : "border-gray-200 hover:border-[#b18b5e]/50 hover:bg-[#b18b5e]/5"
                            }
            `}
                    >
                        <span className="text-3xl">{slot.icon}</span>
                        <div className="flex-1">
                            <div className="font-semibold text-gray-900">{slot.name}</div>
                            <div className="text-sm text-gray-600">{slot.name_tamil}</div>
                            <div className="text-sm font-medium text-[#b18b5e] mt-1">
                                {slot.time_range}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {slot.description}
                            </div>
                        </div>
                        {selectedSlot === slot.id && (
                            <div className="flex-shrink-0">
                                <svg
                                    className="w-6 h-6 text-[#b18b5e]"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}
