import jwt from "jsonwebtoken";
import crypto from "crypto";
import environment from "../configs/environment.js";
import AppError from "../errors/AppError.js";

/**
 * Generate a JWT token
 * @param {string} type - Token type: 'accessToken', 'refreshToken', or 'resetToken'
 * @param {object} payload - Data to encode in the token
 * @returns {string} The generated token
 */
export const generateToken = (type, payload) => {
    const tokenConfig = environment.jwt[type];
    
    if (!tokenConfig) {
        throw new AppError("Invalid token type", 500);
    }

    return jwt.sign(payload, tokenConfig.secret, {
        expiresIn: tokenConfig.expiresIn,
    });
};

/**
 * Verify and decode a JWT token
 * @param {string} type - Token type: 'accessToken', 'refreshToken', or 'resetToken'
 * @param {string} token - The token to verify
 * @returns {object} The decoded token payload
 */
export const decodeToken = (type, token) => {
    const tokenConfig = environment.jwt[type];
    
    if (!tokenConfig) {
        throw new AppError("Invalid token type", 500);
    }

    return jwt.verify(token, tokenConfig.secret);
};

/**
 * Generate a random token for email verification or password reset
 * @returns {string} A random token
 */
export const generateRandomToken = () => {
    return crypto.randomBytes(32).toString("hex");
};

/**
 * Hash a token for storage (e.g., email verification token)
 * @param {string} token - The token to hash
 * @returns {string} The hashed token
 */
export const hashToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Verify a token against a hashed version
 * @param {string} token - The raw token
 * @param {string} hashedToken - The hashed token to compare against
 * @returns {boolean} True if tokens match
 */
export const verifyToken = (token, hashedToken) => {
    const hashedInput = hashToken(token);
    return hashedInput === hashedToken;
};
