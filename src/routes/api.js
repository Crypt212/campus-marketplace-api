import { Router } from "express";
import authRouter from "./auth.js";
import adminRouter from "./admin.js";
import orderRouter from "./order.js";

const mainRouter = Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/admins", adminRouter);
mainRouter.use("/orders", orderRouter);

export default mainRouter;
