import type {
  Anomaly,
  Employee,
  Meeting,
  Project,
  Recommendation,
} from "./types";

/**
 * Demo dataset derived from IBM HR Analytics (1,470-row dataset).
 * Hourly rates scaled to INR using Indian IT market benchmarks:
 *   Level 1 (0-2 yr) → ₹280-399/hr (B1)
 *   Level 2 (2-5 yr) → ₹400-649/hr (B2)
 *   Level 3 (5-10 yr) → ₹650-999/hr (B3)
 *   Level 4 (10-15 yr) → ₹1000-1499/hr (B4)
 * 19 employees across 5 departments, 25 meetings, all anomaly types seeded.
 */

export const employees: Employee[] = [
  // ── Engineering ───────────────────────────────────────────
  { id: "e1",  name: "Anshul Nautiyal", email: "anshul@acme.com",  role: "Frontend Developer",      department: "Engineering", hourlyRate: 500,  costBand: "B2", status: "active" },
  { id: "e4",  name: "Rahul Verma",     email: "rahul@acme.com",   role: "Backend Developer",       department: "Engineering", hourlyRate: 650,  costBand: "B3", status: "active" },
  { id: "e7",  name: "Vikram Singh",    email: "vikram@acme.com",  role: "Senior Backend Developer",department: "Engineering", hourlyRate: 850,  costBand: "B3", status: "active" },
  { id: "e8",  name: "Kavya Patel",     email: "kavya@acme.com",   role: "Junior Frontend Developer",department: "Engineering",hourlyRate: 380,  costBand: "B1", status: "active" },
  { id: "e9",  name: "Aditya Kumar",    email: "aditya@acme.com",  role: "DevOps Engineer",         department: "Engineering", hourlyRate: 920,  costBand: "B3", status: "active" },
  { id: "e10", name: "Rohan Malhotra",  email: "rohan@acme.com",   role: "Full Stack Developer",    department: "Engineering", hourlyRate: 580,  costBand: "B2", status: "active" },
  // ── Design ────────────────────────────────────────────────
  { id: "e2",  name: "Sourab Reddy",    email: "sourab@acme.com",  role: "UI/UX Designer",          department: "Design",      hourlyRate: 450,  costBand: "B2", status: "active" },
  { id: "e11", name: "Divya Kapoor",    email: "divya@acme.com",   role: "Senior Designer",         department: "Design",      hourlyRate: 720,  costBand: "B3", status: "active" },
  { id: "e12", name: "Tanya Mehta",     email: "tanya@acme.com",   role: "Product Designer",        department: "Design",      hourlyRate: 480,  costBand: "B2", status: "active" },
  // ── Product ───────────────────────────────────────────────
  { id: "e3",  name: "Priya Sharma",    email: "priya@acme.com",   role: "Project Manager",         department: "Product",     hourlyRate: 900,  costBand: "B3", status: "active" },
  { id: "e13", name: "Kiran Desai",     email: "kiran@acme.com",   role: "Product Manager",         department: "Product",     hourlyRate: 950,  costBand: "B3", status: "active" },
  { id: "e14", name: "Saurav Bhat",     email: "saurav@acme.com",  role: "Product Analyst",         department: "Product",     hourlyRate: 620,  costBand: "B2", status: "active" },
  // ── HR ────────────────────────────────────────────────────
  { id: "e5",  name: "Meera Iyer",      email: "meera@acme.com",   role: "HR Lead",                 department: "HR",          hourlyRate: 550,  costBand: "B2", status: "active" },
  { id: "e15", name: "Nisha Joshi",     email: "nisha@acme.com",   role: "HR Manager",              department: "HR",          hourlyRate: 600,  costBand: "B2", status: "active" },
  { id: "e16", name: "Pooja Pandey",    email: "pooja@acme.com",   role: "Recruiter",               department: "HR",          hourlyRate: 380,  costBand: "B1", status: "active" },
  // ── Sales ─────────────────────────────────────────────────
  { id: "e6",  name: "Arjun Rao",       email: "arjun@acme.com",   role: "Sales Manager",           department: "Sales",       hourlyRate: 700,  costBand: "B3", status: "active" },
  { id: "e17", name: "Manish Chopra",   email: "manish@acme.com",  role: "Senior Sales Executive",  department: "Sales",       hourlyRate: 750,  costBand: "B3", status: "active" },
  { id: "e18", name: "Riya Nair",       email: "riya@acme.com",    role: "Business Dev Manager",    department: "Sales",       hourlyRate: 520,  costBand: "B2", status: "active" },
  { id: "e19", name: "Deepak Saxena",   email: "deepak@acme.com",  role: "Sales Director",          department: "Sales",       hourlyRate: 1200, costBand: "B4", status: "active" },
];

