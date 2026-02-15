import { param, body } from "express-validator";

/**
 * Validator for order ID parameter (UUID)
 */
export const orderIdParamValidator = [
    param("id")
        .isUUID()
        .withMessage("Order ID must be a valid UUID"),
];

/**
 * Validator for creating a SELL order
 */
export const createSellOrderValidator = [
    body("listingId")
        .isUUID()
        .withMessage("Listing ID must be a valid UUID")
        .notEmpty()
        .withMessage("Listing ID is required"),
];

/**
 * Validator for order ID in status update
 */
export const orderStatusParamValidator = orderIdParamValidator;

/**
 * Validator for updating order status
 */
export const updateOrderStatusValidator = [
    body("status")
        .isString()
        .notEmpty()
        .withMessage("Status is required")
        .isIn([
            "PENDING",
            "NEGOTIATING",
            "APPROVED",
            "REJECTED",
            "PAYMENT_PENDING",
            "PAID",
            "COMPLETED",
            "CANCELLED",
        ])
        .withMessage("Invalid status value"),
];

/**
 * Validator for order ID in cancel
 */
export const orderCancelParamValidator = orderIdParamValidator;
