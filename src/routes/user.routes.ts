import { Router } from "express";
import { authenticateAccessToken } from "../middlewares/authenticate";
import {
  generateOtpHandler,
  getMeHandler,
  loginUserHandler,
  registerUserHandler,
  validateOtpHandler,
} from "../controller/user.controller";

const userRouter = Router();

userRouter.get("/otp/:number", generateOtpHandler);
userRouter.post("/otp/validate", validateOtpHandler);
userRouter.post("/register", registerUserHandler);
userRouter.post("/login", loginUserHandler);
userRouter.get("/me", authenticateAccessToken, getMeHandler);

export default userRouter;
