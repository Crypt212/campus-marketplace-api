import { Router } from "express";
import authRouter from "./auth.js";
import adminRouter from "./admin.js";

const mainRouter = Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/admins", adminRouter);

export default mainRouter;
