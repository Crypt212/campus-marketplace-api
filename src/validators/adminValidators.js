import { param } from "express-validator";

/**
 * Validator for admin ID parameter (UUID)
 */
export const adminIdParamValidator = [
    param("id")
        .isUUID()
        .withMessage("Admin ID must be a valid UUID"),
];

/**
 * Validator for approve admin ID parameter
 */
export const approveAdminValidator = adminIdParamValidator;

/**
 * Validator for reject admin ID parameter
 */
export const rejectAdminValidator = adminIdParamValidator;
