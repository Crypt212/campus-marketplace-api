import { Router } from "express";
import {
    createListing,
    getListing,
    updateListing,
    deleteListing,
    browseListings,
    getMyInventory,
    getCategories,
} from "../controllers/ListingController.js";
import validate from "../validators/validate.js";
import {
    createListingValidator,
    updateListingValidator,
    getListingValidator,
    deleteListingValidator,
    browseListingsValidator,
} from "../validators/listingValidators.js";
import { authenticate, requireStudent } from "../middlewares/authMiddleware.js";

const listingsRouter = Router();

/**
 * GET /api/v1/listings
 * Browse listings with filters, sorting, and pagination (Public)
 */
listingsRouter.get(
    "/",
    browseListingsValidator,
    validate,
    browseListings
);

/**
 * GET /api/v1/listings/categories
 * Get available categories (Public)
 */
listingsRouter.get(
    "/categories",
    getCategories
);

/**
 * GET /api/v1/listings/my-inventory
 * Get student's own listings (Protected - Student only)
 */
listingsRouter.get(
    "/my-inventory",
    authenticate,
    requireStudent,
    getMyInventory
);

/**
 * GET /api/v1/listings/:id
 * Get a single listing by ID (Public)
 * NOTE: This route MUST be defined after /my-inventory to avoid UUID mismatch
 */
listingsRouter.get(
    "/:id",
    getListingValidator,
    validate,
    getListing
);

/**
 * POST /api/v1/listings
 * Create a new listing (Protected - Student only, verified)
 */
listingsRouter.post(
    "/",
    authenticate,
    requireStudent,
    createListingValidator,
    validate,
    createListing
);

/**
 * PUT /api/v1/listings/:id
 * Update a listing (Protected - Owner only)
 */
listingsRouter.put(
    "/:id",
    authenticate,
    requireStudent,
    updateListingValidator,
    validate,
    updateListing
);

/**
 * PATCH /api/v1/listings/:id
 * Update a listing (Protected - Owner only)
 */
listingsRouter.patch(
    "/:id",
    authenticate,
    requireStudent,
    updateListingValidator,
    validate,
    updateListing
);

/**
 * DELETE /api/v1/listings/:id
 * Delete a listing (Protected - Owner only, soft delete)
 */
listingsRouter.delete(
    "/:id",
    authenticate,
    requireStudent,
    deleteListingValidator,
    validate,
    deleteListing
);

export default listingsRouter;
