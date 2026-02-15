import { decodeToken } from "../utils/tokens.js";
import { UnauthorizedError, ForbiddenError } from "../errors/errors.js";

/**
 * Middleware to authenticate JWT token
 * Attaches user information to req.user
 */
export const authenticate = (req, res, next) => {
    try {
        // Get token from Authorization header or cookies
        let token = null;

        // Check Authorization header first
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        // Fall back to cookie
        if (!token && req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        }

        if (!token) {
            throw new UnauthorizedError("Access token is required");
        }

        // Verify and decode token
        const decoded = decodeToken("accessToken", token);

        // Attach user to request
        req.user = {
            id: decoded.userId,
            role: decoded.role,
        };

        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return next(new UnauthorizedError("Invalid or expired token"));
        }
        next(error);
    }
};

/**
 * Middleware to check if user has specific role(s)
 * @param {...string} roles - Allowed roles
 * @returns {Function} Middleware function
 */
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new UnauthorizedError("Authentication required"));
        }

        if (!roles.includes(req.user.role)) {
            return next(new ForbiddenError("You don't have permission to perform this action"));
        }

        next();
    };
};

/**
 * Middleware to check if user is a student
 */
export const requireStudent = authorize("STUDENT");

/**
 * Middleware to check if user is an admin
 */
export const requireAdmin = authorize("ADMIN");

/**
 * Middleware to check if user is a super admin
 */
export const requireSuperAdmin = authorize("SUPER_ADMIN");

/**
 * Middleware to check if user is an admin or super admin
 */
export const requireAdminOrSuperAdmin = authorize("ADMIN", "SUPER_ADMIN");

/**
 * Optional authentication - attaches user if token exists but doesn't require it
 */
export const optionalAuth = (req, res, next) => {
    try {
        let token = null;

        // Check Authorization header first
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        // Fall back to cookie
        if (!token && req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        }

        // If no token, continue without user
        if (!token) {
            return next();
        }

        // Verify and decode token
        const decoded = decodeToken("accessToken", token);

        // Attach user to request
        req.user = {
            id: decoded.userId,
            role: decoded.role,
        };

        next();
    } catch (error) {
        // If token is invalid, continue without user
        next();
    }
};
