import { Router } from "express";
import { authenticateAccessToken } from "../middlewares/authenticate";
import {
  generateOtpHandler,
  getMeHandler,
  getSuggestionsHandler,
  loginUserHandler,
  refreshTokenHandler,
  registerUserHandler,
  validateOtpHandler,
} from "../controller/user.controller";

const userRouter = Router();

userRouter.get("/otp/:number", generateOtpHandler);
userRouter.post("/otp/validate", validateOtpHandler);
userRouter.post("/register", registerUserHandler);
userRouter.post("/login", loginUserHandler);
userRouter.post("/refresh", refreshTokenHandler);
userRouter.get("/me", authenticateAccessToken, getMeHandler);
userRouter.get("/suggestions", authenticateAccessToken, getSuggestionsHandler);

export default userRouter;
