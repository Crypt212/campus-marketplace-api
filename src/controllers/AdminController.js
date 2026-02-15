import { matchedData } from "express-validator";
import AdminRepository from "../repositories/AdminRepository.js";
import AdminApprovalService from "../services/AdminApprovalService.js";
import { catchAsync } from "../utils/catchAsync.js";

// Create instances with dependency injection
const adminRepository = new AdminRepository();
const adminApprovalService = new AdminApprovalService(adminRepository);

/**
 * Format successful response
 */
const successResponse = (data, statusCode = 200) => ({
    status: "success",
    data,
});

/**
 * Get all pending admins
 * Only SUPER_ADMIN can access this
 */
export const getPendingAdmins = catchAsync(async (req, res) => {
    const pendingAdmins = await adminApprovalService.getPendingAdmins();

    res.status(200).json(successResponse({ admins: pendingAdmins }));
});

/**
 * Approve an admin
 * Only SUPER_ADMIN can access this
 */
export const approveAdmin = catchAsync(async (req, res) => {
    const { id } = matchedData(req);
    const approvedById = req.user.id; // SuperAdmin's user ID

    const approvedAdmin = await adminApprovalService.approveAdmin(id, approvedById);

    res.status(200).json(successResponse({ admin: approvedAdmin }));
});

/**
 * Reject an admin
 * Only SUPER_ADMIN can access this
 * Note: This deletes the Admin record but NOT the User
 */
export const rejectAdmin = catchAsync(async (req, res) => {
    const { id } = matchedData(req);

    const result = await adminApprovalService.rejectAdmin(id);

    res.status(200).json(successResponse(result));
});

/**
 * Get current user's admin status
 */
export const getMyAdminStatus = catchAsync(async (req, res) => {
    const userId = req.user.id;

    const adminStatus = await adminApprovalService.getAdminApprovalStatus(userId);

    if (!adminStatus) {
        return res.status(200).json(successResponse({ 
            isAdmin: false, 
            admin: null 
        }));
    }

    res.status(200).json(successResponse({ 
        isAdmin: true, 
        admin: adminStatus 
    }));
});

/**
 * Get admin details by user ID
 */
export const getAdminByUserId = catchAsync(async (req, res) => {
    const userId = req.user.id;

    const admin = await adminApprovalService.getAdminByUserId(userId);

    if (!admin) {
        return res.status(200).json(successResponse({ 
            isAdmin: false, 
            admin: null 
        }));
    }

    res.status(200).json(successResponse({ isAdmin: true, admin }));
});
