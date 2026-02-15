import {
    BadRequestError,
    NotFoundError,
    ForbiddenError,
} from "../errors/errors.js";
import {
    OrderStatus,
    validateStatusTransition,
    validateCancellation,
} from "../utils/OrderStateMachine.js";

export default class OrderService {
    /**
     * @param {import('../repositories/OrderRepository.js').default} orderRepository
     */
    constructor(orderRepository) {
        if (!orderRepository) {
            throw new Error("OrderRepository is required");
        }
        this.orderRepository = orderRepository;
    }

    /**
     * Create a new SELL order
     * @param {object} params - Order parameters
     * @param {string} params.listingId - Listing ID
     * @param {string} params.buyerUserId - Buyer user ID
     * @returns {object} Created order
     */
    async createSellOrder({ listingId, buyerUserId }) {
        // Get student profile for buyer
        const buyerStudent = await this.orderRepository.findStudentByUserId(buyerUserId);
        
        if (!buyerStudent) {
            throw new ForbiddenError("Only students can create orders");
        }

        if (!buyerStudent.isActive) {
            throw new ForbiddenError("Your student account is not active");
        }

        // Get listing
        const listing = await this.orderRepository.findListingById(listingId);
        
        if (!listing) {
            throw new NotFoundError("Listing not found");
        }

        // Check listing is available
        if (!listing.isAvailable) {
            throw new BadRequestError("Listing is not available");
        }

        // Check listing type allows SELL
        if (listing.listingType !== "SELL" && listing.listingType !== "BOTH") {
            throw new BadRequestError("Listing is not available for sale");
        }

        // Check buyer is not the seller
        if (listing.ownerId === buyerStudent.id) {
            throw new BadRequestError("You cannot buy your own listing");
        }

        // Check for duplicate active orders
        const existingOrders = await this.orderRepository.findActiveOrdersByBuyerAndListing(
            buyerStudent.id,
            listingId
        );

        if (existingOrders.length > 0) {
            throw new BadRequestError("You already have an active order for this listing");
        }

        // Create order with SELL type and PENDING status
        const order = await this.orderRepository.createOrder({
            listingId: listing.id,
            buyerId: buyerStudent.id,
            sellerId: listing.ownerId,
            type: "SELL",
            status: OrderStatus.PENDING,
            totalPrice: listing.price,
        });

        return this._formatOrderResponse(order);
    }

    /**
     * Get orders for a buyer
     * @param {string} buyerUserId - Buyer user ID
     * @returns {object[]} Orders
     */
    async getBuyerOrders(buyerUserId) {
        const buyerStudent = await this.orderRepository.findStudentByUserId(buyerUserId);
        
        if (!buyerStudent) {
            throw new ForbiddenError("Student profile not found");
        }

        const orders = await this.orderRepository.findOrdersByBuyer(buyerStudent.id);
        
        return orders.map((order) => this._formatOrderResponse(order));
    }

    /**
     * Get orders for a seller
     * @param {string} sellerUserId - Seller user ID
     * @returns {object[]} Orders
     */
    async getSellerOrders(sellerUserId) {
        const sellerStudent = await this.orderRepository.findStudentByUserId(sellerUserId);
        
        if (!sellerStudent) {
            throw new ForbiddenError("Student profile not found");
        }

        const orders = await this.orderRepository.findOrdersBySeller(sellerStudent.id);
        
        return orders.map((order) => this._formatOrderResponse(order));
    }

    /**
     * Update order status
     * @param {object} params - Parameters
     * @param {string} params.orderId - Order ID
     * @param {string} params.newStatus - New status
     * @param {string} params.userId - User ID making the change
     * @returns {object} Updated order
     */
    async updateOrderStatus({ orderId, newStatus, userId }) {
        // Get order
        const order = await this.orderRepository.findOrderById(orderId);
        
        if (!order) {
            throw new NotFoundError("Order not found");
        }

        // Get student profile for user
        const student = await this.orderRepository.findStudentByUserId(userId);
        
        if (!student) {
            throw new ForbiddenError("Student profile not found");
        }

        // Only seller can approve or reject (not buyer)
        const isSeller = order.sellerId === student.id;
        
        // Validate state transition
        validateStatusTransition(order.status, newStatus);

        // Business rule: Only seller can approve/reject
        if ((newStatus === OrderStatus.APPROVED || newStatus === OrderStatus.REJECTED) && !isSeller) {
            throw new ForbiddenError("Only the seller can approve or reject an order");
        }

        // Update order
        const updatedOrder = await this.orderRepository.updateOrderStatus(
            orderId,
            newStatus
        );

        // When order is COMPLETED, set listing to unavailable
        if (newStatus === OrderStatus.COMPLETED) {
            await this.orderRepository.updateListingAvailability(order.listingId, false);
        }

        return this._formatOrderResponse(updatedOrder);
    }

    /**
     * Cancel an order
     * @param {object} params - Parameters
     * @param {string} params.orderId - Order ID
     * @param {string} params.userId - User ID cancelling
     * @returns {object} Cancelled order
     */
    async cancelOrder({ orderId, userId }) {
        // Get order
        const order = await this.orderRepository.findOrderById(orderId);
        
        if (!order) {
            throw new NotFoundError("Order not found");
        }

        // Get student profile for user
        const student = await this.orderRepository.findStudentByUserId(userId);
        
        if (!student) {
            throw new ForbiddenError("Student profile not found");
        }

        // Validate cancellation is allowed
        validateCancellation(order.status);

        // Business rule: Buyer can cancel, seller can cancel (from pre-paid states)
        const isBuyer = order.buyerId === student.id;
        const isSeller = order.sellerId === student.id;

        if (!isBuyer && !isSeller) {
            throw new ForbiddenError("You can only cancel your own orders");
        }

        // Update order to CANCELLED
        const updatedOrder = await this.orderRepository.updateOrderStatus(
            orderId,
            OrderStatus.CANCELLED
        );

        return this._formatOrderResponse(updatedOrder);
    }

    /**
     * Format order response
     * @param {object} order - Order from database
     * @returns {object} Formatted order
     */
    _formatOrderResponse(order) {
        return {
            id: order.id,
            listingId: order.listingId,
            buyerId: order.buyerId,
            sellerId: order.sellerId,
            type: order.type,
            status: order.status,
            totalPrice: order.totalPrice,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            listing: order.listing ? {
                id: order.listing.id,
                title: order.listing.title,
                price: order.listing.price,
                listingType: order.listing.listingType,
                isAvailable: order.listing.isAvailable,
            } : undefined,
            buyer: order.buyer ? {
                id: order.buyer.id,
                userId: order.buyer.userId,
                user: order.buyer.user ? {
                    id: order.buyer.user.id,
                    email: order.buyer.user.email,
                } : undefined,
            } : undefined,
            seller: order.seller ? {
                id: order.seller.id,
                userId: order.seller.userId,
                user: order.seller.user ? {
                    id: order.seller.user.id,
                    email: order.seller.user.email,
                } : undefined,
            } : undefined,
        };
    }
}
