import { Router } from "express";
import {
    getPendingAdmins,
    approveAdmin,
    rejectAdmin,
    getMyAdminStatus,
    getAdminByUserId,
} from "../controllers/AdminController.js";
import validate from "../validators/validate.js";
import {
    approveAdminValidator,
    rejectAdminValidator,
} from "../validators/adminValidators.js";
import { authenticate, requireSuperAdmin, requireAdmin } from "../middlewares/authMiddleware.js";
import { requireApprovedAdmin } from "../middlewares/adminMiddleware.js";

const adminRouter = Router();

// Apply authentication to all routes
adminRouter.use(authenticate);

/**
 * GET /api/v1/admins/pending
 * Get all pending admins (SUPER_ADMIN only)
 */
adminRouter.get(
    "/pending",
    requireSuperAdmin,
    getPendingAdmins
);

/**
 * PATCH /api/v1/admins/:id/approve
 * Approve an admin (SUPER_ADMIN only)
 */
adminRouter.patch(
    "/:id/approve",
    requireSuperAdmin,
    approveAdminValidator,
    validate,
    approveAdmin
);

/**
 * PATCH /api/v1/admins/:id/reject
 * Reject an admin - deletes admin record but NOT user (SUPER_ADMIN only)
 */
adminRouter.patch(
    "/:id/reject",
    requireSuperAdmin,
    rejectAdminValidator,
    validate,
    rejectAdmin
);

/**
 * GET /api/v1/admins/me/status
 * Get current user's admin status (authenticated users)
 */
adminRouter.get(
    "/me/status",
    getMyAdminStatus
);

/**
 * GET /api/v1/admins/me
 * Get current user's admin details (ADMIN role)
 */
adminRouter.get(
    "/me",
    requireAdmin,
    getAdminByUserId
);

export default adminRouter;
