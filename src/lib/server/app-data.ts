import "server-only";

import { createServiceRoleClient } from "@/lib/supabase/server";
import type {
  Anomaly,
  Employee,
  Meeting,
  Project,
  Recommendation,
  Role,
} from "@/lib/types";

type EmployeeRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  hourly_rate: number | string;
  cost_band: string | null;
  status: "active" | "inactive";
};

type ProjectRow = {
  id: string;
  name: string;
  description: string | null;
  budget: number | string | null;
  priority: Project["priority"];
  owner_id: string | null;
  keywords: string[] | null;
  status: "active" | "archived";
};

type UserRow = {
  id: string;
  name: string;
};

type MeetingRow = {
  id: string;
  calendar_event_id: string | null;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  organizer_email: string | null;
  project_id: string | null;
  ai_confidence: number | string | null;
  ai_reason: string | null;
  total_cost: number | string | null;
  is_recurring: boolean | null;
  needs_review: boolean | null;
  status: Meeting["status"];
};

type MeetingAttendeeRow = {
  id: string;
  meeting_id: string;
  employee_id: string | null;
  email: string;
  hourly_rate_snapshot: number | string | null;
  cost_contribution: number | string | null;
};

export type DashboardSummary = {
  totalCost: number;
  lowConfidence: number;
  unclassified: number;
  mostExpensive: Meeting | null;
  potentialSavings: number;
  openAnomalies: number;
  meetingCount: number;
  employeeCount: number;
};

export type ProjectCostPoint = {
  name: string;
  cost: number;
  budget: number;
  priority: Project["priority"];
};

export type BudgetUsagePoint = {
  name: string;
  used: number;
  spent: number;
  budget: number;
};

export type DepartmentCostPoint = {
  name: string;
  cost: number;
};

export type DailyTrendPoint = {
  day: string;
  cost: number;
};

export type AppDataPayload = {
  employees: Employee[];
  projects: Project[];
  meetings: Meeting[];
  anomalies: Anomaly[];
  recommendations: Recommendation[];
  reviewQueue: Meeting[];
  summary: DashboardSummary;
  projectCostData: ProjectCostPoint[];
  budgetUsageData: BudgetUsagePoint[];
  departmentCostData: DepartmentCostPoint[];
  dailyTrendData: DailyTrendPoint[];
};

export type DateRangeFilter = "This week" | "Last week" | "This month" | "Last 30 days" | "Custom range";

function asNumber(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return 0;
}

