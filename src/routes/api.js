import { Router } from "express";
import authRouter from "./auth";
const mainRouter = express.Router();

mainRouter.use("/auth", authRouter);

export default mainRouter;
