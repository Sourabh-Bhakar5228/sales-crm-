import { Router } from "express";
import {
  authenticate,
  AuthRequest,
} from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.get(
  "/marketing",
  authenticate,
  authorize(ROLES.MARKETING),
  (req: AuthRequest, res) => {
    res.json({
      success: true,
      message: "Welcome Marketing",
      user: req.user,
    });
  }
);

router.get(
  "/sales",
  authenticate,
  authorize(ROLES.SALES),
  (req: AuthRequest, res) => {
    res.json({
      success: true,
      message: "Welcome Sales",
      user: req.user,
    });
  }
);

export default router;
