"use client";

import * as React from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardBody, CardHeader, Button, Badge, Select } from "@/components/ui";
import { ConfidenceBadge } from "@/components/StatusBadges";
import { CostValue } from "@/components/CostValue";
import { CheckCircle2, CircleHelp, Users, Clock } from "lucide-react";
import { durationLabel, formatDateTime } from "@/lib/format";
import { useAppData } from "@/lib/use-app-data";

export default function ReviewQueuePage() {
  const { data, loading, error, reload } = useAppData();
  const queue = data?.reviewQueue ?? [];
  const projects = data?.projects ?? [];
  const [assignments, setAssign] = React.useState<Record<string, string>>({});
  const [reviewed,    setReviewed] = React.useState<Set<string>>(new Set());

  async function saveReview(id: string) {
    if (!assignments[id]) return;
    const selectedProject = projects.find((project) => project.name === assignments[id]);
    if (!selectedProject) return;

    await fetch("/api/review-queue", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meetingId: id,
        projectId: selectedProject.id,
      }),
    });

    setReviewed(prev => new Set([...prev, id]));
    await reload();
  }

  const pending = queue.filter(m => !reviewed.has(m.id));

  if (loading && !data) {
    return <div className="p-6 text-sm text-muted">Loading review queue…</div>;
  }

  if (error) {
    return <div className="p-6 text-sm text-danger-ink">{error}</div>;
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Review Queue"
        subtitle="Meetings attributed with less than 70% confidence — confirm or reassign"
        showDateRange={false}
      />

      <div className="space-y-5 p-6">

        {/* Summary bar */}
        <div className="flex items-center gap-4 rounded-card border border-line bg-surface p-4">
          <CircleHelp className="h-5 w-5 text-warning" />
          <div>
            <span className="text-sm font-semibold text-ink">{pending.length} meetings</span>
            <span className="text-sm text-muted"> need review</span>
          </div>
          <div className="ml-auto flex items-center gap-2 text-sm text-muted">
            <CheckCircle2 className="h-4 w-4 text-success" />
            {reviewed.size} reviewed this session
          </div>
        </div>

        {pending.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-line bg-surface py-16 text-center">
            <CheckCircle2 className="mb-3 h-10 w-10 text-success" />
            <p className="text-sm font-semibold text-ink">All meetings reviewed</p>
            <p className="mt-1 text-xs text-muted">Dashboard has been updated with your corrections.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map(m => (
              <Card key={m.id}>
                <CardHeader
                  title={m.title}
                  subtitle={`${formatDateTime(m.start)} · ${durationLabel(m.durationMinutes)} · ${m.attendees.length} attendees`}
                  action={<ConfidenceBadge value={m.aiConfidence} />}
                />
                <CardBody className="space-y-4">
                  <div className="grid gap-4 lg:grid-cols-2">
                    {/* AI reason */}
                    <div className="rounded-lg border border-line bg-bone/50 p-3">
                      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">AI Attribution</div>
                      <div className="flex items-center gap-2">
                        <Badge tone={m.projectId ? "brand" : "neutral"}>{m.projectName}</Badge>
                      </div>
                      <p className="mt-2 text-xs text-muted">{m.aiReason}</p>
                    </div>

                    {/* Attendees */}
                    <div className="rounded-lg border border-line bg-bone/50 p-3">
                      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">Attendees</div>
                      <div className="space-y-1">
                        {m.attendees.map(a => (
                          <div key={a.email} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                              <Users className="h-3 w-3 text-muted" />
                              <span className="text-body">{a.name}</span>
                            </div>
                            <CostValue amount={a.costContribution} individual />
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center justify-between border-t border-line pt-2 text-xs font-semibold">
                        <span className="text-muted">Total cost</span>
                        <CostValue amount={m.totalCost} className="text-ink" />
                      </div>
                    </div>
                  </div>

                  {/* Reassignment control */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Select
                        value={assignments[m.id] ?? ""}
                        onChange={e => setAssign(prev => ({ ...prev, [m.id]: e.target.value }))}
                      >
                        <option value="">— Confirm or reassign project —</option>
                        {projects.map(p => (
                          <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                      </Select>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={!assignments[m.id]}
                      onClick={() => saveReview(m.id)}
                    >
                      <CheckCircle2 className="h-4 w-4" /> Save & mark reviewed
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
