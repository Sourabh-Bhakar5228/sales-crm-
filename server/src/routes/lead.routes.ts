import { Router } from "express";
import {
  createLead,
  getLeads,
  getLeadById,
  getStats,
  markMeeting,
  uploadAudio,
  verifyLead,
  allocateLead,
  audioCompleted,
  claimLead,
  getWorkflow,
  getSalesUsers,
} from "../controllers/lead.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { audioUpload } from "../middleware/upload.middleware.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

// Protect all lead routes with authentication
router.use(authenticate);

// 6.9 Create Lead (Marketing)
router.post(
  "/",
  authorize(ROLES.MARKETING),
  createLead
);

// 6.16 Get Leads (Role-based filtered list)
router.get(
  "/",
  getLeads
);

// Lead Statistics for Dashboard
router.get("/stats", getStats);

// Helper for Support: Get list of active sales reps
router.get("/sales-users", authorize(ROLES.SUPPORT), getSalesUsers);

// Single Lead details
router.get("/:id", getLeadById);

// Communication: Schedule Meeting
router.post("/:id/meeting", authorize(ROLES.COMMUNICATION), markMeeting);

// Vigilance: Upload Call Audio
router.post(
  "/:id/audio",
  authorize(ROLES.VIGILANCE),
  audioUpload.single("audio"),
  uploadAudio
);

// Vigilance: Verify Lead
router.post("/:id/verify", authorize(ROLES.VIGILANCE), verifyLead);

// Support: Allocate Lead
router.post("/:id/allocate", authorize(ROLES.SUPPORT), allocateLead);

// Sales: Record Audio Playback Completion
router.post("/:id/audio-completed", authorize(ROLES.SALES), audioCompleted);

// Sales: Claim Lead
router.post("/:id/claim", authorize(ROLES.SALES), claimLead);

// Audit History Timeline
router.get("/:id/workflow", getWorkflow);

export default router;
