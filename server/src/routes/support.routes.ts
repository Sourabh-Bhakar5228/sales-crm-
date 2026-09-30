import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { ROLES } from "../constants/roles.js";
import { allocate } from "../controllers/support.controller.js";

const router = Router();

router.use(
  authenticate,
  authorize(ROLES.SUPPORT)
);

router.post(
  "/:id/allocate",
  allocate
);

export default router;
