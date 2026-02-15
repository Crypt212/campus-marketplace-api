import { matchedData } from "express-validator";
import { catchAsync } from "../utils/catchAsync.js";
import ListingService from "../services/ListingService.js";
import ListingRepository from "../repositories/ListingRepository.js";
import prisma from "../libs/database.js";
import { ForbiddenError } from "../errors/errors.js";

// Create instances with dependency injection
const listingRepository = new ListingRepository();
const listingService = new ListingService(listingRepository);

/**
 * Format successful response
 */
const successResponse = (data, meta = null) => ({
    status: "success",
    data,
    ...(meta && { meta }),
});

/**
 * Get student profile by user ID
 * @param {string} userId - User ID
 * @returns {object|null} Student profile
 */
async function getStudentProfile(userId) {
    return prisma.student.findUnique({
        where: { userId },
        select: {
            id: true,
            userId: true,
            isActive: true,
            user: {
                select: {
                    isEmailVerified: true,
                },
            },
        },
    });
}

/**
 * Create a new listing (Student only, verified)
 */
export const createListing = catchAsync(async (req, res) => {
    const { title, description, category, price, listingType, condition } = matchedData(req);

    // Get student profile from user ID
    const student = await getStudentProfile(req.user.id);

    if (!student) {
        throw new ForbiddenError("Student profile not found");
    }

    if (!student.user.isEmailVerified) {
        throw new ForbiddenError("Please verify your email before creating a listing");
    }

    if (!student.isActive) {
        throw new ForbiddenError("Your account is not active");
    }

    const listing = await listingService.create({
        ownerId: student.id,
        title,
        description,
        category,
        price,
        listingType,
        condition,
    });

    res.status(201).json(successResponse(listing));
});

/**
 * Get a single listing (Public)
 */
export const getListing = catchAsync(async (req, res) => {
    const { id } = matchedData(req, { locations: ["params"] });

    const listing = await listingService.getById(id);

    res.status(200).json(successResponse(listing));
});

/**
 * Update a listing (Owner only)
 */
export const updateListing = catchAsync(async (req, res) => {
    const { id } = matchedData(req, { locations: ["params"] });
    const updateData = matchedData(req);

    // Get student profile from user ID
    const student = await getStudentProfile(req.user.id);

    if (!student) {
        throw new ForbiddenError("Student profile not found");
    }

    if (!student.user.isEmailVerified) {
        throw new ForbiddenError("Please verify your email first");
    }

    // Remove id from updateData if present (from params)
    delete updateData.id;

    const listing = await listingService.update({
        listingId: id,
        ownerId: student.id,
        updateData,
    });

    res.status(200).json(successResponse(listing));
});

/**
 * Delete a listing (Owner only, soft delete)
 */
export const deleteListing = catchAsync(async (req, res) => {
    const { id } = matchedData(req, { locations: ["params"] });

    // Get student profile from user ID
    const student = await getStudentProfile(req.user.id);

    if (!student) {
        throw new ForbiddenError("Student profile not found");
    }

    const result = await listingService.delete({
        listingId: id,
        ownerId: student.id,
    });

    res.status(200).json(successResponse(result));
});

/**
 * Browse listings with filters, sorting, pagination (Public)
 */
export const browseListings = catchAsync(async (req, res) => {
    const {
        page,
        limit,
        category,
        listingType,
        minPrice,
        maxPrice,
        grade,
        sortBy,
        sortOrder,
    } = matchedData(req);

    const result = await listingService.browse({
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
        category,
        listingType,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        grade,
        sortBy: sortBy || "createdAt",
        sortOrder: sortOrder || "desc",
    });

    res.status(200).json(successResponse(result.items, result.meta));
});

/**
 * Get student's own listings (Inventory)
 */
export const getMyInventory = catchAsync(async (req, res) => {
    // Get student profile from user ID
    const student = await getStudentProfile(req.user.id);

    if (!student) {
        throw new ForbiddenError("Student profile not found");
    }

    const result = await listingService.getMyInventory(student.id);

    res.status(200).json(successResponse(result.items, result.meta));
});

/**
 * Get available categories
 */
export const getCategories = catchAsync(async (req, res) => {
    const categories = await listingService.getCategories();

    res.status(200).json(successResponse({ categories }));
});
