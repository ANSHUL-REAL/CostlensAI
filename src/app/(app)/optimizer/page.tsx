"use client";

import { CheckCircle2, Sparkles, TrendingDown, X } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge, Button, Card, CardBody, CardHeader } from "@/components/ui";
import { SeverityBadge } from "@/components/StatusBadges";
import { inr } from "@/lib/format";
import { useAppData } from "@/lib/use-app-data";
import { usePersistentSet } from "@/lib/use-persistent-set";

export default function OptimizerPage() {
  const { data, loading, error, reload } = useAppData();
  const recommendations = data?.recommendations ?? [];
  const dismissed = usePersistentSet("costlens-dismissed-recommendations");
  const applied = usePersistentSet("costlens-applied-recommendations");

  const visibleRecommendations = recommendations.filter((recommendation) => !dismissed.values.has(recommendation.id));
  const total = visibleRecommendations
    .filter((recommendation) => !applied.values.has(recommendation.id))
    .reduce((sum, recommendation) => sum + recommendation.estimatedMonthlySaving, 0);

  if (loading && !data) {
    return <div className="p-6 text-sm text-muted">Loading recommendations...</div>;
  }

  if (error || !data) {
    return <div className="p-6 text-sm text-danger-ink">{error ?? "Failed to load recommendations."}</div>;
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="AI Optimizer"
        subtitle="Actionable savings moves generated from the current meeting cost graph."
        showDateRange={false}
        action={
          <Button
            variant="primary"
            size="sm"
            onClick={async () => {
              dismissed.clear();
              applied.clear();
              await reload();
            }}
          >
            <Sparkles className="h-4 w-4" /> Refresh signals
          </Button>
        }
      />

      <div className="space-y-6 p-6">
        <div className="panel flex items-center gap-4 border border-success/25 px-5 py-4">
          <TrendingDown className="h-6 w-6 shrink-0 text-success-ink" />
          <div>
            <div className="command-label">Potential monthly savings</div>
            <div className="mt-2 font-display text-5xl font-semibold uppercase tracking-[-0.05em] text-success-ink">
              {inr(total)}
            </div>
          </div>
          <div className="ml-auto text-right text-xs uppercase tracking-[0.14em] text-muted">
            Based on {recommendations.length} recommendations
            <br />
            from live meeting data
          </div>
        </div>

        <div className="space-y-4">
          {visibleRecommendations.map((recommendation) => (
            <Card key={recommendation.id} className={applied.values.has(recommendation.id) ? "opacity-60" : ""}>
              <CardHeader
                title={recommendation.title}
                subtitle={`Project: ${recommendation.project ?? "General"}`}
                action={
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={recommendation.priority} />
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-success-ink">
                      {inr(recommendation.estimatedMonthlySaving)}/mo
                    </span>
                  </div>
                }
              />
              <CardBody className="flex items-start gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    <p className="text-sm text-body">{recommendation.reason}</p>
                  </div>
                </div>
                {applied.values.has(recommendation.id) ? (
                  <Badge tone="success" className="shrink-0">
                    <CheckCircle2 className="h-3 w-3" /> Applied
                  </Badge>
                ) : (
                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" variant="primary" onClick={() => applied.add(recommendation.id)}>
                      Apply
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => dismissed.add(recommendation.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>

        {visibleRecommendations.length === 0 ? (
          <div className="panel py-16 text-center">
            <Sparkles className="mx-auto mb-3 h-8 w-8 text-muted" />
            <p className="font-display text-xl font-semibold uppercase tracking-[0.14em] text-ink">All recommendations actioned</p>
            <Button variant="secondary" size="sm" className="mt-4" onClick={dismissed.clear}>
              Reset dismissed
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