export const projects: Project[] = [
  { id: "p1", name: "CareCircle",       description: "Donor & patient matching platform",      budget: 15000, spent: 23359, priority: "High",   owner: "Priya Sharma",  keywords: ["donor","patient","blood","dashboard","thalassemia","api","carecircle"], status: "active" },
  { id: "p2", name: "Sales CRM",        description: "Internal CRM & pipeline tooling",        budget: 10000, spent: 12048, priority: "Medium", owner: "Arjun Rao",     keywords: ["crm","pipeline","client","demo","sales","crm"],                           status: "active" },
  { id: "p3", name: "Internal HR",      description: "Hiring & people operations",             budget: 8000,  spent: 13981, priority: "Low",    owner: "Meera Iyer",    keywords: ["hiring","policy","hr","onboarding","interview","performance","recruit"],   status: "active" },
  { id: "p4", name: "Product Research", description: "Discovery & roadmap research",           budget: 12000, spent: 7198,  priority: "Medium", owner: "Kiran Desai",   keywords: ["research","roadmap","brainstorm","discovery","sprint"],                   status: "active" },
  { id: "p5", name: "Unclassified",     description: "Meetings not yet attributed",            budget: 0,     spent: 5921,  priority: "None",   owner: "—",             keywords: [],                                                                          status: "active" },
];

// Helper: resolve name from email, return Attendee shape
function att(emails: { email: string; cost: number }[]) {
  return emails.map((e) => {
    const emp = employees.find((x) => x.email === e.email)!;
    return { email: e.email, name: emp?.name ?? e.email, costContribution: e.cost };
  });
}

