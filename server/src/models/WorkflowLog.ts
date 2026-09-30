import mongoose, { Document, Schema } from "mongoose";
import { LeadStatus } from "../constants/leadStatus.js";
import { WorkflowAction } from "../constants/workflowActions.js";
import { Role } from "../constants/roles.js";

export interface IWorkflowLog extends Document {
  leadId: mongoose.Types.ObjectId;

  action: WorkflowAction;

  fromStatus?: LeadStatus | null;

  toStatus?: LeadStatus | null;

  performedBy: mongoose.Types.ObjectId;

  performedByRole: Role;

  metadata?: Record<string, unknown>;

  createdAt: Date;
}

const workflowLogSchema = new Schema<IWorkflowLog>(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      index: true,
    },

    action: {
      type: String,
      required: true,
    },

    fromStatus: {
      type: String,
      default: null,
    },

    toStatus: {
      type: String,
      default: null,
    },

    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    performedByRole: {
      type: String,
      required: true,
    },

    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

workflowLogSchema.index({
  leadId: 1,
  createdAt: -1,
});

export const WorkflowLog = mongoose.model<IWorkflowLog>(
  "WorkflowLog",
  workflowLogSchema
);
