import prisma from "../libs/database.js";

export default class AdminRepository {
    constructor(prismaClient = prisma) {
        this.prisma = prismaClient;
    }

    /**
     * Find admin by user ID
     * @param {string} userId - User ID
     * @returns {object|null} Admin record
     */
    async findAdminByUserId(userId) {
        return this.prisma.admin.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        isEmailVerified: true,
                        createdAt: true,
                    },
                },
                approvedBy: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
    }

    /**
     * Find admin by ID
     * @param {string} adminId - Admin ID
     * @returns {object|null} Admin record
     */
    async findAdminById(adminId) {
        return this.prisma.admin.findUnique({
            where: { id: adminId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        isEmailVerified: true,
                        createdAt: true,
                    },
                },
                approvedBy: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
    }

    /**
     * Find all pending admins (not approved)
     * @returns {object[]} List of pending admins
     */
    async findPendingAdmins() {
        return this.prisma.admin.findMany({
            where: { isApproved: false },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        isEmailVerified: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    /**
     * Approve an admin
     * @param {string} adminId - Admin ID
     * @param {string} approvedById - SuperAdmin user ID
     * @returns {object} Updated admin record
     */
    async approveAdmin(adminId, approvedById) {
        return this.prisma.admin.update({
            where: { id: adminId },
            data: {
                isApproved: true,
                approvedById,
                approvedAt: new Date(),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        isEmailVerified: true,
                        createdAt: true,
                    },
                },
                approvedBy: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
    }

    /**
     * Delete admin (reject)
     * @param {string} adminId - Admin ID
     * @returns {object} Deleted admin record
     */
    async deleteAdmin(adminId) {
        return this.prisma.admin.delete({
            where: { id: adminId },
        });
    }

    /**
     * Find admin by user ID including approval status
     * @param {string} userId - User ID
     * @returns {object|null} Admin record with approval status
     */
    async findAdminWithApprovalStatus(userId) {
        return this.prisma.admin.findUnique({
            where: { userId },
            select: {
                id: true,
                userId: true,
                isApproved: true,
                approvedAt: true,
            },
        });
    }
}
