import { BadRequestError, ForbiddenError, NotFoundError } from "../errors/errors.js";

export default class ListingService {
    /**
     * @param {import('../repositories/ListingRepository.js').default} listingRepository
     */
    constructor(listingRepository) {
        if (!listingRepository) {
            throw new Error("ListingRepository is required");
        }
        this.listingRepository = listingRepository;
    }

    /**
     * Create a new listing
     * @param {object} params - Create parameters
     * @param {string} params.ownerId - Owner ID (from authenticated user)
     * @param {string} params.title - Listing title
     * @param {string} params.description - Listing description
     * @param {string} params.category - Listing category
     * @param {number} params.price - Listing price
     * @param {string} params.listingType - Listing type (SELL, RENT, BOTH)
     * @param {string} params.condition - Item condition
     * @returns {object} Created listing
     */
    async create({ ownerId, title, description, category, price, listingType, condition }) {
        // Validate required fields
        if (!ownerId) {
            throw new BadRequestError("Owner ID is required");
        }

        const listing = await this.listingRepository.create({
            ownerId,
            title,
            description,
            category,
            price,
            listingType,
            condition,
            isAvailable: true,
        });

        return this._formatListingResponse(listing);
    }

    /**
     * Get a single listing by ID
     * @param {string} id - Listing ID
     * @returns {object} Listing with owner info and rating summary
     */
    async getById(id) {
        const listing = await this.listingRepository.findById(id);

        if (!listing) {
            throw new NotFoundError("Listing not found");
        }

        // Check if listing is available
        if (!listing.isAvailable) {
            throw new NotFoundError("Listing not found");
        }

        // Calculate rating summary from reviews
        const ratingSummary = this._calculateRatingSummary(listing.reviews);

        return this._formatPublicListingResponse(listing, ratingSummary);
    }

    /**
     * Update a listing
     * @param {object} params - Update parameters
     * @param {string} params.listingId - Listing ID
     * @param {string} params.ownerId - Owner ID (from authenticated user)
     * @param {object} params.updateData - Data to update
     * @returns {object} Updated listing
     */
    async update({ listingId, ownerId, updateData }) {
        // Check if listing exists and belongs to user
        const existingListing = await this.listingRepository.findByIdAndOwner(listingId, ownerId);

        if (!existingListing) {
            throw new NotFoundError("Listing not found");
        }

        // Check if listing has active orders
        const hasActiveOrders = await this.listingRepository.hasActiveOrders(listingId);

        if (hasActiveOrders) {
            throw new BadRequestError("Cannot update listing with active orders");
        }

        const updatedListing = await this.listingRepository.update(listingId, updateData);

        return this._formatListingResponse(updatedListing);
    }

    /**
     * Delete a listing (soft delete)
     * @param {object} params - Delete parameters
     * @param {string} params.listingId - Listing ID
     * @param {string} params.ownerId - Owner ID (from authenticated user)
     * @returns {object} Success message
     */
    async delete({ listingId, ownerId }) {
        // Check if listing exists and belongs to user
        const existingListing = await this.listingRepository.findByIdAndOwner(listingId, ownerId);

        if (!existingListing) {
            throw new NotFoundError("Listing not found");
        }

        // Soft delete - set isAvailable to false
        await this.listingRepository.softDelete(listingId);

        return { message: "Listing deleted successfully" };
    }

    /**
     * Browse listings with filters, sorting, and pagination
     * @param {object} params - Query parameters
     * @returns {object} Paginated listings
     */
    async browse(params) {
        const result = await this.listingRepository.findAll(params);

        // Format each listing
        const formattedItems = result.items.map((listing) => 
            this._formatPublicListingResponse(listing, {
                averageRating: listing.owner.ratingAverage || 0,
                reviewCount: listing._count?.reviews || 0,
            })
        );

        return {
            items: formattedItems,
            meta: {
                totalCount: result.totalCount,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
            },
        };
    }

    /**
     * Get all listings owned by current student
     * @param {string} ownerId - Owner ID
     * @returns {object} Student's listings
     */
    async getMyInventory(ownerId) {
        const result = await this.listingRepository.findByOwner(ownerId);

        // Format each listing
        const formattedItems = result.items.map((listing) => 
            this._formatInventoryListingResponse(listing)
        );

        return {
            items: formattedItems,
            meta: {
                totalCount: result.totalCount,
                activeCount: result.activeCount,
            },
        };
    }

    /**
     * Get all available categories
     * @returns {string[]} List of categories
     */
    async getCategories() {
        return this.listingRepository.getCategories();
    }

    /**
     * Calculate rating summary from reviews
     * @param {Array} reviews - Array of reviews
     * @returns {object} Rating summary
     */
    _calculateRatingSummary(reviews) {
        if (!reviews || reviews.length === 0) {
            return {
                averageRating: 0,
                reviewCount: 0,
            };
        }

        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;

        return {
            averageRating: Math.round(averageRating * 10) / 10,
            reviewCount: reviews.length,
        };
    }

    /**
     * Format listing response for owner operations
     * @param {object} listing - Listing from database
     * @returns {object} Formatted listing
     */
    _formatListingResponse(listing) {
        return {
            id: listing.id,
            title: listing.title,
            description: listing.description,
            category: listing.category,
            price: listing.price,
            listingType: listing.listingType,
            condition: listing.condition,
            isAvailable: listing.isAvailable,
            createdAt: listing.createdAt,
            updatedAt: listing.updatedAt,
            owner: listing.owner ? {
                id: listing.owner.id,
                universityEmail: listing.owner.universityEmail,
                grade: listing.owner.grade,
                department: listing.owner.department,
                ratingAverage: listing.owner.ratingAverage,
                ratingCount: listing.owner.ratingCount,
            } : undefined,
        };
    }

    /**
     * Format listing response for public access
     * @param {object} listing - Listing from database
     * @param {object} ratingSummary - Rating summary
     * @returns {object} Formatted listing
     */
    _formatPublicListingResponse(listing, ratingSummary) {
        // Hide owner's email, provide basic info only
        return {
            id: listing.id,
            title: listing.title,
            description: listing.description,
            category: listing.category,
            price: listing.price,
            listingType: listing.listingType,
            condition: listing.condition,
            isAvailable: listing.isAvailable,
            createdAt: listing.createdAt,
            updatedAt: listing.updatedAt,
            owner: listing.owner ? {
                id: listing.owner.id,
                grade: listing.owner.grade,
                department: listing.owner.department,
                ratingAverage: ratingSummary?.averageRating || listing.owner.ratingAverage || 0,
                ratingCount: ratingSummary?.reviewCount || listing._count?.reviews || 0,
            } : undefined,
        };
    }

    /**
     * Format listing response for inventory (includes stats)
     * @param {object} listing - Listing from database
     * @returns {object} Formatted listing
     */
    _formatInventoryListingResponse(listing) {
        return {
            id: listing.id,
            title: listing.title,
            description: listing.description,
            category: listing.category,
            price: listing.price,
            listingType: listing.listingType,
            condition: listing.condition,
            isAvailable: listing.isAvailable,
            createdAt: listing.createdAt,
            updatedAt: listing.updatedAt,
            stats: {
                reviewCount: listing._count?.reviews || 0,
                orderCount: listing._count?.orders || 0,
            },
        };
    }
}
