import { Router } from "express";
import {
    register,
    login,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    generateAccessToken,
    getMe,
} from "../controllers/AuthController.js";
import validate from "../validators/validate.js";
import {
    registerValidator,
    loginValidator,
    verifyEmailValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
} from "../validators/authValidators.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const authRouter = Router();

/**
 * POST /api/v1/auth/register
 * Register a new student
 */
authRouter.post(
    "/register",
    registerValidator,
    validate,
    register
);

/**
 * POST /api/v1/auth/login
 * Login user
 */
authRouter.post(
    "/login",
    loginValidator,
    validate,
    login
);

/**
 * POST /api/v1/auth/logout
 * Logout user
 */
authRouter.post(
    "/logout",
    logout
);

/**
 * GET /api/v1/auth/verify-email
 * Verify user email (query parameter)
 */
authRouter.get(
    "/verify-email",
    verifyEmailValidator,
    validate,
    verifyEmail
);

/**
 * POST /api/v1/auth/verify-email
 * Verify user email (body)
 */
authRouter.post(
    "/verify-email",
    verifyEmailValidator,
    validate,
    verifyEmail
);

/**
 * POST /api/v1/auth/forgot-password
 * Request password reset
 */
authRouter.post(
    "/forgot-password",
    forgotPasswordValidator,
    validate,
    forgotPassword
);

/**
 * POST /api/v1/auth/reset-password
 * Reset password
 */
authRouter.post(
    "/reset-password",
    resetPasswordValidator,
    validate,
    resetPassword
);

/**
 * GET /api/v1/auth/refresh
 * Refresh access token (uses cookie)
 */
authRouter.get(
    "/refresh",
    generateAccessToken
);

/**
 * POST /api/v1/auth/refresh
 * Refresh access token (body)
 */
authRouter.post(
    "/refresh",
    generateAccessToken
);

/**
 * GET /api/v1/auth/me
 * Get current user (protected)
 */
authRouter.get(
    "/me",
    authenticate,
    getMe
);

export default authRouter;
