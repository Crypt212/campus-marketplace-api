/**
 * Order State Machine
 * Defines valid state transitions for order status
 */
export const OrderStatus = {
    PENDING: "PENDING",
    NEGOTIATING: "NEGOTIATING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    PAYMENT_PENDING: "PAYMENT_PENDING",
    PAID: "PAID",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
};

/**
 * Define valid state transitions
 * Key: current status -> Value: array of allowed next statuses
 */
const validTransitions = {
    [OrderStatus.PENDING]: [OrderStatus.NEGOTIATING, OrderStatus.CANCELLED],
    [OrderStatus.NEGOTIATING]: [OrderStatus.APPROVED, OrderStatus.REJECTED, OrderStatus.CANCELLED],
    [OrderStatus.APPROVED]: [OrderStatus.PAYMENT_PENDING, OrderStatus.CANCELLED],
    [OrderStatus.PAYMENT_PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
    [OrderStatus.PAID]: [OrderStatus.COMPLETED],
    [OrderStatus.COMPLETED]: [],
    [OrderStatus.REJECTED]: [],
    [OrderStatus.CANCELLED]: [],
};

/**
 * Statuses that are considered "pre-paid" (can be cancelled)
 */
const cancellableStatuses = [
    OrderStatus.PENDING,
    OrderStatus.NEGOTIATING,
    OrderStatus.APPROVED,
    OrderStatus.PAYMENT_PENDING,
];

/**
 * Statuses that cannot be cancelled
 */
const nonCancellableStatuses = [
    OrderStatus.PAID,
    OrderStatus.COMPLETED,
    OrderStatus.REJECTED,
    OrderStatus.CANCELLED,
];

/**
 * Check if a status transition is valid
 * @param {string} currentStatus - Current order status
 * @param {string} newStatus - Desired new status
 * @returns {boolean} True if transition is valid
 */
export const isValidTransition = (currentStatus, newStatus) => {
    const allowedTransitions = validTransitions[currentStatus];
    return allowedTransitions ? allowedTransitions.includes(newStatus) : false;
};

/**
 * Get allowed transitions for a given status
 * @param {string} currentStatus - Current order status
 * @returns {string[]} Array of allowed next statuses
 */
export const getAllowedTransitions = (currentStatus) => {
    return validTransitions[currentStatus] || [];
};

/**
 * Check if an order can be cancelled from its current status
 * @param {string} currentStatus - Current order status
 * @returns {boolean} True if order can be cancelled
 */
export const canCancel = (currentStatus) => {
    return cancellableStatuses.includes(currentStatus);
};

/**
 * Check if an order cannot be cancelled from its current status
 * @param {string} currentStatus - Current order status
 * @returns {boolean} True if order cannot be cancelled
 */
export const cannotCancel = (currentStatus) => {
    return nonCancellableStatuses.includes(currentStatus);
};

/**
 * Check if the status is a pre-paid state (can be cancelled)
 * @param {string} status - Order status
 * @returns {boolean} True if status is pre-paid
 */
export const isPrePaidState = (status) => {
    return cancellableStatuses.includes(status);
};

/**
 * Validate status update and return error if invalid
 * @param {string} currentStatus - Current order status
 * @param {string} newStatus - Desired new status
 * @throws {Error} If transition is invalid
 */
export const validateStatusTransition = (currentStatus, newStatus) => {
    if (!isValidTransition(currentStatus, newStatus)) {
        const allowed = getAllowedTransitions(currentStatus);
        throw new Error(
            `Invalid status transition from ${currentStatus} to ${newStatus}. ` +
            `Allowed transitions: ${allowed.length > 0 ? allowed.join(", ") : "none"}`
        );
    }
};

/**
 * Validate cancellation and return error if invalid
 * @param {string} currentStatus - Current order status
 * @throws {Error} If cancellation is not allowed
 */
export const validateCancellation = (currentStatus) => {
    if (cannotCancel(currentStatus)) {
        throw new Error(
            `Cannot cancel order with status ${currentStatus}. ` +
            "Orders that are PAID, COMPLETED, REJECTED, or already CANCELLED cannot be cancelled."
        );
    }
};
