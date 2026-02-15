import { body, query, param } from "express-validator";

/**
 * Validation rules for user registration
 */
export const registerValidator = [
    body("email")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail()
        .custom((value) => {
            // Check for university email pattern (optional)
            // You can add custom validation here if needed
            return true;
        }),
    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")
        .matches(/\d/)
        .withMessage("Password must contain at least one number")
        .matches(/[A-Z]/)
        .withMessage("Password must contain at least one uppercase letter")
        .matches(/[a-z]/)
        .withMessage("Password must contain at least one lowercase letter")
        .matches(/[!@#$%^&*(),.?":{}|<>]/)
        .withMessage("Password must contain at least one special character"),
];

/**
 * Validation rules for user login
 */
export const loginValidator = [
    body("email")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail(),
    body("password")
        .notEmpty()
        .withMessage("Password is required"),
];

/**
 * Validation rules for email verification
 */
export const verifyEmailValidator = [
    body("token")
        .notEmpty()
        .withMessage("Verification token is required")
        .isLength({ min: 64, max: 64 })
        .withMessage("Invalid verification token format")
        .isHexadecimal()
        .withMessage("Verification token must be a valid hex string"),
];

/**
 * Validation rules for forgot password
 */
export const forgotPasswordValidator = [
    body("email")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail(),
];

/**
 * Validation rules for password reset
 */
export const resetPasswordValidator = [
    body("token")
        .notEmpty()
        .withMessage("Reset token is required")
        .isLength({ min: 64, max: 64 })
        .withMessage("Invalid reset token format")
        .isHexadecimal()
        .withMessage("Reset token must be a valid hex string"),
    body("newPassword")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")
        .matches(/\d/)
        .withMessage("Password must contain at least one number")
        .matches(/[A-Z]/)
        .withMessage("Password must contain at least one uppercase letter")
        .matches(/[a-z]/)
        .withMessage("Password must contain at least one lowercase letter")
        .matches(/[!@#$%^&*(),.?":{}|<>]/)
        .withMessage("Password must contain at least one special character"),
];

/**
 * Validation rules for token refresh
 */
export const refreshTokenValidator = [
    query("refreshToken")
        .optional()
        .isJWT()
        .withMessage("Invalid refresh token"),
];

/**
 * Validation rules for URL parameter (e.g., token in query string)
 */
export const tokenParamValidator = [
    query("token")
        .optional()
        .isLength({ min: 64, max: 64 })
        .withMessage("Invalid token format")
        .isHexadecimal()
        .withMessage("Token must be a valid hex string"),
];
