"use client";

import * as React from "react";
import { AlertTriangle, BarChart2, CheckCircle2, Download, FileText } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button, Card, CardBody } from "@/components/ui";
import { CostValue } from "@/components/CostValue";
import { useAppData } from "@/lib/use-app-data";

const REPORTS = [
  {
    id: "project-cost",
    icon: <BarChart2 className="h-5 w-5 text-brand" />,
    title: "Project Cost Report",
    description: "Projects with total meeting cost, budget, utilization, and overrun status.",
  },
  {
    id: "meeting-cost",
    icon: <FileText className="h-5 w-5 text-body" />,
    title: "Meeting Cost Report",
    description: "Complete meeting ledger with attribution, confidence, and attendee breakdown.",
  },
  {
    id: "anomalies",
    icon: <AlertTriangle className="h-5 w-5 text-warning" />,
    title: "Anomaly Report",
    description: "Every detected cost issue with severity, estimated loss, and suggested action.",
  },
  {
    id: "finance-summary",
    icon: <CheckCircle2 className="h-5 w-5 text-success" />,
    title: "Finance Summary Report",
    description: "Executive summary of cost, risk, and savings opportunity for leadership review.",
  },
];

export default function ReportsPage() {
  const { data, loading, error } = useAppData();
  const [downloading, setDownloading] = React.useState<string | null>(null);

  if (loading && !data) {
    return <div className="p-6 text-sm text-muted">Loading reports...</div>;
  }

  if (error || !data) {
    return <div className="p-6 text-sm text-danger-ink">{error ?? "Failed to load reports."}</div>;
  }

  async function download(reportId: string) {
    setDownloading(reportId);

    try {
      const response = await fetch(`/api/reports/${reportId}`);

      if (!response.ok) {
        throw new Error(`Export failed (${response.status})`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${reportId}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(null);
    }
  }

  const stats = data.summary;

  return (
    <div className="flex flex-col">
      <PageHeader title="Reports" subtitle="Download live CSV exports for finance, audit, and project review." />

      <div className="space-y-6 p-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="panel panel-grid px-4 py-4">
            <div className="command-label">Total HR Meeting Cost</div>
            <div className="mt-3 font-display text-5xl font-semibold uppercase tracking-[-0.05em] text-ink">
              <CostValue amount={stats.totalCost} />
            </div>
          </div>
          <div className="panel panel-grid px-4 py-4">
            <div className="command-label">Budget Overruns</div>
            <div className="mt-3 font-display text-5xl font-semibold uppercase tracking-[-0.05em] text-danger-ink">
              {data.projects.filter((project) => project.budget > 0 && project.spent > project.budget).length}
            </div>
          </div>
          <div className="panel panel-grid px-4 py-4">
            <div className="command-label">Potential Savings</div>
            <div className="mt-3 font-display text-5xl font-semibold uppercase tracking-[-0.05em] text-success-ink">
              <CostValue amount={stats.potentialSavings} />
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {REPORTS.map((report) => (
            <Card key={report.id}>
              <CardBody className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-line/70 bg-white/[0.03]">
                  {report.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-2xl font-semibold uppercase tracking-[0.08em] text-ink">
                    {report.title}
                  </div>
                  <div className="mt-2 text-sm text-body">{report.description}</div>
                  <div className="mt-3 text-[11px] uppercase tracking-[0.16em] text-muted">
                    {report.id === "project-cost"
                      ? `${data.projects.length} projects`
                      : report.id === "meeting-cost"
                        ? `${data.meetings.length} meetings`
                        : report.id === "anomalies"
                          ? `${data.anomalies.length} anomalies`
                          : "Leadership summary"}{" "}
                    · CSV format
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={downloading === report.id}
                  onClick={() => download(report.id)}
                  className="shrink-0"
                >
                  <Download className="h-4 w-4" />
                  {downloading === report.id ? "Exporting..." : "Export CSV"}
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>

        <p className="text-xs uppercase tracking-[0.15em] text-muted">
          Exported files respect your current role. Exact hourly rates remain hidden unless you are signed in as Admin or Finance Manager.
        </p>
      </div>
    </div>
  );
}
