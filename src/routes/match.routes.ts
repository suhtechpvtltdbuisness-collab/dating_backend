import { Router } from "express";
import {
  acceptMatchHandler,
  listMatchesHandler,
  matchDetailHandler,
  rejectMatchHandler,
  topMatchesHandler,
  unmatchHandler,
} from "../controller/match.controller";
import { authenticateAccessToken } from "../middlewares/authenticate";

const matchRouter = Router();

matchRouter.use(authenticateAccessToken);

matchRouter.get("/", listMatchesHandler);
matchRouter.get("/top", topMatchesHandler);
matchRouter.post("/:id/accept", acceptMatchHandler);
matchRouter.post("/:id/reject", rejectMatchHandler);
matchRouter.delete("/:id/unmatch", unmatchHandler);
matchRouter.get("/:id", matchDetailHandler);

export default matchRouter;
