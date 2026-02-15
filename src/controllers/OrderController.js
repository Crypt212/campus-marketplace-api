import { matchedData } from "express-validator";
import OrderRepository from "../repositories/OrderRepository.js";
import OrderService from "../services/OrderService.js";
import { catchAsync } from "../utils/catchAsync.js";

// Create instances with dependency injection
const orderRepository = new OrderRepository();
const orderService = new OrderService(orderRepository);

/**
 * Format successful response
 */
const successResponse = (data, statusCode = 200) => ({
    status: "success",
    data,
});

/**
 * Create a new SELL order
 * POST /api/v1/orders/sell
 */
export const createSellOrder = catchAsync(async (req, res) => {
    const { listingId } = matchedData(req);
    const buyerUserId = req.user.id;

    const order = await orderService.createSellOrder({ listingId, buyerUserId });

    res.status(201).json(successResponse({ order }));
});

/**
 * Get orders for current buyer
 * GET /api/v1/orders/buyer
 */
export const getBuyerOrders = catchAsync(async (req, res) => {
    const buyerUserId = req.user.id;

    const orders = await orderService.getBuyerOrders(buyerUserId);

    res.status(200).json(successResponse({ orders }));
});

/**
 * Get orders for current seller
 * GET /api/v1/orders/seller
 */
export const getSellerOrders = catchAsync(async (req, res) => {
    const sellerUserId = req.user.id;

    const orders = await orderService.getSellerOrders(sellerUserId);

    res.status(200).json(successResponse({ orders }));
});

/**
 * Update order status
 * PATCH /api/v1/orders/:id/status
 */
export const updateOrderStatus = catchAsync(async (req, res) => {
    const { id } = matchedData(req);
    const { status } = matchedData(req);
    const userId = req.user.id;

    const order = await orderService.updateOrderStatus({
        orderId: id,
        newStatus: status,
        userId,
    });

    res.status(200).json(successResponse({ order }));
});

/**
 * Cancel an order
 * PATCH /api/v1/orders/:id/cancel
 */
export const cancelOrder = catchAsync(async (req, res) => {
    const { id } = matchedData(req);
    const userId = req.user.id;

    const order = await orderService.cancelOrder({ orderId: id, userId });

    res.status(200).json(successResponse({ order }));
});
