import { Router } from "express";
import authRouter from "./auth.js";
import adminRouter from "./admin.js";
import orderRouter from "./order.js";
import listingsRouter from "./listings.js";

const mainRouter = Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/admins", adminRouter);
mainRouter.use("/orders", orderRouter);
mainRouter.use("/listings", listingsRouter);

export default mainRouter;
