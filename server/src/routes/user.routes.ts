import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { ROLES } from "../constants/roles.js";
import { getSalesUsersController } from "../controllers/user.controller.js";

const router = Router();

router.get(
  "/sales",
  authenticate,
  authorize(ROLES.SUPPORT),
  getSalesUsersController
);

export default router;
