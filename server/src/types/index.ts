import { Document, Types } from 'mongoose';

// ----------------------------------------------------
// Enums
// ----------------------------------------------------

export enum UserRole {
  MARKETING = 'MARKETING',
  COMMUNICATION = 'COMMUNICATION',
  VIGILANCE = 'VIGILANCE',
  SUPPORT = 'SUPPORT',
  SALES = 'SALES'
}

export enum LeadStatus {
  CREATED = 'CREATED',
  MEETING = 'MEETING',
  VERIFIED = 'VERIFIED',
  ALLOCATED = 'ALLOCATED',
  CLAIMED = 'CLAIMED'
}

export enum WorkflowAction {
  CREATE_LEAD = 'CREATE_LEAD',
  MARK_MEETING = 'MARK_MEETING',
  UPLOAD_AUDIO = 'UPLOAD_AUDIO',
  VERIFY_LEAD = 'VERIFY_LEAD',
  ALLOCATE_LEAD = 'ALLOCATE_LEAD',
  AUDIO_COMPLETED = 'AUDIO_COMPLETED',
  CLAIM_LEAD = 'CLAIM_LEAD'
}

// ----------------------------------------------------
// User Interfaces
// ----------------------------------------------------

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// ----------------------------------------------------
// Audio Subdocument Interface
// ----------------------------------------------------

export interface IAudioDetails {
  url: string;
  publicId: string;
  fileName: string;
  mimeType: string;
  duration: number; // in seconds
  uploadedAt: Date;
  uploadedBy: Types.ObjectId;
}

// ----------------------------------------------------
// Lead Interfaces
// ----------------------------------------------------

export interface ILead {
  name: string;
  contactNumber: string;
  postalAddress?: string | null;
  date?: Date | null;
  time?: string | null;
  remark?: string | null;
  status: LeadStatus;
  audio?: IAudioDetails | null;
  audioCompletedAt?: Date | null;
  audioCompletedBy?: Types.ObjectId | null;
  createdBy: Types.ObjectId;
  assignedTo?: Types.ObjectId | null;
  claimedBy?: Types.ObjectId | null;
  claimedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILeadDocument extends ILead, Document {
  _id: Types.ObjectId;
}

// ----------------------------------------------------
// Workflow Log Interfaces
// ----------------------------------------------------

export interface IWorkflowLog {
  leadId: Types.ObjectId;
  action: WorkflowAction;
  fromStatus: LeadStatus | null;
  toStatus: LeadStatus;
  performedBy: Types.ObjectId;
  performedByRole: UserRole;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface IWorkflowLogDocument extends IWorkflowLog, Document {
  _id: Types.ObjectId;
}

// ----------------------------------------------------
// Auth & Context Types
// ----------------------------------------------------

export interface IAuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
