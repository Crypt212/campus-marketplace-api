import bcrypt from "bcryptjs";
import { generateToken, generateRandomToken, hashToken } from "../utils/tokens.js";
import { BadRequestError, UnauthorizedError, NotFoundError } from "../errors/errors.js";

export default class AuthService {
    /**
     * @param {import('../repositories/AuthRepository.js').default} authRepository
     */
    constructor(authRepository) {
        if (!authRepository) {
            throw new Error("AuthRepository is required");
        }
        this.authRepository = authRepository;
    }

    /**
     * Register a new student
     * @param {object} params - Registration parameters
     * @param {string} params.email - User email
     * @param {string} params.password - User password
     * @returns {object} User data and tokens
     */
    async register({ email, password }) {
        // Check if user already exists
        const existingUser = await this.authRepository.findUserByEmail(email);
        
        if (existingUser) {
            throw new BadRequestError("Email already registered");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user with student profile
        const user = await this.authRepository.createUser({
            email,
            password: hashedPassword,
            role: "STUDENT",
        });

        // Generate email verification token
        const verificationToken = generateRandomToken();
        const hashedVerificationToken = hashToken(verificationToken);
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Store hashed verification token
        await this.authRepository.setEmailVerificationToken(
            user.id,
            hashedVerificationToken,
            verificationExpires
        );

        // Generate JWT tokens
        const tokens = this._generateTokens(user);

        return {
            user: this._formatUserResponse(user),
            tokens,
            // In production, send this via email, not in response
            emailVerificationToken: verificationToken,
        };
    }

    /**
     * Login user
     * @param {object} params - Login parameters
     * @param {string} params.email - User email
     * @param {string} params.password - User password
     * @returns {object} User data and tokens
     */
    async login({ email, password }) {
        const user = await this.authRepository.findUserByEmail(email);

        if (!user) {
            throw new UnauthorizedError("Invalid credentials");
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            throw new UnauthorizedError("Invalid credentials");
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
            throw new UnauthorizedError("Please verify your email first");
        }

        const tokens = this._generateTokens(user);

        return {
            user: this._formatUserResponse(user),
            tokens,
        };
    }

    /**
     * Verify user email
     * @param {string} token - Email verification token
     * @returns {object} Success message
     */
    async verifyEmail(token) {
        if (!token) {
            throw new BadRequestError("Verification token is required");
        }

        const hashedToken = hashToken(token);
        const user = await this.authRepository.findUserByEmailVerificationToken(hashedToken);

        if (!user) {
            throw new BadRequestError("Invalid or expired verification token");
        }

        await this.authRepository.markEmailAsVerified(user.id);

        return {
            message: "Email verified successfully",
        };
    }

    /**
     * Request password reset
     * @param {string} email - User email
     * @returns {object} Success message (don't reveal if email exists)
     */
    async forgotPassword(email) {
        const user = await this.authRepository.findUserByEmail(email);

        // Don't reveal if email exists or not
        if (!user) {
            return { message: "If the email exists, a reset link will be sent" };
        }

        // Generate password reset token
        const resetToken = generateRandomToken();
        const hashedResetToken = hashToken(resetToken);
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await this.authRepository.setPasswordResetToken(
            user.id,
            hashedResetToken,
            resetExpires
        );

        // In production, send this via email
        return {
            message: "If the email exists, a reset link will be sent",
            // Remove this in production
            passwordResetToken: resetToken,
        };
    }

    /**
     * Reset password
     * @param {object} params - Reset parameters
     * @param {string} params.token - Password reset token
     * @param {string} params.newPassword - New password
     * @returns {object} Success message
     */
    async resetPassword({ token, newPassword }) {
        if (!token || !newPassword) {
            throw new BadRequestError("Token and new password are required");
        }

        const hashedToken = hashToken(token);
        const user = await this.authRepository.findUserByPasswordResetToken(hashedToken);

        if (!user) {
            throw new BadRequestError("Invalid or expired reset token");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await this.authRepository.updatePassword(user.id, hashedPassword);

        return {
            message: "Password reset successfully",
        };
    }

    /**
     * Generate new access token from refresh token
     * @param {string} refreshToken - Refresh token
     * @returns {object} New access token
     */
    async generateAccessToken(refreshToken) {
        const { decodeToken } = await import("../utils/tokens.js");
        
        const decoded = decodeToken("refreshToken", refreshToken);
        const accessToken = generateToken("accessToken", {
            userId: decoded.userId,
            role: decoded.role,
        });

        return { accessToken };
    }

    /**
     * Get user by ID
     * @param {string} userId - User ID
     * @returns {object} User data
     */
    async getUserById(userId) {
        const user = await this.authRepository.findUserById(userId);

        if (!user) {
            throw new NotFoundError("User not found");
        }

        return this._formatUserResponse(user);
    }

    /**
     * Generate JWT tokens for user
     * @param {object} user - User object
     * @returns {object} Access and refresh tokens
     */
    _generateTokens(user) {
        const payload = {
            userId: user.id,
            role: user.role,
        };

        return {
            accessToken: generateToken("accessToken", payload),
            refreshToken: generateToken("refreshToken", payload),
        };
    }

    /**
     * Format user response (remove sensitive data)
     * @param {object} user - User object from database
     * @returns {object} Formatted user object
     */
    _formatUserResponse(user) {
        const { password, emailVerificationToken, emailVerificationExpires, 
                passwordResetToken, passwordResetExpires, ...userWithoutSensitive } = user;
        return userWithoutSensitive;
    }
}
