import prisma from "../libs/database.js";

export default class AuthRepository {
    constructor(prismaClient = prisma) {
        this.prisma = prismaClient;
    }

    /**
     * Find user by email
     */
    async findUserByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
            include: {
                student: true,
            },
        });
    }

    /**
     * Find user by ID
     */
    async findUserById(userId) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                student: true,
            },
        });
    }

    /**
     * Create a new user with student profile
     */
    async createUser({ email, password, role = "STUDENT" }) {
        return this.prisma.user.create({
            data: {
                email,
                password,
                role,
                isEmailVerified: false,
                student: {
                    create: {
                        universityEmail: email,
                    },
                },
            },
            include: {
                student: true,
            },
        });
    }

    /**
     * Update user email verification status
     */
    async markEmailAsVerified(userId) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                isEmailVerified: true,
                emailVerificationToken: null,
                emailVerificationExpires: null,
            },
        });
    }

    /**
     * Set email verification token
     */
    async setEmailVerificationToken(userId, token, expiresAt) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                emailVerificationToken: token,
                emailVerificationExpires: expiresAt,
            },
        });
    }

    /**
     * Find user by email verification token
     */
    async findUserByEmailVerificationToken(token) {
        return this.prisma.user.findFirst({
            where: {
                emailVerificationToken: token,
                emailVerificationExpires: {
                    gt: new Date(),
                },
            },
        });
    }

    /**
     * Set password reset token
     */
    async setPasswordResetToken(userId, token, expiresAt) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                passwordResetToken: token,
                passwordResetExpires: expiresAt,
            },
        });
    }

    /**
     * Find user by password reset token
     */
    async findUserByPasswordResetToken(token) {
        return this.prisma.user.findFirst({
            where: {
                passwordResetToken: token,
                passwordResetExpires: {
                    gt: new Date(),
                },
            },
        });
    }

    /**
     * Update user password
     */
    async updatePassword(userId, newPassword) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                password: newPassword,
                passwordResetToken: null,
                passwordResetExpires: null,
            },
        });
    }

    /**
     * Clear verification tokens
     */
    async clearEmailVerificationTokens(userId) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                emailVerificationToken: null,
                emailVerificationExpires: null,
            },
        });
    }
}
