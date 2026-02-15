import prisma from "../libs/database.js";

export default class ListingRepository {
    constructor(prismaClient = prisma) {
        this.prisma = prismaClient;
    }

    /**
     * Create a new listing
     * @param {object} data - Listing data
     * @returns {object} Created listing
     */
    async create(data) {
        return this.prisma.listing.create({
            data: {
                ownerId: data.ownerId,
                title: data.title,
                description: data.description,
                category: data.category,
                price: data.price,
                listingType: data.listingType,
                condition: data.condition,
                isAvailable: data.isAvailable ?? true,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        universityEmail: true,
                        grade: true,
                        department: true,
                        ratingAverage: true,
                        ratingCount: true,
                    },
                },
            },
        });
    }

    /**
     * Find listing by ID
     * @param {string} id - Listing ID
     * @returns {object|null} Listing with owner info
     */
    async findById(id) {
        return this.prisma.listing.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        id: true,
                        universityEmail: true,
                        grade: true,
                        department: true,
                        ratingAverage: true,
                        ratingCount: true,
                        user: {
                            select: {
                                email: true,
                            },
                        },
                    },
                },
                reviews: {
                    select: {
                        rating: true,
                    },
                    take: 100, // Limit for performance
                },
            },
        });
    }

    /**
     * Find listing by ID for update/delete operations
     * @param {string} id - Listing ID
     * @returns {object|null} Listing
     */
    async findByIdForUpdate(id) {
        return this.prisma.listing.findUnique({
            where: { id },
            include: {
                orders: {
                    where: {
                        status: {
                            in: ["PENDING", "NEGOTIATING", "APPROVED", "PAYMENT_PENDING", "PAID", "ACTIVE"],
                        },
                    },
                    select: {
                        id: true,
                        status: true,
                    },
                },
            },
        });
    }

    /**
     * Check if listing belongs to user
     * @param {string} listingId - Listing ID
     * @param {string} ownerId - Owner ID
     * @returns {object|null} Listing if owned by user
     */
    async findByIdAndOwner(listingId, ownerId) {
        return this.prisma.listing.findFirst({
            where: {
                id: listingId,
                ownerId: ownerId,
            },
        });
    }

    /**
     * Update a listing
     * @param {string} id - Listing ID
     * @param {object} data - Update data
     * @returns {object} Updated listing
     */
    async update(id, data) {
        const updateData = {};
        
        if (data.title !== undefined) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.category !== undefined) updateData.category = data.category;
        if (data.price !== undefined) updateData.price = data.price;
        if (data.listingType !== undefined) updateData.listingType = data.listingType;
        if (data.condition !== undefined) updateData.condition = data.condition;
        if (data.isAvailable !== undefined) updateData.isAvailable = data.isAvailable;

        return this.prisma.listing.update({
            where: { id },
            data: updateData,
            include: {
                owner: {
                    select: {
                        id: true,
                        universityEmail: true,
                        grade: true,
                        department: true,
                        ratingAverage: true,
                        ratingCount: true,
                    },
                },
            },
        });
    }

    /**
     * Soft delete a listing (set isAvailable to false)
     * @param {string} id - Listing ID
     * @returns {object} Updated listing
     */
    async softDelete(id) {
        return this.prisma.listing.update({
            where: { id },
            data: { isAvailable: false },
        });
    }

    /**
     * Get listings with filters, sorting, and pagination
     * @param {object} params - Query parameters
     * @returns {object} Listings and pagination info
     */
    async findAll(params) {
        const {
            page = 1,
            limit = 10,
            category,
            listingType,
            minPrice,
            maxPrice,
            grade,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = params;

        // Build where clause
        const where = {
            isAvailable: true, // Only show available listings
        };

        // Category filter
        if (category) {
            where.category = category;
        }

        // Listing type filter
        if (listingType) {
            where.listingType = listingType;
        }

        // Price range filter
        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            if (minPrice !== undefined) {
                where.price.gte = minPrice;
            }
            if (maxPrice !== undefined) {
                where.price.lte = maxPrice;
            }
        }

        // Build include for grade filtering (need to join with owner)
        const include = {
            owner: {
                select: {
                    id: true,
                    universityEmail: true,
                    grade: true,
                    department: true,
                    ratingAverage: true,
                    ratingCount: true,
                },
            },
            _count: {
                select: {
                    reviews: true,
                },
            },
        };

        // Build orderBy
        const orderBy = {};
        
        // Handle special sorting cases
        if (sortBy === "rating") {
            // Sort by owner's rating (stored in ratingAverage)
            orderBy.owner = {
                ratingAverage: sortOrder,
            };
        } else {
            orderBy[sortBy] = sortOrder;
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Execute queries in parallel for better performance
        const [listings, totalCount] = await Promise.all([
            this.prisma.listing.findMany({
                where,
                include,
                orderBy,
                skip,
                take: limit,
            }),
            this.prisma.listing.count({ where }),
        ]);

        // Filter by grade in memory (since it's on related model)
        let filteredListings = listings;
        if (grade) {
            filteredListings = listings.filter(
                (listing) => listing.owner.grade === grade
            );
        }

        return {
            items: filteredListings,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
        };
    }

    /**
     * Get all listings owned by a student
     * @param {string} ownerId - Owner ID
     * @returns {object} Listings and count info
     */
    async findByOwner(ownerId) {
        const [listings, totalCount, activeCount] = await Promise.all([
            this.prisma.listing.findMany({
                where: { ownerId },
                include: {
                    _count: {
                        select: {
                            reviews: true,
                            orders: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            }),
            this.prisma.listing.count({ where: { ownerId } }),
            this.prisma.listing.count({
                where: { ownerId, isAvailable: true },
            }),
        ]);

        return {
            items: listings,
            totalCount,
            activeCount,
        };
    }

    /**
     * Get all unique categories
     * @returns {string[]} List of categories
     */
    async getCategories() {
        const result = await this.prisma.listing.findMany({
            where: { isAvailable: true },
            select: { category: true },
            distinct: ["category"],
        });
        return result.map((r) => r.category);
    }

    /**
     * Check if listing has active orders
     * @param {string} listingId - Listing ID
     * @returns {boolean} True if has active orders
     */
    async hasActiveOrders(listingId) {
        const count = await this.prisma.order.count({
            where: {
                listingId,
                status: {
                    in: ["PENDING", "NEGOTIATING", "APPROVED", "PAYMENT_PENDING", "PAID", "ACTIVE"],
                },
            },
        });
        return count > 0;
    }
}
