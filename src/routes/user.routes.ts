import { Router } from "express";
import { authenticateAccessToken } from "../middlewares/authenticate";
import {
  generateEmailOtpHandler,
  generateOtpHandler,
  getMeHandler,
  getSuggestionsHandler,
  loginUserHandler,
  refreshTokenHandler,
  registerUserHandler,
  validateEmailOtpHandler,
  validateOtpHandler,
} from "../controller/user.controller";

const userRouter = Router();

userRouter.get("/otp/:number", generateOtpHandler);
userRouter.post("/otp/validate", validateOtpHandler);
userRouter.get("/otp/email/:email", generateEmailOtpHandler);
userRouter.post("/otp/email/validate", validateEmailOtpHandler);
userRouter.post("/register", registerUserHandler);
userRouter.post("/login", loginUserHandler);
userRouter.post("/refresh", refreshTokenHandler);
userRouter.get("/me", authenticateAccessToken, getMeHandler);
userRouter.get("/suggestions", authenticateAccessToken, getSuggestionsHandler);

export default userRouter;
