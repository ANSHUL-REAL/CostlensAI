/** Shared domain types for CostLens AI. */

export type Role = "admin" | "finance_manager" | "project_manager" | "leadership_viewer";

export type Priority = "High" | "Medium" | "Low" | "None";

export type AnomalySeverity = "high" | "medium" | "low";

export type MeetingStatus = "imported" | "attributed" | "reviewed" | "unclassified";

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  hourlyRate: number;
  costBand: string;
  status: "active" | "inactive";
}

export interface Project {
  id: string;
  name: string;
  description: string;
  budget: number; // weekly budget
  spent: number; // computed cost so far
  priority: Priority;
  owner: string;
  keywords: string[];
  status: "active" | "archived";
}

export interface Attendee {
  email: string;
  name: string;
  costContribution: number;
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  start: string; // ISO
  durationMinutes: number;
  organizer: string;
  projectId: string | null;
  projectName: string;
  aiConfidence: number; // 0..1
  aiReason: string;
  totalCost: number;
  isRecurring: boolean;
  needsReview: boolean;
  status: MeetingStatus;
  attendees: Attendee[];
}

export interface Anomaly {
  id: string;
  type: string;
  severity: AnomalySeverity;
  message: string;
  project: string | null;
  estimatedLoss: number;
  suggestedAction: string;
  resolved: boolean;
  createdAt: string;
}

export interface Recommendation {
  id: string;
  project: string | null;
  title: string;
  reason: string;
  estimatedMonthlySaving: number;
  priority: AnomalySeverity;
  status: "open" | "applied" | "dismissed";
}
