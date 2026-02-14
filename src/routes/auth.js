import { Router } from "express";
import { register, login, logout, generateAccessToken, resetPassword, forgotPassword, verifyEmail, } from "../controllers/AuthController";
import { body, cookie } from "express-validator";
import validate from "../validators/validate.js";
import cookieParser from "cookie-parser";

const authRouter = Router();


authRouter.post(
    "/register",
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    validate,
    register
);

authRouter.post(
    "/login",
    body("email").isEmail(),
    body("password").isStrongPassword(),
    validate,
    login
);

authRouter.get(
    "/logout",
    logout);

authRouter.post(
    "/forgot-password",
    body("email").isEmail(),
    validate,
    forgotPassword
);

authRouter.post(
    "/reset-password",
    cookie("resetToken").isJWT(),
    body("newPassword").isStrongPassword(),
    validate,
    resetPassword
);

authRouter.get("/refresh",
    cookie("refreshToken").isJWT(),
    generateAccessToken
);
authRouter.get("/verify-email",

    verifyEmail);

export default authRouter;