export const meetings: Meeting[] = [
  // ── CareCircle (9 meetings, ₹23,359 total — 156% of ₹15K budget) ──────────

  {
    id: "m1", title: "CareCircle Sprint Planning",
    description: "Full-team sprint planning for the CareCircle donor matching platform.",
    start: "2026-06-08T09:00:00", durationMinutes: 90, organizer: "priya@acme.com",
    projectId: "p1", projectName: "CareCircle",
    aiConfidence: 0.97, aiReason: "Title explicitly contains 'CareCircle'; attendees match the donor platform team.",
    totalCost: 6450, isRecurring: false, needsReview: false, status: "attributed",
    attendees: att([
      { email: "priya@acme.com",  cost: 1350 },
      { email: "rahul@acme.com",  cost: 975  },
      { email: "anshul@acme.com", cost: 750  },
      { email: "vikram@acme.com", cost: 1275 },
      { email: "sourab@acme.com", cost: 675  },
      { email: "kiran@acme.com",  cost: 1425 },
    ]),
  },
  {
    id: "m2", title: "CareCircle Donor Dashboard Sync",
    description: "Weekly sync on donor dashboard widgets and patient data API contracts.",
    start: "2026-06-08T10:30:00", durationMinutes: 60, organizer: "priya@acme.com",
    projectId: "p1", projectName: "CareCircle",
    aiConfidence: 0.96, aiReason: "Matches CareCircle keywords 'donor' and 'dashboard'.",
    totalCost: 2050, isRecurring: true, needsReview: false, status: "attributed",
    attendees: att([
      { email: "priya@acme.com",  cost: 900 },
      { email: "rahul@acme.com",  cost: 650 },
      { email: "anshul@acme.com", cost: 500 },
    ]),
  },
  {
    id: "m3", title: "Patient Matching Logic Discussion",
    description: "Deep dive on thalassemia patient matching algorithm and API edge cases.",
    start: "2026-06-09T11:00:00", durationMinutes: 90, organizer: "priya@acme.com",
    projectId: "p1", projectName: "CareCircle",
    aiConfidence: 0.93, aiReason: "References 'patient', 'thalassemia', and 'API' — all CareCircle keywords.",
    totalCost: 4455, isRecurring: false, needsReview: false, status: "attributed",
    attendees: att([
      { email: "priya@acme.com",  cost: 1350 },
      { email: "rahul@acme.com",  cost: 975  },
      { email: "anshul@acme.com", cost: 750  },
      { email: "aditya@acme.com", cost: 1380 },
    ]),
  },
  {
    id: "m4", title: "CareCircle API Review",
    description: "Review patient-matching API endpoints before v1.2 release.",
    start: "2026-06-09T14:00:00", durationMinutes: 60, organizer: "rahul@acme.com",
    projectId: "p1", projectName: "CareCircle",
    aiConfidence: 0.94, aiReason: "Mentions 'API' and 'CareCircle'. Attendees are the backend team.",
    totalCost: 2000, isRecurring: true, needsReview: false, status: "attributed",
    attendees: att([
      { email: "rahul@acme.com",  cost: 650 },
      { email: "anshul@acme.com", cost: 500 },
      { email: "vikram@acme.com", cost: 850 },
    ]),
  },
  {
    id: "m5", title: "UI Review",
    description: "Design review of CareCircle dashboard screens before handoff.",
    start: "2026-06-10T15:30:00", durationMinutes: 45, organizer: "sourab@acme.com",
    projectId: "p1", projectName: "CareCircle",
    aiConfidence: 0.72, aiReason: "Designer-led UI review most likely tied to CareCircle dashboard work by attendee history.",
    totalCost: 1253, isRecurring: false, needsReview: false, status: "attributed",
    attendees: att([
      { email: "sourab@acme.com", cost: 338 },
      { email: "divya@acme.com",  cost: 540 },
      { email: "anshul@acme.com", cost: 375 },
    ]),
  },
  {
    id: "m6", title: "Architecture Review",
    description: "System architecture review for backend services and infra.",
    start: "2026-06-11T16:00:00", durationMinutes: 60, organizer: "vikram@acme.com",
    projectId: "p1", projectName: "CareCircle",
    aiConfidence: 0.79, aiReason: "Backend architecture work attributed to CareCircle by attendee overlap with core team.",
    totalCost: 2920, isRecurring: false, needsReview: false, status: "attributed",
    attendees: att([
      { email: "vikram@acme.com", cost: 850 },
      { email: "rahul@acme.com",  cost: 650 },
      { email: "anshul@acme.com", cost: 500 },
      { email: "aditya@acme.com", cost: 920 },
    ]),
  },
  {
    id: "m7", title: "Backend Deployment Planning",
    description: "Plan v1.2 deployment pipeline, rollback strategy, and staging checklist.",
    start: "2026-06-12T10:00:00", durationMinutes: 45, organizer: "rahul@acme.com",
    projectId: "p1", projectName: "CareCircle",
    aiConfidence: 0.69, aiReason: "Deployment planning for CareCircle backend; confidence reduced by generic wording.",
    totalCost: 1501, isRecurring: false, needsReview: true, status: "attributed",
    attendees: att([
      { email: "rahul@acme.com",  cost: 488 },
      { email: "anshul@acme.com", cost: 375 },
      { email: "vikram@acme.com", cost: 638 },
    ]),
  },
  {
    id: "m8", title: "Frontend Sync",
    description: "Frontend standup — project context unclear from title alone.",
    start: "2026-06-09T09:00:00", durationMinutes: 30, organizer: "anshul@acme.com",
    projectId: "p1", projectName: "CareCircle",
    aiConfidence: 0.63, aiReason: "Attendees overlap with CareCircle team but title is ambiguous. Needs human review.",
    totalCost: 730, isRecurring: true, needsReview: true, status: "attributed",
    attendees: att([
      { email: "anshul@acme.com", cost: 250 },
      { email: "kavya@acme.com",  cost: 190 },
      { email: "rohan@acme.com",  cost: 290 },
    ]),
  },
  {
    // DUPLICATE — same attendees & project as m4 (CareCircle API Review)
    id: "m9", title: "Backend Sync",
    description: "Recurring backend coordination call.",
    start: "2026-06-08T08:00:00", durationMinutes: 60, organizer: "rahul@acme.com",
    projectId: "p1", projectName: "CareCircle",
    aiConfidence: 0.74, aiReason: "Recurring backend sync attributed to CareCircle. Near-duplicate of CareCircle API Review.",
    totalCost: 2000, isRecurring: true, needsReview: false, status: "attributed",
    attendees: att([
      { email: "rahul@acme.com",  cost: 650 },
      { email: "anshul@acme.com", cost: 500 },
      { email: "vikram@acme.com", cost: 850 },
    ]),
  },

  // ── Sales CRM (4 meetings, ₹12,048 — 120% of ₹10K budget) ─────────────────

  {
    id: "m10", title: "Sales CRM Client Demo",
    description: "Live CRM demo for prospective enterprise client.",
    start: "2026-06-09T15:00:00", durationMinutes: 45, organizer: "arjun@acme.com",
    projectId: "p2", projectName: "Sales CRM",
    aiConfidence: 0.93, aiReason: "Matches 'crm', 'client', 'demo' Sales CRM keywords.",
    totalCost: 1763, isRecurring: false, needsReview: false, status: "attributed",
    attendees: att([
      { email: "arjun@acme.com",  cost: 525 },
      { email: "priya@acme.com",  cost: 675 },
      { email: "manish@acme.com", cost: 563 },
    ]),
  },
  {
    id: "m11", title: "Sales Pipeline Weekly Review",
    description: "Review pipeline stages, deal velocity, and weekly forecast.",
    start: "2026-06-10T09:30:00", durationMinutes: 60, organizer: "arjun@acme.com",
    projectId: "p2", projectName: "Sales CRM",
    aiConfidence: 0.88, aiReason: "References 'pipeline' and 'sales' CRM keywords.",
    totalCost: 2870, isRecurring: true, needsReview: false, status: "attributed",
    attendees: att([
      { email: "arjun@acme.com",  cost: 700 },
      { email: "priya@acme.com",  cost: 900 },
      { email: "manish@acme.com", cost: 750 },
      { email: "riya@acme.com",   cost: 520 },
    ]),
  },
  {
    id: "m12", title: "CRM Feature Kickoff",
    description: "Kickoff for the new pipeline analytics feature — scope, tasks, timeline.",
    start: "2026-06-11T10:00:00", durationMinutes: 90, organizer: "arjun@acme.com",
    projectId: "p2", projectName: "Sales CRM",
    aiConfidence: 0.91, aiReason: "Direct CRM keyword match; kickoff attendees include PM and engineering.",
    totalCost: 4245, isRecurring: false, needsReview: false, status: "attributed",
    attendees: att([
      { email: "arjun@acme.com",  cost: 1050 },
      { email: "priya@acme.com",  cost: 1350 },
      { email: "rahul@acme.com",  cost: 975  },
      { email: "rohan@acme.com",  cost: 870  },
    ]),
  },
  {
    id: "m13", title: "Sales Strategy Session",
    description: "Quarterly sales strategy with director and regional leads.",
    start: "2026-06-13T14:00:00", durationMinutes: 60, organizer: "deepak@acme.com",
    projectId: "p2", projectName: "Sales CRM",
    aiConfidence: 0.85, aiReason: "Sales strategy meeting with sales director attributed to Sales CRM project.",
    totalCost: 3170, isRecurring: false, needsReview: false, status: "attributed",
    attendees: att([
      { email: "arjun@acme.com",  cost: 700  },
      { email: "manish@acme.com", cost: 750  },
      { email: "riya@acme.com",   cost: 520  },
      { email: "deepak@acme.com", cost: 1200 },
    ]),
  },

  // ── Internal HR (5 meetings, ₹13,981 — 175% of ₹8K budget + cost leakage) ──

  {
    // COST LEAKAGE: 3 engineers (vikram+rahul+anshul) attending an HR meeting
    id: "m14", title: "Quarterly Hiring Roadmap",
    description: "Cross-functional hiring roadmap for Q3 — headcount, interview loops, JDs.",
    start: "2026-06-10T13:00:00", durationMinutes: 90, organizer: "meera@acme.com",
    projectId: "p3", projectName: "Internal HR",
    aiConfidence: 0.87, aiReason: "Matches 'hiring' and 'hr' keywords. Cross-functional attendance noted.",
    totalCost: 6075, isRecurring: false, needsReview: false, status: "attributed",
    attendees: att([
      { email: "meera@acme.com",  cost: 825  },
      { email: "nisha@acme.com",  cost: 900  },
      { email: "priya@acme.com",  cost: 1350 },
      { email: "rahul@acme.com",  cost: 975  }, // leakage
      { email: "anshul@acme.com", cost: 750  }, // leakage
      { email: "vikram@acme.com", cost: 1275 }, // leakage
    ]),
  },
  {
    id: "m15", title: "HR Policy Update",
    description: "Leave policy and appraisal cycle revisions for Q3.",
    start: "2026-06-11T10:00:00", durationMinutes: 45, organizer: "meera@acme.com",
    projectId: "p3", projectName: "Internal HR",
    aiConfidence: 0.90, aiReason: "References 'policy' and 'HR' directly.",
    totalCost: 863, isRecurring: false, needsReview: false, status: "attributed",
    attendees: att([
      { email: "meera@acme.com", cost: 413 },
      { email: "nisha@acme.com", cost: 450 },
    ]),
  },
  {
    id: "m16", title: "Performance Review Discussion",
    description: "Mid-year performance calibration for engineering and design bands.",
    start: "2026-06-12T13:00:00", durationMinutes: 60, organizer: "meera@acme.com",
    projectId: "p3", projectName: "Internal HR",
    aiConfidence: 0.88, aiReason: "Matches 'performance' and 'HR' keywords.",
    totalCost: 1830, isRecurring: false, needsReview: false, status: "attributed",
    attendees: att([
      { email: "meera@acme.com", cost: 550 },
      { email: "priya@acme.com", cost: 900 },
      { email: "pooja@acme.com", cost: 380 },
    ]),
  },
  {
    // COST LEAKAGE: vikram+rahul (engineers) on an HR hiring panel
    id: "m17", title: "Engineer Hiring Panel",
    description: "Technical interview panel for 2 senior backend engineering candidates.",
    start: "2026-06-13T10:00:00", durationMinutes: 90, organizer: "meera@acme.com",
    projectId: "p3", projectName: "Internal HR",
    aiConfidence: 0.84, aiReason: "Matches 'hiring' and 'interview' HR keywords. Panel includes engineering leads.",
    totalCost: 3975, isRecurring: false, needsReview: false, status: "attributed",
    attendees: att([
      { email: "meera@acme.com",  cost: 825  },
      { email: "nisha@acme.com",  cost: 900  },
      { email: "vikram@acme.com", cost: 1275 }, // leakage
      { email: "rahul@acme.com",  cost: 975  }, // leakage
    ]),
  },
  {
    // LEAKAGE: anshul (engineer) attending an HR onboarding review
    id: "m18", title: "Onboarding Process Review",
    description: "Review and improve developer onboarding checklist and tooling setup.",
    start: "2026-06-13T15:00:00", durationMinutes: 45, organizer: "meera@acme.com",
    projectId: "p3", projectName: "Internal HR",
    aiConfidence: 0.84, aiReason: "Matches 'onboarding' HR keyword. Developer attendance explains the cost.",
    totalCost: 1238, isRecurring: false, needsReview: false, status: "attributed",
    attendees: att([
      { email: "meera@acme.com",  cost: 413 },
      { email: "nisha@acme.com",  cost: 450 },
      { email: "anshul@acme.com", cost: 375 }, // leakage
    ]),
  },

  // ── Product Research (3 meetings, ₹7,198 — 60% of ₹12K budget, healthy) ────

  {
    id: "m19", title: "Product Roadmap Review",
    description: "Quarterly roadmap review — themes, priorities, and success metrics.",
    start: "2026-06-13T11:00:00", durationMinutes: 60, organizer: "kiran@acme.com",
    projectId: "p4", projectName: "Product Research",
    aiConfidence: 0.83, aiReason: "Matches 'roadmap' keyword for Product Research project.",
    totalCost: 3190, isRecurring: false, needsReview: false, status: "attributed",
    attendees: att([
      { email: "priya@acme.com",  cost: 900 },
      { email: "kiran@acme.com",  cost: 950 },
      { email: "saurav@acme.com", cost: 620 },
      { email: "divya@acme.com",  cost: 720 },
    ]),
  },
  {
    id: "m20", title: "Product Research Brainstorm",
    description: "Open brainstorm on next-quarter discovery themes and user problem spaces.",
    start: "2026-06-11T14:00:00", durationMinutes: 60, organizer: "priya@acme.com",
    projectId: "p4", projectName: "Product Research",
    aiConfidence: 0.84, aiReason: "Matches 'research' and 'brainstorm' Product Research keywords.",
    totalCost: 2470, isRecurring: false, needsReview: false, status: "attributed",
    attendees: att([
      { email: "priya@acme.com",  cost: 900 },
      { email: "sourab@acme.com", cost: 450 },
      { email: "anshul@acme.com", cost: 500 },
      { email: "saurav@acme.com", cost: 620 },
    ]),
  },
  {
    id: "m21", title: "Discovery Sprint Kickoff",
    description: "Kick off a 2-week discovery sprint — hypothesis, research plan, outputs.",
    start: "2026-06-12T14:00:00", durationMinutes: 45, organizer: "kiran@acme.com",
    projectId: "p4", projectName: "Product Research",
    aiConfidence: 0.86, aiReason: "Matches 'sprint' and 'discovery' keywords for Product Research.",
    totalCost: 1538, isRecurring: false, needsReview: false, status: "attributed",
    attendees: att([
      { email: "kiran@acme.com",  cost: 713 },
      { email: "saurav@acme.com", cost: 465 },
      { email: "tanya@acme.com",  cost: 360 },
    ]),
  },

  // ── Unclassified / Shadow project (4 meetings, ₹5,921) ─────────────────────

  {
    // SHADOW PROJECT: "AI Hiring Assistant" — 3 meetings, no matching project
    id: "m22", title: "AI Hiring Assistant Brainstorm",
    description: "Idea session for an internal AI-powered hiring assistant tool.",
    start: "2026-06-10T11:00:00", durationMinutes: 60, organizer: "meera@acme.com",
    projectId: null, projectName: "Unclassified",
    aiConfidence: 0.52,
    aiReason: "'AI Hiring Assistant' does not match any official project. Possible shadow project forming.",
    totalCost: 1700, isRecurring: false, needsReview: true, status: "unclassified",
    attendees: att([
      { email: "meera@acme.com",  cost: 550 },
      { email: "rahul@acme.com",  cost: 650 },
      { email: "anshul@acme.com", cost: 500 },
    ]),
  },
  {
    id: "m23", title: "AI Tool Prototype Discussion",
    description: "Design session for the AI hiring tool prototype — scope and tech stack.",
    start: "2026-06-11T11:00:00", durationMinutes: 60, organizer: "meera@acme.com",
    projectId: null, projectName: "Unclassified",
    aiConfidence: 0.48,
    aiReason: "Second meeting in an 'AI Hiring Tool' thread. No official project matches; shadow project suspected.",
    totalCost: 1800, isRecurring: false, needsReview: true, status: "unclassified",
    attendees: att([
      { email: "meera@acme.com", cost: 550 },
      { email: "rahul@acme.com", cost: 650 },
      { email: "nisha@acme.com", cost: 600 },
    ]),
  },
  {
    id: "m24", title: "AI Hiring Tool Feasibility",
    description: "Feasibility and effort estimate for the AI hiring automation tool.",
    start: "2026-06-12T11:00:00", durationMinutes: 45, organizer: "meera@acme.com",
    projectId: null, projectName: "Unclassified",
    aiConfidence: 0.44,
    aiReason: "Third AI Hiring Tool meeting — confirms shadow project pattern. Needs project creation or formal closure.",
    totalCost: 1621, isRecurring: false, needsReview: true, status: "unclassified",
    attendees: att([
      { email: "meera@acme.com", cost: 413 },
      { email: "rahul@acme.com", cost: 488 },
      { email: "rohan@acme.com", cost: 435 },
      { email: "kavya@acme.com", cost: 285 },
    ]),
  },
  {
    id: "m25", title: "Random Catchup",
    description: "Informal team catchup — no agenda provided.",
    start: "2026-06-12T16:00:00", durationMinutes: 30, organizer: "anshul@acme.com",
    projectId: null, projectName: "Unclassified",
    aiConfidence: 0.31,
    aiReason: "Generic title with no project signal. No keywords match any known project.",
    totalCost: 800, isRecurring: false, needsReview: true, status: "unclassified",
    attendees: att([
      { email: "anshul@acme.com", cost: 250 },
      { email: "sourab@acme.com", cost: 225 },
      { email: "rahul@acme.com",  cost: 325 },
    ]),
  },
];

