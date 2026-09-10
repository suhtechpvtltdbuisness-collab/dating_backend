import { Router } from "express";
import { authenticateAccessToken } from "../middlewares/authenticate";
import {
  getDislikesHandler,
  getIncomingLikesHandler,
  getLikesHandler,
  getMatchesHandler,
  leftSwipeHandler,
  rightSwipeHandler,
} from "../controller/swipe.controller";

const swipeRouter = Router();

swipeRouter.use(authenticateAccessToken);

swipeRouter.post("/right/:userId", rightSwipeHandler);
swipeRouter.post("/left/:userId", leftSwipeHandler);
swipeRouter.get("/matches", getMatchesHandler);
swipeRouter.get("/likes", getLikesHandler);
swipeRouter.get("/dislikes", getDislikesHandler);
swipeRouter.get("/liked-you", getIncomingLikesHandler);

export default swipeRouter;
