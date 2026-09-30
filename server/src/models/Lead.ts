import mongoose, { Document, Schema } from "mongoose";
import { LEAD_STATUS, LeadStatus } from "../constants/leadStatus.js";

export interface IAudio {
  url: string;
  publicId: string;
  fileName: string;
  mimeType: string;
  duration?: number;
  uploadedAt: Date;
  uploadedBy: mongoose.Types.ObjectId;
}

export interface ILead extends Document {
  name: string;
  contactNumber: string;

  postalAddress?: string;
  date?: Date;
  time?: string;
  remark?: string;

  status: LeadStatus;

  audio?: IAudio;

  audioCompletedAt?: Date | null;
  audioCompletedBy?: mongoose.Types.ObjectId | null;

  createdBy: mongoose.Types.ObjectId;

  assignedTo?: mongoose.Types.ObjectId | null;

  claimedBy?: mongoose.Types.ObjectId | null;

  claimedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

const audioSchema = new Schema<IAudio>(
  {
    url: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    duration: {
      type: Number,
    },

    uploadedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    _id: false,
  }
);

const leadSchema = new Schema<ILead>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },

    postalAddress: {
      type: String,
      trim: true,
    },

    date: {
      type: Date,
    },

    time: {
      type: String,
    },

    remark: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: Object.values(LEAD_STATUS),
      default: LEAD_STATUS.CREATED,
      required: true,
    },

    audio: {
      type: audioSchema,
    },

    audioCompletedAt: {
      type: Date,
      default: null,
    },

    audioCompletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    claimedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    claimedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

leadSchema.index({ status: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ createdBy: 1 });
leadSchema.index({ claimedBy: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ status: 1, assignedTo: 1 });
leadSchema.index({ status: 1, createdBy: 1 });

export const Lead = mongoose.model<ILead>("Lead", leadSchema);
