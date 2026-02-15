import prisma from "../libs/database.js";

export default class OrderRepository {
    constructor(prismaClient = prisma) {
        this.prisma = prismaClient;
    }

    /**
     * Find order by ID
     * @param {string} orderId - Order ID
     * @returns {object|null} Order with relations
     */
    async findOrderById(orderId) {
        return this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                listing: true,
                buyer: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                            },
                        },
                    },
                },
                seller: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
    }

    /**
     * Find listing by ID
     * @param {string} listingId - Listing ID
     * @returns {object|null} Listing with owner
     */
    async findListingById(listingId) {
        return this.prisma.listing.findUnique({
            where: { id: listingId },
            include: {
                owner: true,
            },
        });
    }

    /**
     * Find student by user ID
     * @param {string} userId - User ID
     * @returns {object|null} Student record
     */
    async findStudentByUserId(userId) {
        return this.prisma.student.findUnique({
            where: { userId },
        });
    }

    /**
     * Find active orders for a buyer on a specific listing
     * @param {string} buyerId - Buyer student ID
     * @param {string} listingId - Listing ID
     * @returns {object[]} Active orders
     */
    async findActiveOrdersByBuyerAndListing(buyerId, listingId) {
        return this.prisma.order.findMany({
            where: {
                buyerId,
                listingId,
                status: {
                    in: ["PENDING", "NEGOTIATING", "APPROVED", "PAYMENT_PENDING"],
                },
            },
        });
    }

    /**
     * Find all orders for a buyer
     * @param {string} buyerId - Buyer student ID
     * @returns {object[]} Orders
     */
    async findOrdersByBuyer(buyerId) {
        return this.prisma.order.findMany({
            where: { buyerId },
            include: {
                listing: true,
                seller: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    /**
     * Find all orders for a seller
     * @param {string} sellerId - Seller student ID
     * @returns {object[]} Orders
     */
    async findOrdersBySeller(sellerId) {
        return this.prisma.order.findMany({
            where: { sellerId },
            include: {
                listing: true,
                buyer: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    /**
     * Create a new order
     * @param {object} data - Order data
     * @returns {object} Created order
     */
    async createOrder(data) {
        return this.prisma.order.create({
            data: {
                listingId: data.listingId,
                buyerId: data.buyerId,
                sellerId: data.sellerId,
                type: data.type,
                status: data.status,
                totalPrice: data.totalPrice,
            },
            include: {
                listing: true,
                buyer: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                            },
                        },
                    },
                },
                seller: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
    }

    /**
     * Update order status
     * @param {string} orderId - Order ID
     * @param {string} status - New status
     * @returns {object} Updated order
     */
    async updateOrderStatus(orderId, status) {
        return this.prisma.order.update({
            where: { id: orderId },
            data: { status },
            include: {
                listing: true,
                buyer: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                            },
                        },
                    },
                },
                seller: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
    }

    /**
     * Update listing availability
     * @param {string} listingId - Listing ID
     * @param {boolean} isAvailable - Availability status
     * @returns {object} Updated listing
     */
    async updateListingAvailability(listingId, isAvailable) {
        return this.prisma.listing.update({
            where: { id: listingId },
            data: { isAvailable },
        });
    }
}
