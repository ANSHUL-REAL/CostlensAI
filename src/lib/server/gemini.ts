import "server-only";

import type { Meeting, Project } from "@/lib/types";
import { attributeMeetingFallback } from "./app-data";

type GeminiAttributionResult = {
  meetingId: string;
  projectName: string;
  confidence: number;
  reason: string;
  needsReview: boolean;
};

type NormalizedAttribution = {
  id: string;
  projectId: string | null;
  projectName: string;
  confidence: number;
  reason: string;
  needsReview: boolean;
  status: "attributed" | "unclassified";
};

function stripCodeFence(text: string) {
  return text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
}

function normalizeResult(
  result: GeminiAttributionResult,
  meetingsById: Map<string, Meeting>,
  projects: Project[],
): NormalizedAttribution | null {
  const meeting = meetingsById.get(result.meetingId);
  if (!meeting) {
    return null;
  }

  const fallback = attributeMeetingFallback(meeting, projects);
  const project =
    projects.find((item) => item.name.toLowerCase() === result.projectName.toLowerCase()) ?? null;
  const confidence = Math.max(0.35, Math.min(0.99, Number(result.confidence ?? fallback.confidence)));
  const isUnclassified = !project || project.name === "Unclassified";

  return {
    id: meeting.id,
    projectId: isUnclassified ? null : project.id,
    projectName: isUnclassified ? "Unclassified" : project.name,
    confidence,
    reason: result.reason?.trim() || fallback.reason,
    needsReview: Boolean(result.needsReview) || confidence < 0.7,
    status: isUnclassified ? "unclassified" : ("attributed" as const),
  } satisfies NormalizedAttribution;
}

export async function attributeMeetingsWithGemini(meetings: Meeting[], projects: Project[]) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return meetings.map((meeting) => {
      const fallback = attributeMeetingFallback(meeting, projects);
      return {
        id: meeting.id,
        projectId: fallback.projectId,
        projectName: fallback.projectName,
        confidence: fallback.confidence,
        reason: fallback.reason,
        needsReview: fallback.needsReview,
        status: fallback.status,
      } satisfies NormalizedAttribution;
    });
  }

  const prompt = [
    "You are assigning internal meetings to a single business project.",
    "Use only the provided projects. If none match, return Unclassified.",
    "Return strict JSON as an array with fields: meetingId, projectName, confidence, reason, needsReview.",
    "Confidence must be between 0 and 1.",
    "",
    `Projects: ${JSON.stringify(projects.map((project) => ({
      name: project.name,
      description: project.description,
      keywords: project.keywords,
      owner: project.owner,
    })))}`,
    "",
    `Meetings: ${JSON.stringify(meetings.map((meeting) => ({
      meetingId: meeting.id,
      title: meeting.title,
      description: meeting.description,
      organizer: meeting.organizer,
      durationMinutes: meeting.durationMinutes,
      attendeeNames: meeting.attendees.map((attendee) => attendee.name),
      attendeeEmails: meeting.attendees.map((attendee) => attendee.email),
    })))}`,
  ].join("\n");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed (${response.status})`);
  }

  const payload = await response.json();
  const rawText = payload?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (typeof rawText !== "string") {
    throw new Error("Gemini did not return attribution output.");
  }

  const parsed = JSON.parse(stripCodeFence(rawText)) as GeminiAttributionResult[];
  const meetingsById = new Map(meetings.map((meeting) => [meeting.id, meeting]));
  const normalized = parsed
    .map((item) => normalizeResult(item, meetingsById, projects))
    .filter((item): item is NormalizedAttribution => item !== null);

  const coveredIds = new Set(normalized.map((item) => item.id));
  const fallbackRows = meetings
    .filter((meeting) => !coveredIds.has(meeting.id))
    .map((meeting) => {
      const fallback = attributeMeetingFallback(meeting, projects);
      return {
        id: meeting.id,
        projectId: fallback.projectId,
        projectName: fallback.projectName,
        confidence: fallback.confidence,
        reason: fallback.reason,
        needsReview: fallback.needsReview,
        status: fallback.status,
      } satisfies NormalizedAttribution;
    });

  return [...normalized, ...fallbackRows];
}