export const anomalies: Anomaly[] = [
  {
    id: "a1", type: "Budget Overrun", severity: "high",
    message: "Internal HR has spent ₹13,981 against a ₹8,000 weekly budget (175%). Engineer attendance inflates cost.",
    project: "Internal HR", estimatedLoss: 5981,
    suggestedAction: "Limit engineering attendance in HR meetings. Move status updates async.",
    resolved: false, createdAt: "2026-06-13T08:00:00",
  },
  {
    id: "a2", type: "Budget Overrun", severity: "high",
    message: "CareCircle has spent ₹23,359 against a ₹15,000 weekly budget (156%). Sprint Planning alone cost ₹6,450.",
    project: "CareCircle", estimatedLoss: 8359,
    suggestedAction: "Consolidate recurring backend meetings. Reduce Sprint Planning attendees.",
    resolved: false, createdAt: "2026-06-13T08:00:00",
  },
  {
    id: "a3", type: "Budget Overrun", severity: "medium",
    message: "Sales CRM has spent ₹12,048 against a ₹10,000 weekly budget (120%).",
    project: "Sales CRM", estimatedLoss: 2048,
    suggestedAction: "Move weekly pipeline review to bi-weekly.",
    resolved: false, createdAt: "2026-06-13T08:00:00",
  },
  {
    id: "a4", type: "Hidden Cost Leakage", severity: "high",
    message: "Engineering employees (Vikram, Rahul, Anshul) consumed ₹5,625 in Internal HR meetings — unusually high for a low-priority project.",
    project: "Internal HR", estimatedLoss: 5625,
    suggestedAction: "Replace engineering presence in HR syncs with async document reviews.",
    resolved: false, createdAt: "2026-06-13T08:00:00",
  },
  {
    id: "a5", type: "Duplicate Meeting", severity: "medium",
    message: "'Backend Sync' and 'CareCircle API Review' share the same attendees, recurrence, and project — effectively the same meeting held twice.",
    project: "CareCircle", estimatedLoss: 8000,
    suggestedAction: "Merge into a single recurring backend coordination call.",
    resolved: false, createdAt: "2026-06-13T08:00:00",
  },
  {
    id: "a6", type: "Expensive Meeting", severity: "medium",
    message: "'CareCircle Sprint Planning' cost ₹6,450 for a single 90-minute session — the most expensive meeting this week.",
    project: "CareCircle", estimatedLoss: 0,
    suggestedAction: "Limit Sprint Planning to core team (PM + Tech Lead). Async pre-read for others.",
    resolved: false, createdAt: "2026-06-13T08:00:00",
  },
  {
    id: "a7", type: "Shadow Project", severity: "medium",
    message: "'AI Hiring Assistant' appeared in 3 consecutive meetings (₹5,121 total) but has no matching official project.",
    project: null, estimatedLoss: 5121,
    suggestedAction: "Create a formal project or reassign these meetings. Untracked work inflates Unclassified spend.",
    resolved: false, createdAt: "2026-06-13T08:00:00",
  },
  {
    id: "a8", type: "Low AI Confidence", severity: "low",
    message: "7 meetings were attributed below 70% confidence and need human review.",
    project: null, estimatedLoss: 0,
    suggestedAction: "Open the Review Queue to confirm or correct project attribution.",
    resolved: false, createdAt: "2026-06-13T08:00:00",
  },
];

