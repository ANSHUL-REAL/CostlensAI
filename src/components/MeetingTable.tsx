"use client";

import { Table, Th, Td, Tr } from "./ui";
import { ConfidenceBadge, MeetingStatusBadge } from "./StatusBadges";
import { CostValue } from "./CostValue";
import { formatDateTime, durationLabel } from "@/lib/format";
import type { Meeting } from "@/lib/types";

export function MeetingTable({
  meetings,
  compact = false,
}: {
  meetings: Meeting[];
  compact?: boolean;
}) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Meeting</Th>
          {!compact && <Th>Date</Th>}
          <Th>Project</Th>
          <Th>Confidence</Th>
          {!compact && <Th>Status</Th>}
          <Th className="text-right">Cost</Th>
        </tr>
      </thead>
      <tbody>
        {meetings.map((m) => (
          <Tr key={m.id}>
            <Td>
              <div className="font-medium text-ink">{m.title}</div>
              <div className="mt-0.5 text-xs text-muted">
                {durationLabel(m.durationMinutes)} · {m.attendees.length} attendees
                {m.isRecurring ? " · recurring" : ""}
              </div>
            </Td>
            {!compact && <Td className="whitespace-nowrap text-muted">{formatDateTime(m.start)}</Td>}
            <Td>
              <span className={m.projectId ? "text-body" : "text-muted"}>{m.projectName}</span>
            </Td>
            <Td>
              <ConfidenceBadge value={m.aiConfidence} />
            </Td>
            {!compact && (
              <Td>
                <MeetingStatusBadge meeting={m} />
              </Td>
            )}
            <Td className="text-right font-medium text-ink">
              <CostValue amount={m.totalCost} />
            </Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
}
