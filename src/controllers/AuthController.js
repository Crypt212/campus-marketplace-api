import { validationResult } from "express-validator";
import AuthService from "../services/AuthService.js";
import catchAsync from "../utils/catchAsync.js";
import prismaClient from "../libs/database.js";
import environment from "../configs/environment.js";

const authService = new AuthService({ prisma: prismaClient });

export const register = catchAsync(async (req, res) => {
    const { email, password } = validationResult(req);

    const result = await authService.register({ email, password });

    res.cookie("refreshToken", result.tokens.refreshToken, {
        httpOnly: true,
        secure: environment.nodeEnv === "production",
        sameSite: environment.nodeEnv === "development" ? "strict" : "none",
    });

    res.status(201).json({
        status: "success",
        data: {
            user: result.user,
            refreshToken: result.tokens.refreshToken,
        }
    });
});

export const login = catchAsync(async (req, res) => {
    const { email, password } = validationResult(req);

    const result = await authService.login({ email, password });

    res.cookie("refreshToken", result.tokens.refreshToken, {
        httpOnly: true,
        secure: environment.nodeEnv === "production",
        sameSite: environment.nodeEnv === "development" ? "strict" : "none",
    });

    res.status(200).json({
        status: "success",
        data: {
            refreshToken: result.tokens.refreshToken,
        }
    });
});

export const generateAccessToken = catchAsync(async (req, res) => {
    const { refreshToken } = matchedData(req, { includeOptionals: true });

    const result = await authService.generateAccessToken({ refreshToken });

    return res.json({ success: true, data: result.accessToken });
})

export const logout = catchAsync(async (req, res) => {
    if (res.cookie("refreshToken") == undefined)
        res.status(200).json({ status: "success" });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: environment.nodeEnv === "production",
        sameSite: environment.nodeEnv === "development" ? "strict" : "none",
    });

    res.status(200).json({
        status: "success",
        data: {
            refreshToken: result.tokens.refreshToken,
        }
    });
});

export const forgotPassword = catchAsync(async (req, res) => {
    const { email } = matchedData(req, { includeOptionals: true });

    const user = await usersModel.findOne({ email: email });

    const resetToken = generateToken("reset", { id: user._id }, '1h');
    const resetLink = `http://localhost:3000/auth/reset-password/${resetToken}`;
    await sendEmail(user.email, "Reset your password", `
                <p>Hello,</p>
                <p>Click the link below to reset your password:</p>
                <a href="${resetLink}">${resetLink}</a>
                <p>This link will expire in 10 minutes.</p> `);

    return res.status(200).json({ success: true, data: { message: "reset link sent (if email exists)" } });
});

export const resetPassword = catchAsync(async (req, res) => {
    const { resetToken, newPassword } = matchedData(req, { includeOptionals: true });

    const decoded = decodeToken(resetToken);

    // await user.setPassword(newPassword);
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prismaClient.user.update({
        where: {
            id: decoded.id,
        },
        data: {
            password: hashedPassword,
        }
    });

    return res.status(200).json({ message: "Password has been updated successfully" });
});
