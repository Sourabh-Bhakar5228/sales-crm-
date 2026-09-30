import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { ROLES } from "../constants/roles.js";
import {
  audioCompleted,
  claim,
} from "../controllers/sales.controller.js";

const router = Router();

router.use(
  authenticate,
  authorize(ROLES.SALES)
);

router.post(
  "/:id/audio-completed",
  audioCompleted
);

router.post(
  "/:id/claim",
  claim
);

export default router;
