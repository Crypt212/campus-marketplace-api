import { ForbiddenError, UnauthorizedError } from "../errors/errors.js";
import AdminRepository from "../repositories/AdminRepository.js";

/**
 * Middleware to check if user is an approved admin
 * Requires:
 * - User must have ADMIN role
 * - Admin record must exist and be approved (isApproved = true)
 */
export const requireApprovedAdmin = async (req, res, next) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return next(new UnauthorizedError("Authentication required"));
        }

        // Check if user has ADMIN role
        if (req.user.role !== "ADMIN") {
            return next(new ForbiddenError("Admin role required"));
        }

        // Get admin record from database
        const adminRepository = new AdminRepository();
        const admin = await adminRepository.findAdminWithApprovalStatus(req.user.id);

        // Check if admin record exists
        if (!admin) {
            return next(new ForbiddenError("Admin profile not found"));
        }

        // Check if admin is approved
        if (!admin.isApproved) {
            return next(new ForbiddenError("Admin approval pending. Please wait for Super Admin approval."));
        }

        // Attach admin info to request
        req.admin = {
            id: admin.id,
            userId: admin.userId,
            isApproved: admin.isApproved,
            approvedAt: admin.approvedAt,
        };

        next();
    } catch (error) {
        next(error);
    }
};
