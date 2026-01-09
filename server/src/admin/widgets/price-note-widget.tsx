import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Alert } from "@medusajs/ui"

const PriceNoteWidget = () => {
    return (
        <Container className="mb-4">
            <Alert variant="info">
                <div>
                    <p className="text-ui-fg-base font-medium">
                        Note: Product prices are calculated in paisa
                    </p>
                    <p className="text-ui-fg-subtle text-sm mt-1">
                        Enter prices in paisa (smallest currency unit). For example: ₹299.99 = 29999 paisa
                    </p>
                </div>
            </Alert>
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "product.details.before",
})

export default PriceNoteWidget