export const recommendations: Recommendation[] = [
  {
    id: "r1", project: "CareCircle",
    title: "Reduce Sprint Planning attendee count",
    reason: "CareCircle Sprint Planning costs ₹6,450 per session (₹25,800/mo). Limiting to PM + Tech Lead + 1 per team saves 60%.",
    estimatedMonthlySaving: 15480, priority: "high", status: "open",
  },
  {
    id: "r2", project: "Internal HR",
    title: "Replace engineer attendance with async reviews",
    reason: "Engineering employees spent ₹5,625 in HR meetings this week (₹22,500/mo). Async document reviews eliminate this cost.",
    estimatedMonthlySaving: 22500, priority: "high", status: "open",
  },
  {
    id: "r3", project: "CareCircle",
    title: "Merge Backend Sync and API Review",
    reason: "Both recurring meetings share the same attendees and cover backend coordination — merge saves one meeting per week.",
    estimatedMonthlySaving: 8000, priority: "high", status: "open",
  },
  {
    id: "r4", project: "Sales CRM",
    title: "Move pipeline review to bi-weekly",
    reason: "Weekly pipeline reviews cost ₹2,870/week. Bi-weekly cadence maintains visibility at half the cost.",
    estimatedMonthlySaving: 5740, priority: "medium", status: "open",
  },
  {
    id: "r5", project: null,
    title: "Register 'AI Hiring Assistant' as an official project",
    reason: "3 untracked meetings have accumulated ₹5,121 in costs. Formalising the project prevents budget leakage.",
    estimatedMonthlySaving: 0, priority: "low", status: "open",
  },
];

