import { Router } from "express";
import {
  getProfileHandler,
  updateProfileHandler,
} from "../controller/profile.controller";
import { authenticateAccessToken } from "../middlewares/authenticate";

const profileRouter = Router();

profileRouter.use(authenticateAccessToken);

profileRouter.get("/", getProfileHandler);
profileRouter.put("/", updateProfileHandler);

export default profileRouter;
