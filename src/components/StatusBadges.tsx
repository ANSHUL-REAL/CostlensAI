import { Badge } from "./ui";
import { CheckCircle2, Sparkles, AlertTriangle, CircleHelp } from "lucide-react";
import type { AnomalySeverity, Meeting, Priority } from "@/lib/types";
import { confidencePct } from "@/lib/format";

export function ConfidenceBadge({ value }: { value: number }) {
  if (value >= 0.85) return <Badge tone="success">{confidencePct(value)}</Badge>;
  if (value >= 0.7) return <Badge tone="warning">{confidencePct(value)}</Badge>;
  return (
    <Badge tone="danger">
      <AlertTriangle className="h-3 w-3" /> {confidencePct(value)}
    </Badge>
  );
}

export function MeetingStatusBadge({ meeting }: { meeting: Meeting }) {
  if (meeting.needsReview)
    return (
      <Badge tone="warning">
        <CircleHelp className="h-3 w-3" /> Low Confidence
      </Badge>
    );
  if (meeting.status === "reviewed")
    return (
      <Badge tone="brand">
        <CheckCircle2 className="h-3 w-3" /> Reviewed
      </Badge>
    );
  if (meeting.status === "unclassified")
    return <Badge tone="neutral">Unclassified</Badge>;
  return (
    <Badge tone="success">
      <Sparkles className="h-3 w-3" /> Auto Attributed
    </Badge>
  );
}

export function SeverityBadge({ severity }: { severity: AnomalySeverity }) {
  if (severity === "high")
    return (
      <Badge tone="danger">
        <AlertTriangle className="h-3 w-3" /> High Risk
      </Badge>
    );
  if (severity === "medium") return <Badge tone="warning">Medium</Badge>;
  return <Badge tone="neutral">Low</Badge>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  if (priority === "High") return <Badge tone="danger">High</Badge>;
  if (priority === "Medium") return <Badge tone="brand">Medium</Badge>;
  if (priority === "Low") return <Badge tone="neutral">Low</Badge>;
  return <Badge tone="neutral">—</Badge>;
}
