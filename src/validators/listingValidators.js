import { body, query, param } from "express-validator";

/**
 * Validation rules for creating a listing
 */
export const createListingValidator = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required")
        .isLength({ min: 3, max: 200 })
        .withMessage("Title must be between 3 and 200 characters"),
    body("description")
        .trim()
        .notEmpty()
        .withMessage("Description is required")
        .isLength({ min: 10, max: 2000 })
        .withMessage("Description must be between 10 and 2000 characters"),
    body("category")
        .trim()
        .notEmpty()
        .withMessage("Category is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Category must be between 2 and 100 characters"),
    body("price")
        .notEmpty()
        .withMessage("Price is required")
        .isFloat({ min: 0 })
        .withMessage("Price must be a positive number"),
    body("listingType")
        .notEmpty()
        .withMessage("Listing type is required")
        .isIn(["SELL", "RENT", "BOTH"])
        .withMessage("Listing type must be SELL, RENT, or BOTH"),
    body("condition")
        .trim()
        .notEmpty()
        .withMessage("Condition is required")
        .isLength({ min: 2, max: 50 })
        .withMessage("Condition must be between 2 and 50 characters"),
];

/**
 * Validation rules for updating a listing
 */
export const updateListingValidator = [
    param("id")
        .isUUID()
        .withMessage("Invalid listing ID"),
    body("title")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Title cannot be empty")
        .isLength({ min: 3, max: 200 })
        .withMessage("Title must be between 3 and 200 characters"),
    body("description")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Description cannot be empty")
        .isLength({ min: 10, max: 2000 })
        .withMessage("Description must be between 10 and 2000 characters"),
    body("category")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Category cannot be empty")
        .isLength({ min: 2, max: 100 })
        .withMessage("Category must be between 2 and 100 characters"),
    body("price")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Price must be a positive number"),
    body("listingType")
        .optional()
        .isIn(["SELL", "RENT", "BOTH"])
        .withMessage("Listing type must be SELL, RENT, or BOTH"),
    body("condition")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Condition cannot be empty")
        .isLength({ min: 2, max: 50 })
        .withMessage("Condition must be between 2 and 50 characters"),
    body("isAvailable")
        .optional()
        .isBoolean()
        .withMessage("isAvailable must be a boolean"),
];

/**
 * Validation rules for getting/listing ID parameter
 */
export const listingIdParamValidator = [
    param("id")
        .isUUID()
        .withMessage("Invalid listing ID"),
];

/**
 * Validation rules for browsing listings
 */
export const browseListingsValidator = [
    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer"),
    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100"),
    query("category")
        .optional()
        .trim()
        .escape()
        .isLength({ max: 100 })
        .withMessage("Category cannot exceed 100 characters"),
    query("listingType")
        .optional()
        .isIn(["SELL", "RENT", "BOTH"])
        .withMessage("Invalid listing type"),
    query("minPrice")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Min price must be a positive number"),
    query("maxPrice")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Max price must be a positive number")
        .custom((value, { req }) => {
            if (value && req.query.minPrice && parseFloat(value) < parseFloat(req.query.minPrice)) {
                throw new Error("Max price must be greater than or equal to min price");
            }
            return true;
        }),
    query("grade")
        .optional()
        .trim()
        .escape()
        .isLength({ max: 50 })
        .withMessage("Grade cannot exceed 50 characters"),
    query("sortBy")
        .optional()
        .isIn(["price", "createdAt", "rating"])
        .withMessage("Invalid sort field"),
    query("sortOrder")
        .optional()
        .isIn(["asc", "desc"])
        .withMessage("Sort order must be asc or desc"),
];

/**
 * Validation rules for getting a single listing
 */
export const getListingValidator = [
    param("id")
        .isUUID()
        .withMessage("Invalid listing ID"),
];

/**
 * Validation rules for deleting a listing
 */
export const deleteListingValidator = [
    param("id")
        .isUUID()
        .withMessage("Invalid listing ID"),
];
