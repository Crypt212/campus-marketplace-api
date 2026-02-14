import jwt from "jsonwebtoken";
import environment from "../configs/environment.js";
import AppError from "../errors/AppError.js";

export const generateToken = (type, payload) => {
    const tokenType = type + "Token";
    const tokenConfig = environment.jwt[tokenType];
    if (!tokenConfig)
        throw new AppError("invalid token type", 500);

    jwt.sign(payload, tokenConfig.secret, {
        expiresIn: tokenConfig.expiresIn,
    });
}

export const decodeToken = (type, token) => {
    const tokenType = type + "Token";
    const tokenConfig = environment.jwt[tokenType];
    if (!tokenConfig)
        throw new AppError("invalid token type", 500);

    const decoded = jwt.verify(token, tokenConfig.secret);

    return decoded;
}
