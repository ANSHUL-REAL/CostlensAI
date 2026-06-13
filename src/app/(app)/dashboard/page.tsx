"use client";

import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  CircleHelp,
  IndianRupee,
  ScanSearch,
  TrendingDown,
  Video,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { Button, Card, CardBody, CardHeader, PageSection } from "@/components/ui";
import { ProjectCostBar } from "@/components/charts/ProjectCostBar";
import { DailyTrendLine } from "@/components/charts/DailyTrendLine";
import { DeptCostChart } from "@/components/charts/DeptCostChart";
import { BudgetUsageList } from "@/components/BudgetUsageList";
import { AnomalyCard } from "@/components/AnomalyCard";
import { MeetingTable } from "@/components/MeetingTable";
import { CostValue } from "@/components/CostValue";
import { inr } from "@/lib/format";
import { useAppData } from "@/lib/use-app-data";

export default function DashboardPage() {
  const { data, loading, error, reload } = useAppData();

  async function runAttribution() {
    await fetch("/api/ai/attribute-meetings", { method: "POST" });
    await reload();
  }

  if (loading && !data) {
    return <div className="p-6 text-sm text-muted">Loading dashboard...</div>;
  }

  if (error || !data) {
    return <div className="p-6 text-sm text-danger-ink">{error ?? "Failed to load dashboard."}</div>;
  }

  const stats = data.summary;
  const topAnomalies = data.anomalies.slice(0, 3);
  const recentMeetings = [...data.meetings].sort((left, right) => right.totalCost - left.totalCost).slice(0, 6);

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Dashboard"
        subtitle="Turn meeting activity into project cost, review queue, savings signals, and traceable HR spend intelligence."
        action={
          <Button variant="primary" size="md" onClick={runAttribution}>
            Run AI Attribution
          </Button>
        }
      />

      <div className="space-y-6 p-6">
        <section className="panel panel-grid panel-cut animate-rise overflow-hidden px-6 py-6">
          <div className="grid gap-8 xl:grid-cols-[1.4fr_0.75fr]">
            <div className="space-y-5">
              <div className="command-label">HR Cost Intelligence / Live</div>
              <div className="max-w-4xl font-display text-[clamp(4rem,10vw,7.5rem)] font-bold uppercase leading-[0.82] tracking-[-0.08em] text-ink">
                Meetings.
                <br />
                <span className="text-brand">Measured.</span>
              </div>
              <p className="max-w-2xl text-base text-body">
                CostLens maps calendar activity to projects, surfaces anomalies, and converts meeting time into budget action for finance, HR, and leadership.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/calendar-import">
                  <Button variant="primary" size="md">
                    Import Calendar <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/reports">
                  <Button variant="secondary" size="md">
                    Export Reports
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-5 border-l border-line/70 pl-0 xl:pl-6">
              <div className="flex items-center justify-between">
                <div className="command-label">MeetCost / INR</div>
                <div className="number-grid text-success">Syncing</div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-body">This week the system is tracking:</div>
                  <div className="mt-3 space-y-3">
                    {[
                      `${stats.meetingCount} meetings analyzed`,
                      `${stats.lowConfidence} low-confidence assignments`,
                      `${stats.openAnomalies} active anomalies`,
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-3 border border-line/70 bg-white/[0.03] px-3 py-3 text-sm text-ink">
                        <span className="h-2 w-2 bg-brand" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border border-line/70 bg-white/[0.03] px-4 py-4">
                  <div className="command-label">Potential Monthly Savings</div>
                  <div className="mt-3 font-display text-5xl font-semibold uppercase tracking-[-0.05em] text-success-ink">
                    {inr(stats.potentialSavings)}
                  </div>
                  <p className="mt-2 text-sm text-body">
                    Recommendations are based on duplicate cadence, budget overrun signals, and costly attendee patterns.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
          <KpiCard
            label="Total HR Meeting Cost"
            value={<CostValue amount={stats.totalCost} />}
            hint={`This week · ${stats.meetingCount} meetings`}
            tone="brand"
            icon={<IndianRupee className="h-4 w-4" />}
          />
          <KpiCard
            label="Low Confidence Meetings"
            value={stats.lowConfidence}
            hint="Assignments below 70% confidence"
            tone="warning"
            icon={<CircleHelp className="h-4 w-4" />}
            footer={
              <Link href="/review-queue" className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand hover:text-ink">
                Open review queue <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <KpiCard
            label="Unclassified Meetings"
            value={stats.unclassified}
            hint="No project assignment yet"
            tone="danger"
            icon={<Boxes className="h-4 w-4" />}
          />
          <KpiCard
            label="Detected Anomalies"
            value={stats.openAnomalies}
            hint="Risk patterns in current data"
            tone="success"
            icon={<ScanSearch className="h-4 w-4" />}
            footer={
              <Link href="/anomalies" className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand hover:text-ink">
                View anomalies <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
        </div>

        {stats.mostExpensive ? (
          <div className="panel animate-rise flex items-center gap-4 border border-warning/30 px-5 py-4">
            <Video className="h-5 w-5 shrink-0 text-warning-ink" />
            <div className="min-w-0 flex-1">
              <div className="command-label">Most expensive meeting</div>
              <p className="mt-2 truncate text-lg font-semibold text-ink">{stats.mostExpensive.title}</p>
              <p className="text-sm text-body">
                {stats.mostExpensive.projectName} · {stats.mostExpensive.durationMinutes} min · {stats.mostExpensive.attendees.length} attendees
              </p>
            </div>
            <CostValue amount={stats.mostExpensive.totalCost} className="font-display text-4xl font-semibold uppercase text-ink" />
          </div>
        ) : null}

        <div className="grid gap-6 2xl:grid-cols-2">
          <Card>
            <CardHeader title="Project Cost Matrix" subtitle="Cost vs weekly budget across active projects" />
            <CardBody>
              <ProjectCostBar data={data.projectCostData} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Daily Cost Trace" subtitle="Total HR meeting cost per day" />
            <CardBody>
              <DailyTrendLine data={data.dailyTrendData} />
            </CardBody>
          </Card>
        </div>

        <div className="grid gap-6 2xl:grid-cols-2">
          <Card>
            <CardHeader title="Budget Usage" subtitle="Spent versus weekly project budgets" />
            <CardBody>
              <BudgetUsageList data={data.budgetUsageData} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Department Cost Distribution" subtitle="Attendee contribution by department" />
            <CardBody>
              <DeptCostChart data={data.departmentCostData} />
            </CardBody>
          </Card>
        </div>

        <PageSection
          title="Recent Anomalies"
          description={`${stats.openAnomalies} unresolved issues detected this week`}
          action={
            <Link href="/anomalies">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          }
        >
          <div className="space-y-3">
            {topAnomalies.length > 0 ? (
              topAnomalies.map((anomaly) => <AnomalyCard key={anomaly.id} anomaly={anomaly} />)
            ) : (
              <div className="panel px-4 py-5 text-sm text-muted">No anomalies yet. Import meetings to begin detection.</div>
            )}
          </div>
        </PageSection>

        <PageSection
          title="Top Meetings by Cost"
          description="Sorted by total HR cost this week"
          action={
            <Link href="/meetings">
              <Button variant="ghost" size="sm">
                All meetings <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          }
        >
          <Card>
            {recentMeetings.length > 0 ? (
              <MeetingTable meetings={recentMeetings} compact />
            ) : (
              <div className="p-4 text-sm text-muted">No meetings imported yet.</div>
            )}
          </Card>
        </PageSection>
      </div>
    </div>
  );
}
