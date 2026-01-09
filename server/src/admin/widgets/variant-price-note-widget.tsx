import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Alert } from "@medusajs/ui"

const VariantPriceNoteWidget = () => {
    return (
        <Container className="mb-4">
            <Alert variant="info">
                <div>
                    <p className="text-ui-fg-base font-medium">
                        💡 Price Entry Guide
                    </p>
                    <p className="text-ui-fg-subtle text-sm mt-1">
                        Enter prices in <strong>paisa</strong> (smallest currency unit)
                    </p>
                    <div className="text-ui-fg-subtle text-sm mt-2 space-y-1">
                        <p>• ₹1.00 = 100 paisa</p>
                        <p>• ₹10.00 = 1000 paisa</p>
                        <p>• ₹299.99 = 29999 paisa</p>
                    </div>
                </div>
            </Alert>
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "product.details.after",
})

export default VariantPriceNoteWidget
