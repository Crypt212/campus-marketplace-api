import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../libs/database.js";
import { AppError } from "../errors/AppError.js";
import environment from "../configs/environment.js";
import { decodeToken, generateToken } from "../utils/tokens.js";

export default class AuthService {
    constructor() {
    }

    async register({ email, password }) {
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            throw new AppError("Email already registered", 400);
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: "STUDENT",
                isEmailVerified: false,
                student: {
                    create: {
                        universityEmail: email
                    }
                }
            },
            include: {
                student: true
            }
        });
        const tokens = {
            refreshToken: generateToken("refresh", { userId: user.id, role: user.role }),
            accessToken: generateToken("access", { userId: user.id, role: user.role }),
        }

        return { user, tokens };
    }

    async login({ email, password }) {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { student: true }
        });

        if (!user) {
            throw new AppError("Invalid credentials", 401);
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            throw new AppError("Invalid credentials", 401);
        }

        const tokens = {
            refreshToken: generateToken("refresh", { userId: user.id, role: user.role }),
            accessToken: generateToken("access", { userId: user.id, role: user.role }),
        }

        return { user, tokens };
    }

    async generateAccessToken({ refreshToken }) {
        const decoded = decodeToken("refresh", refreshToken);
        const accessToken = generateToken("access", decoded)
        return { accessToken };
    };
}
}