function normalizeShadowProjectName(title: string) {
  const lowered = title.toLowerCase();
  if (lowered.includes("ai hiring")) return "AI Hiring Assistant";
  return title;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getRangeBounds(range: DateRangeFilter): { start: Date; end: Date } {
  const now = new Date();
  const today = startOfDay(now);

  switch (range) {
    case "Last week": {
      const day = today.getDay();
      const diff = day === 0 ? 6 : day - 1;
      const thisWeekStart = new Date(today.getTime() - diff * 24 * 60 * 60 * 1000);
      const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { start: lastWeekStart, end: thisWeekStart };
    }
    case "This month": {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      return { start, end };
    }
    case "Last 30 days": {
      const start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const end = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      return { start, end };
    }
    case "Custom range": {
      const start = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
      const end = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      return { start, end };
    }
    case "This week":
    default: {
      const day = today.getDay();
      const diff = day === 0 ? 6 : day - 1;
      const start = new Date(today.getTime() - diff * 24 * 60 * 60 * 1000);
      const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
      return { start, end };
    }
  }
}

function scoreProjectMatch(project: Project, text: string) {
  const lowered = text.toLowerCase();
  let score = 0;

  if (lowered.includes(project.name.toLowerCase())) {
    score += 5;
  }

  for (const keyword of project.keywords) {
    if (lowered.includes(keyword.toLowerCase())) {
      score += 2;
    }
  }

  return score;
}

export function attributeMeetingFallback(meeting: Meeting, projects: Project[]) {
  const text = `${meeting.title} ${meeting.description}`.trim();
  const candidates = projects
    .filter((project) => project.name !== "Unclassified")
    .map((project) => ({
      project,
      score: scoreProjectMatch(project, text),
    }))
    .sort((a, b) => b.score - a.score);

  const best = candidates[0];
  const second = candidates[1];

  if (!best || best.score === 0) {
    return {
      projectId: null,
      projectName: "Unclassified",
      confidence: 0.48,
      needsReview: true,
      status: "unclassified" as const,
      reason: `No project keywords matched. Possible shadow project: ${normalizeShadowProjectName(meeting.title)}.`,
    };
  }

  const exactTitleMatch = text.toLowerCase().includes(best.project.name.toLowerCase());
  const margin = best.score - (second?.score ?? 0);
  let confidence = exactTitleMatch ? 0.95 : best.score >= 4 ? 0.88 : 0.72;

  if (margin <= 1) {
    confidence -= 0.13;
  }

  confidence = Math.max(0.4, Math.min(0.97, Number(confidence.toFixed(2))));

  return {
    projectId: best.project.id,
    projectName: best.project.name,
    confidence,
    needsReview: confidence < 0.7,
    status: "attributed" as const,
    reason: exactTitleMatch
      ? `Matched directly to ${best.project.name} from the meeting title and description.`
      : `Matched ${best.project.name} using project keywords with score ${best.score}.`,
  };
}

function buildAnomalies(meetings: Meeting[], projects: Project[], employees: Employee[]) {
  const anomalies: Anomaly[] = [];
  const employeeByEmail = new Map(employees.map((employee) => [employee.email, employee]));
  const projectById = new Map(projects.map((project) => [project.id, project]));

  for (const project of projects) {
    if (project.budget > 0 && project.spent > project.budget) {
      const usage = Math.round((project.spent / project.budget) * 100);
      anomalies.push({
        id: `budget-${project.id}`,
        type: "Budget Overrun",
        severity: usage >= 150 ? "high" : "medium",
        message: `${project.name} has spent ₹${Math.round(project.spent)} against a ₹${Math.round(project.budget)} weekly budget (${usage}%).`,
        project: project.name,
        estimatedLoss: Math.round(project.spent - project.budget),
        suggestedAction: "Review recurring meetings and reduce non-essential attendees.",
        resolved: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  const hrProject = projects.find((project) => project.name === "Internal HR");
  if (hrProject) {
    const hrMeetings = meetings.filter((meeting) => meeting.projectId === hrProject.id);
    const leakageEntries = hrMeetings.flatMap((meeting) =>
      meeting.attendees.filter((attendee) => {
        const employee = employeeByEmail.get(attendee.email);
        return employee?.department === "Engineering";
      }),
    );
    const leakageCost = leakageEntries.reduce((sum, attendee) => sum + attendee.costContribution, 0);

    if (leakageCost > 0) {
      anomalies.push({
        id: "leakage-internal-hr",
        type: "Hidden Cost Leakage",
        severity: "high",
        message: `Engineering attendees consumed ₹${Math.round(leakageCost)} in Internal HR meetings.`,
        project: hrProject.name,
        estimatedLoss: Math.round(leakageCost),
        suggestedAction: "Replace engineering attendance with async review notes wherever possible.",
        resolved: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  const signatureMap = new Map<string, Meeting[]>();
  for (const meeting of meetings) {
    const signature = [
      meeting.projectId ?? "unclassified",
      meeting.durationMinutes,
      [...meeting.attendees.map((attendee) => attendee.email)].sort().join(","),
    ].join("|");
    const existing = signatureMap.get(signature) ?? [];
    existing.push(meeting);
    signatureMap.set(signature, existing);
  }

  for (const group of signatureMap.values()) {
    if (group.length >= 2) {
      const duplicate = group.slice(0, 2);
      anomalies.push({
        id: `duplicate-${duplicate[0].id}-${duplicate[1].id}`,
        type: "Duplicate Meeting",
        severity: "medium",
        message: `'${duplicate[0].title}' and '${duplicate[1].title}' have the same attendee mix and duration.`,
        project: duplicate[0].projectName,
        estimatedLoss: Math.round(Math.min(duplicate[0].totalCost, duplicate[1].totalCost) * 4),
        suggestedAction: "Merge these recurring meetings into a single session.",
        resolved: false,
        createdAt: new Date().toISOString(),
      });
      break;
    }
  }

  const expensiveMeeting = [...meetings].sort((a, b) => b.totalCost - a.totalCost)[0];
  if (expensiveMeeting && expensiveMeeting.totalCost >= 5000) {
    anomalies.push({
      id: `expensive-${expensiveMeeting.id}`,
      type: "Expensive Meeting",
      severity: "medium",
      message: `'${expensiveMeeting.title}' cost ₹${Math.round(expensiveMeeting.totalCost)} in a single session.`,
      project: expensiveMeeting.projectName,
      estimatedLoss: 0,
      suggestedAction: "Limit attendance to core decision-makers and move updates async.",
      resolved: false,
      createdAt: new Date().toISOString(),
    });
  }

  const lowConfidenceCount = meetings.filter((meeting) => meeting.aiConfidence < 0.7).length;
  if (lowConfidenceCount > 0) {
    anomalies.push({
      id: "low-confidence",
      type: "Low AI Confidence",
      severity: "low",
      message: `${lowConfidenceCount} meetings were attributed below 70% confidence and need review.`,
      project: null,
      estimatedLoss: 0,
      suggestedAction: "Open the review queue and confirm project assignments.",
      resolved: false,
      createdAt: new Date().toISOString(),
    });
  }

  const unclassified = meetings.filter((meeting) => meeting.projectId === null);
  const shadowCandidates = unclassified.filter((meeting) =>
    meeting.title.toLowerCase().includes("ai"),
  );
  if (shadowCandidates.length >= 2) {
    anomalies.push({
      id: "shadow-project",
      type: "Shadow Project",
      severity: "medium",
      message: `'${normalizeShadowProjectName(shadowCandidates[0].title)}' appears across ${shadowCandidates.length} unclassified meetings.`,
      project: null,
      estimatedLoss: Math.round(
        shadowCandidates.reduce((sum, meeting) => sum + meeting.totalCost, 0),
      ),
      suggestedAction: "Create a formal project or reassign these meetings to an existing initiative.",
      resolved: false,
      createdAt: new Date().toISOString(),
    });
  }

  return anomalies;
}

function buildRecommendations(anomalies: Anomaly[], meetings: Meeting[]): Recommendation[] {
  const recommendations: Recommendation[] = [];

  const expensive = anomalies.find((anomaly) => anomaly.type === "Expensive Meeting");
  if (expensive) {
    const meeting = meetings.find((item) => item.title === expensive.message.split("'")[1]);
    recommendations.push({
      id: "reduce-expensive-meeting",
      project: meeting?.projectName ?? null,
      title: "Reduce attendee count in the most expensive meeting",
      reason: expensive.suggestedAction,
      estimatedMonthlySaving: meeting ? Math.round(meeting.totalCost * 0.6 * 4) : 12000,
      priority: "high",
      status: "open",
    });
  }

  const leakage = anomalies.find((anomaly) => anomaly.type === "Hidden Cost Leakage");
  if (leakage) {
    recommendations.push({
      id: "async-hr-reviews",
      project: leakage.project,
      title: "Replace engineering attendance in HR reviews",
      reason: leakage.suggestedAction,
      estimatedMonthlySaving: Math.round(leakage.estimatedLoss * 4),
      priority: "high",
      status: "open",
    });
  }

  const duplicate = anomalies.find((anomaly) => anomaly.type === "Duplicate Meeting");
  if (duplicate) {
    recommendations.push({
      id: "merge-duplicate-meetings",
      project: duplicate.project,
      title: "Merge duplicate recurring meetings",
      reason: duplicate.suggestedAction,
      estimatedMonthlySaving: duplicate.estimatedLoss,
      priority: "high",
      status: "open",
    });
  }

  const budgetOverrun = anomalies.find((anomaly) => anomaly.type === "Budget Overrun");
  if (budgetOverrun) {
    recommendations.push({
      id: "slow-overrun-cadence",
      project: budgetOverrun.project,
      title: "Reduce recurring meeting frequency on over-budget projects",
      reason: "Shift weekly status reviews to bi-weekly and consolidate adjacent syncs.",
      estimatedMonthlySaving: Math.max(3000, Math.round(budgetOverrun.estimatedLoss * 0.75)),
      priority: "medium",
      status: "open",
    });
  }

  const shadow = anomalies.find((anomaly) => anomaly.type === "Shadow Project");
  if (shadow) {
    recommendations.push({
      id: "formalize-shadow-project",
      project: null,
      title: "Register the shadow project in CostLens",
      reason: shadow.suggestedAction,
      estimatedMonthlySaving: 0,
      priority: "low",
      status: "open",
    });
  }

  return recommendations;
}

function buildSummary(
  meetings: Meeting[],
  employees: Employee[],
  anomalies: Anomaly[],
  recommendations: Recommendation[],
): DashboardSummary {
  const totalCost = meetings.reduce((sum, meeting) => sum + meeting.totalCost, 0);
  const lowConfidence = meetings.filter((meeting) => meeting.aiConfidence < 0.7).length;
  const unclassified = meetings.filter((meeting) => meeting.projectId === null).length;
  const mostExpensive = [...meetings].sort((a, b) => b.totalCost - a.totalCost)[0] ?? null;
  const potentialSavings = recommendations.reduce(
    (sum, recommendation) => sum + recommendation.estimatedMonthlySaving,
    0,
  );

  return {
    totalCost,
    lowConfidence,
    unclassified,
    mostExpensive,
    potentialSavings,
    openAnomalies: anomalies.length,
    meetingCount: meetings.length,
    employeeCount: employees.length,
  };
}

function sanitizeEmployeesForRole(employees: Employee[], role: Role) {
  if (role === "admin" || role === "finance_manager") {
    return employees;
  }

  return employees.map((employee) => ({
    ...employee,
    hourlyRate: 0,
  }));
}

function sanitizeMeetingsForRole(meetings: Meeting[], role: Role) {
  if (role === "admin" || role === "finance_manager") {
    return meetings;
  }

  return meetings.map((meeting) => ({
    ...meeting,
    attendees: meeting.attendees.map((attendee) => ({
      ...attendee,
      costContribution: 0,
    })),
  }));
}

export async function updateMeetingAttributions() {
  const service = createServiceRoleClient();
  const payload = await getAppData("admin");

  const updates = payload.meetings.map((meeting) => {
    const attributed = attributeMeetingFallback(meeting, payload.projects);
    return {
      id: meeting.id,
      project_id: attributed.projectId,
      ai_confidence: attributed.confidence,
      ai_reason: attributed.reason,
      needs_review: attributed.needsReview,
      status: attributed.status,
    };
  });

  for (const update of updates) {
    const { error } = await service.from("meetings").update(update).eq("id", update.id);
    if (error) {
      throw new Error(error.message);
    }
  }

  return updates.length;
}

export async function setReviewedMeeting(meetingId: string, projectId: string) {
  const service = createServiceRoleClient();
  const payload = await getAppData("admin");
  const project = payload.projects.find((item) => item.id === projectId);

  if (!project) {
    throw new Error("Project not found for review update.");
  }

  const { error } = await service
    .from("meetings")
    .update({
      project_id: project.id,
      ai_reason: `Confirmed manually as ${project.name}.`,
      needs_review: false,
      status: "reviewed",
      ai_confidence: 0.99,
    })
    .eq("id", meetingId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getAppData(role: Role, range: DateRangeFilter = "This week"): Promise<AppDataPayload> {
  const service = createServiceRoleClient();

  const [
    employeesResult,
    projectsResult,
    usersResult,
    meetingsResult,
    attendeesResult,
  ] = await Promise.all([
    service.from("employees").select("*").order("name"),
    service.from("projects").select("*").order("name"),
    service.from("users").select("id, name"),
    service.from("meetings").select("*").order("start_time", { ascending: true }),
    service.from("meeting_attendees").select("*"),
  ]);

  for (const result of [
    employeesResult,
    projectsResult,
    usersResult,
    meetingsResult,
    attendeesResult,
  ]) {
    if (result.error) {
      throw new Error(result.error.message);
    }
  }

  const employeeRows = (employeesResult.data ?? []) as EmployeeRow[];
  const projectRows = (projectsResult.data ?? []) as ProjectRow[];
  const userRows = (usersResult.data ?? []) as UserRow[];
  const meetingRows = (meetingsResult.data ?? []) as MeetingRow[];
  const attendeeRows = (attendeesResult.data ?? []) as MeetingAttendeeRow[];

  const employees: Employee[] = employeeRows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    department: row.department,
    hourlyRate: asNumber(row.hourly_rate),
    costBand: row.cost_band ?? "—",
    status: row.status,
  }));

  const usersById = new Map(userRows.map((row) => [row.id, row.name]));
  const projectSpend = new Map<string, number>();
  for (const meeting of meetingRows) {
    if (meeting.project_id) {
      projectSpend.set(
        meeting.project_id,
        (projectSpend.get(meeting.project_id) ?? 0) + asNumber(meeting.total_cost),
      );
    }
  }

  const projects: Project[] = projectRows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    budget: asNumber(row.budget),
    spent: projectSpend.get(row.id) ?? 0,
    priority: row.priority,
    owner: row.owner_id ? usersById.get(row.owner_id) ?? "—" : "—",
    keywords: row.keywords ?? [],
    status: row.status,
  }));

  const projectById = new Map(projects.map((project) => [project.id, project]));
  const employeeById = new Map(employees.map((employee) => [employee.id, employee]));
  const employeeByEmail = new Map(employees.map((employee) => [employee.email, employee]));
  const attendeesByMeeting = new Map<string, Meeting["attendees"]>();
  const { start: rangeStart, end: rangeEnd } = getRangeBounds(range);

  for (const attendee of attendeeRows) {
    const existing = attendeesByMeeting.get(attendee.meeting_id) ?? [];
    const employee =
      (attendee.employee_id ? employeeById.get(attendee.employee_id) : null) ??
      employeeByEmail.get(attendee.email);

    existing.push({
      email: attendee.email,
      name: employee?.name ?? attendee.email,
      costContribution: asNumber(attendee.cost_contribution),
    });

    attendeesByMeeting.set(attendee.meeting_id, existing);
  }

  const meetings: Meeting[] = meetingRows.map((row) => {
    const project = row.project_id ? projectById.get(row.project_id) : null;
    return {
      id: row.id,
      title: row.title,
      description: row.description ?? "",
      start: row.start_time,
      durationMinutes: row.duration_minutes,
      organizer: row.organizer_email ?? "",
      projectId: row.project_id,
      projectName: project?.name ?? "Unclassified",
      aiConfidence: asNumber(row.ai_confidence),
      aiReason: row.ai_reason ?? "Not yet attributed.",
      totalCost: asNumber(row.total_cost),
      isRecurring: Boolean(row.is_recurring),
      needsReview: Boolean(row.needs_review),
      status: row.status,
      attendees: attendeesByMeeting.get(row.id) ?? [],
    };
  });

  const filteredMeetings = meetings.filter((meeting) => {
    const meetingDate = new Date(meeting.start);
    return meetingDate >= rangeStart && meetingDate < rangeEnd;
  });
  const filteredProjectSpend = new Map<string, number>();
  for (const meeting of filteredMeetings) {
    if (meeting.projectId) {
      filteredProjectSpend.set(
        meeting.projectId,
        (filteredProjectSpend.get(meeting.projectId) ?? 0) + meeting.totalCost,
      );
    }
  }

  const filteredProjects = projects.map((project) => ({
    ...project,
    spent: filteredProjectSpend.get(project.id) ?? 0,
  }));

  const anomalies = buildAnomalies(filteredMeetings, filteredProjects, employees);
  const recommendations = buildRecommendations(anomalies, filteredMeetings);
  const summary = buildSummary(filteredMeetings, employees, anomalies, recommendations);

  const projectCostData = filteredProjects
    .filter((project) => project.name !== "Unclassified")
    .map((project) => ({
      name: project.name,
      cost: project.spent,
      budget: project.budget,
      priority: project.priority,
    }))
    .sort((a, b) => (b.cost ?? 0) - (a.cost ?? 0));

  const budgetUsageData = filteredProjects
    .filter((project) => project.budget > 0)
    .map((project) => ({
      name: project.name,
      used: Math.round((project.spent / project.budget) * 100),
      spent: project.spent,
      budget: project.budget,
    }))
    .sort((a, b) => (b.used ?? 0) - (a.used ?? 0));

  const departmentMap = new Map<string, number>();
  for (const meeting of filteredMeetings) {
    for (const attendee of meeting.attendees) {
      const employee = employeeByEmail.get(attendee.email);
      const department = employee?.department ?? "Other";
      departmentMap.set(
        department,
        (departmentMap.get(department) ?? 0) + attendee.costContribution,
      );
    }
  }

  const departmentCostData = Array.from(departmentMap.entries())
    .map(([name, cost]) => ({ name, cost: Math.round(cost) }))
    .sort((a, b) => (b.cost ?? 0) - (a.cost ?? 0));

  const dailyMap = new Map<string, number>();
  for (const meeting of filteredMeetings) {
    const day = meeting.start.slice(0, 10);
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + meeting.totalCost);
  }

  const dailyTrendData = Array.from(dailyMap.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([day, cost]) => ({ day, cost }));

  return {
    employees: sanitizeEmployeesForRole(employees, role),
    projects: filteredProjects,
    meetings: sanitizeMeetingsForRole(filteredMeetings, role),
    anomalies,
    recommendations,
    reviewQueue: filteredMeetings.filter((meeting) => meeting.needsReview),
    summary,
    projectCostData,
    budgetUsageData,
    departmentCostData,
    dailyTrendData,
  };
}
