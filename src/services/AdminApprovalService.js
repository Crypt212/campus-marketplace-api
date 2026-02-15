import { NotFoundError, BadRequestError, ForbiddenError } from "../errors/errors.js";

export default class AdminApprovalService {
    /**
     * @param {import('../repositories/AdminRepository.js').default} adminRepository
     */
    constructor(adminRepository) {
        if (!adminRepository) {
            throw new Error("AdminRepository is required");
        }
        this.adminRepository = adminRepository;
    }

    /**
     * Get all pending admins
     * @returns {object[]} List of pending admins
     */
    async getPendingAdmins() {
        const pendingAdmins = await this.adminRepository.findPendingAdmins();
        
        return pendingAdmins.map((admin) => this._formatAdminResponse(admin));
    }

    /**
     * Approve an admin
     * @param {string} adminId - Admin ID to approve
     * @param {string} approvedById - SuperAdmin user ID who is approving
     * @returns {object} Approved admin
     */
    async approveAdmin(adminId, approvedById) {
        // Check if admin exists
        const admin = await this.adminRepository.findAdminById(adminId);
        
        if (!admin) {
            throw new NotFoundError("Admin not found");
        }

        // Check if already approved
        if (admin.isApproved) {
            throw new BadRequestError("Admin is already approved");
        }

        // Approve the admin
        const approvedAdmin = await this.adminRepository.approveAdmin(adminId, approvedById);

        return this._formatAdminResponse(approvedAdmin);
    }

    /**
     * Reject an admin (delete admin record, keep user)
     * @param {string} adminId - Admin ID to reject
     * @returns {object} Success message
     */
    async rejectAdmin(adminId) {
        // Check if admin exists
        const admin = await this.adminRepository.findAdminById(adminId);
        
        if (!admin) {
            throw new NotFoundError("Admin not found");
        }

        // Delete admin record (User is NOT deleted)
        await this.adminRepository.deleteAdmin(adminId);

        return {
            message: "Admin rejected successfully",
            adminId,
        };
    }

    /**
     * Get admin approval status by user ID
     * @param {string} userId - User ID
     * @returns {object|null} Admin approval status
     */
    async getAdminApprovalStatus(userId) {
        const admin = await this.adminRepository.findAdminWithApprovalStatus(userId);
        
        if (!admin) {
            return null;
        }

        return {
            id: admin.id,
            userId: admin.userId,
            isApproved: admin.isApproved,
            approvedAt: admin.approvedAt,
        };
    }

    /**
     * Get full admin details by user ID
     * @param {string} userId - User ID
     * @returns {object|null} Full admin details
     */
    async getAdminByUserId(userId) {
        const admin = await this.adminRepository.findAdminByUserId(userId);
        
        if (!admin) {
            return null;
        }

        return this._formatAdminResponse(admin);
    }

    /**
     * Format admin response
     * @param {object} admin - Admin object from database
     * @returns {object} Formatted admin object
     */
    _formatAdminResponse(admin) {
        return {
            id: admin.id,
            userId: admin.userId,
            isApproved: admin.isApproved,
            approvedAt: admin.approvedAt,
            createdAt: admin.createdAt,
            user: admin.user ? {
                id: admin.user.id,
                email: admin.user.email,
                role: admin.user.role,
                isEmailVerified: admin.user.isEmailVerified,
                createdAt: admin.user.createdAt,
            } : undefined,
            approvedBy: admin.approvedBy ? {
                id: admin.approvedBy.id,
                userId: admin.approvedBy.userId,
                user: admin.approvedBy.user ? {
                    id: admin.approvedBy.user.id,
                    email: admin.approvedBy.user.email,
                } : undefined,
            } : undefined,
        };
    }
}
