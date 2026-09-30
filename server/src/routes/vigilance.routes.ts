import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { ROLES } from "../constants/roles.js";
import { uploadAudio } from "../middleware/uploadAudio.js";

import {
  updateVigilance,
  uploadAudio as uploadLeadAudioController,
  verify,
} from "../controllers/vigilance.controller.js";

const router = Router();

router.use(
  authenticate,
  authorize(ROLES.VIGILANCE)
);

router.put(
  "/:id",
  updateVigilance
);

router.post(
  "/:id/audio",
  uploadAudio.single("audio"),
  uploadLeadAudioController
);

router.post(
  "/:id/verify",
  verify
);

export default router;