/* ── Derived dashboard aggregates ──────────────────────────────────────────── */

export function projectCostData() {
  return projects
    .filter((p) => p.name !== "Unclassified")
    .map((p) => ({ name: p.name, cost: p.spent, budget: p.budget, priority: p.priority }))
    .sort((a, b) => b.cost - a.cost);
}

export function budgetUsageData() {
  return projects
    .filter((p) => p.budget > 0)
    .map((p) => ({
      name: p.name,
      used: Math.round((p.spent / p.budget) * 100),
      spent: p.spent,
      budget: p.budget,
    }))
    .sort((a, b) => b.used - a.used);
}

export function departmentCostData() {
  const map = new Map<string, number>();
  for (const m of meetings) {
    for (const a of m.attendees) {
      const emp = employees.find((e) => e.email === a.email);
      const dept = emp?.department ?? "Other";
      map.set(dept, (map.get(dept) ?? 0) + a.costContribution);
    }
  }
  return Array.from(map.entries())
    .map(([name, cost]) => ({ name, cost: Math.round(cost) }))
    .sort((a, b) => b.cost - a.cost);
}

export function dailyTrendData() {
  const map = new Map<string, number>();
  for (const m of meetings) {
    const day = m.start.slice(0, 10);
    map.set(day, (map.get(day) ?? 0) + m.totalCost);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, cost]) => ({ day, cost }));
}

export function summary() {
  const totalCost = meetings.reduce((s, m) => s + m.totalCost, 0);
  const lowConfidence = meetings.filter((m) => m.aiConfidence < 0.7).length;
  const unclassified = meetings.filter((m) => m.projectId === null).length;
  const mostExpensive = [...meetings].sort((a, b) => b.totalCost - a.totalCost)[0];
  const potentialSavings = recommendations.reduce((s, r) => s + r.estimatedMonthlySaving, 0);
  const openAnomalies = anomalies.filter((a) => !a.resolved).length;
  return {
    totalCost,
    lowConfidence,
    unclassified,
    mostExpensive,
    potentialSavings,
    openAnomalies,
    meetingCount: meetings.length,
    employeeCount: employees.length,
  };
}

export function reviewQueue() {
  return meetings.filter((m) => m.needsReview);
}
