import { Router } from "express";
import {
    createSellOrder,
    getBuyerOrders,
    getSellerOrders,
    updateOrderStatus,
    cancelOrder,
} from "../controllers/OrderController.js";
import validate from "../validators/validate.js";
import {
    createSellOrderValidator,
    orderStatusParamValidator,
    updateOrderStatusValidator,
    orderCancelParamValidator,
} from "../validators/orderValidators.js";
import { authenticate, requireStudent } from "../middlewares/authMiddleware.js";

const orderRouter = Router();

// Apply authentication to all routes
orderRouter.use(authenticate);

/**
 * POST /api/v1/orders/sell
 * Create a new SELL order
 * Requires: STUDENT role (verified via requireStudent)
 */
orderRouter.post(
    "/sell",
    requireStudent,
    createSellOrderValidator,
    validate,
    createSellOrder
);

/**
 * GET /api/v1/orders/buyer
 * Get orders where current user is the buyer
 * Requires: STUDENT role
 */
orderRouter.get(
    "/buyer",
    requireStudent,
    getBuyerOrders
);

/**
 * GET /api/v1/orders/seller
 * Get orders where current user is the seller
 * Requires: STUDENT role
 */
orderRouter.get(
    "/seller",
    requireStudent,
    getSellerOrders
);

/**
 * PATCH /api/v1/orders/:id/status
 * Update order status
 * Requires: STUDENT role
 */
orderRouter.patch(
    "/:id/status",
    requireStudent,
    orderStatusParamValidator,
    updateOrderStatusValidator,
    validate,
    updateOrderStatus
);

/**
 * PATCH /api/v1/orders/:id/cancel
 * Cancel an order
 * Requires: STUDENT role
 */
orderRouter.patch(
    "/:id/cancel",
    requireStudent,
    orderCancelParamValidator,
    validate,
    cancelOrder
);

export default orderRouter;
