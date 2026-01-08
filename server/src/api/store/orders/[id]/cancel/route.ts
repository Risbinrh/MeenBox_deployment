import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { cancelOrderWorkflow } from "@medusajs/medusa/core-flows"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params

  try {
    // Get the order module service
    const orderModuleService = req.scope.resolve(Modules.ORDER)

    // Get the order first to check its status
    const order = await orderModuleService.retrieveOrder(id)

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      })
    }

    // Check if already cancelled (Medusa uses "canceled" spelling)
    if (order.status === "canceled") {
      return res.status(400).json({
        message: "Order is already cancelled",
      })
    }

    // Check if order is completed (delivered)
    if (order.status === "completed") {
      return res.status(400).json({
        message: "Cannot cancel a completed order",
      })
    }

    // Cancel the order using the workflow
    const { result } = await cancelOrderWorkflow(req.scope).run({
      input: {
        order_id: id,
      },
    })

    return res.status(200).json({
      order: {
        id: id,
        status: "canceled",
      },
    })
  } catch (error) {
    console.error("Failed to cancel order:", error)
    return res.status(500).json({
      message: "Failed to cancel order",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
