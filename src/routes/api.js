import { Router } from "express";
import authRouter from "./auth.js";
import listingsRouter from "./listings.routes.js";

const mainRouter = Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/listings", listingsRouter);

export default mainRouter;
