import { matchedData } from "express-validator";
import AuthService from "../services/AuthService.js";
import AuthRepository from "../repositories/AuthRepository.js";
import { catchAsync } from "../utils/catchAsync.js";
import environment from "../configs/environment.js";

// Create instances with dependency injection
const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);

/**
 * Format successful response
 */
const successResponse = (data, statusCode = 200) => ({
    status: "success",
    data,
});

/**
 * Register a new student
 */
export const register = catchAsync(async (req, res) => {
    const { email, password } = matchedData(req);

    const result = await authService.register({ email, password });

    // Set refresh token in httpOnly cookie
    res.cookie("refreshToken", result.tokens.refreshToken, {
        httpOnly: true,
        secure: environment.nodeEnv === "production",
        sameSite: environment.nodeEnv === "development" ? "strict" : "none",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json(
        successResponse({
            user: result.user,
            accessToken: result.tokens.accessToken,
            // In development, return verification token for testing
            // In production, this should be sent via email
            ...(environment.nodeEnv !== "production" && { 
                emailVerificationToken: result.emailVerificationToken 
            }),
        })
    );
});

/**
 * Login user
 */
export const login = catchAsync(async (req, res) => {
    const { email, password } = matchedData(req);

    const result = await authService.login({ email, password });

    // Set refresh token in httpOnly cookie
    res.cookie("refreshToken", result.tokens.refreshToken, {
        httpOnly: true,
        secure: environment.nodeEnv === "production",
        sameSite: environment.nodeEnv === "development" ? "strict" : "none",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json(
        successResponse({
            user: result.user,
            accessToken: result.tokens.accessToken,
        })
    );
});

/**
 * Logout user
 */
export const logout = catchAsync(async (req, res) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: environment.nodeEnv === "production",
        sameSite: environment.nodeEnv === "development" ? "strict" : "none",
    });

    res.status(200).json(successResponse({ message: "Logged out successfully" }));
});

/**
 * Verify user email
 */
export const verifyEmail = catchAsync(async (req, res) => {
    const { token } = matchedData(req);

    const result = await authService.verifyEmail(token);

    res.status(200).json(successResponse(result));
});

/**
 * Request password reset
 */
export const forgotPassword = catchAsync(async (req, res) => {
    const { email } = matchedData(req);

    const result = await authService.forgotPassword(email);

    res.status(200).json(successResponse(result));
});

/**
 * Reset password
 */
export const resetPassword = catchAsync(async (req, res) => {
    const { token, newPassword } = matchedData(req);

    const result = await authService.resetPassword({ token, newPassword });

    // Clear refresh token cookie if exists
    if (req.cookies?.refreshToken) {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: environment.nodeEnv === "production",
            sameSite: environment.nodeEnv === "development" ? "strict" : "none",
        });
    }

    res.status(200).json(successResponse(result));
});

/**
 * Generate new access token from refresh token
 */
export const generateAccessToken = catchAsync(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken || matchedData(req).refreshToken;

    if (!refreshToken) {
        return res.status(401).json({
            status: "fail",
            message: "Refresh token is required",
        });
    }

    const result = await authService.generateAccessToken(refreshToken);

    res.status(200).json(successResponse(result));
});

/**
 * Get current user
 */
export const getMe = catchAsync(async (req, res) => {
    const user = await authService.getUserById(req.user.id);
    
    res.status(200).json(successResponse({ user }));
});
