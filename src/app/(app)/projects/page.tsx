"use client";

import * as React from "react";
import { Pencil, Plus, Tag, X } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge, Button, Card, Input, Label, ProgressBar, Select, Table, Td, Th, Tr } from "@/components/ui";
import { PriorityBadge } from "@/components/StatusBadges";
import { CostValue } from "@/components/CostValue";
import { pct } from "@/lib/format";
import { useAppData } from "@/lib/use-app-data";

type ProjectFormState = {
  id?: string;
  name: string;
  description: string;
  budget: string;
  priority: "High" | "Medium" | "Low" | "None";
  keywords: string;
  status: "active" | "archived";
};

const EMPTY_FORM: ProjectFormState = {
  name: "",
  description: "",
  budget: "",
  priority: "Medium",
  keywords: "",
  status: "active",
};

export default function ProjectsPage() {
  const { data, loading, error, reload } = useAppData();
  const projects = data?.projects ?? [];
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState<ProjectFormState>(EMPTY_FORM);

  if (loading && !data) {
    return <div className="p-6 text-sm text-muted">Loading projects...</div>;
  }

  if (error || !data) {
    return <div className="p-6 text-sm text-danger-ink">{error ?? "Failed to load projects."}</div>;
  }

  function startCreate() {
    setForm(EMPTY_FORM);
    setOpen(true);
  }

  function startEdit(project: (typeof projects)[number]) {
    setForm({
      id: project.id,
      name: project.name,
      description: project.description,
      budget: String(project.budget),
      priority: project.priority,
      keywords: project.keywords.join(", "),
      status: project.status,
    });
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    const response = await fetch(form.id ? `/api/projects/${form.id}` : "/api/projects", {
      method: form.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        budget: Number(form.budget || 0),
        keywords: form.keywords
          .split(",")
          .map((keyword) => keyword.trim())
          .filter(Boolean),
      }),
    });
    setSaving(false);

    if (!response.ok) {
      return;
    }

    setOpen(false);
    setForm(EMPTY_FORM);
    await reload();
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Projects"
        subtitle="Manage project budgets and the keyword signals used for AI attribution."
        showDateRange={false}
        action={
          <Button variant="primary" size="sm" onClick={startCreate}>
            <Plus className="h-4 w-4" /> New project
          </Button>
        }
      />

      <div className="p-6">
        <Card>
          <Table>
            <thead>
              <tr>
                <Th>Project</Th>
                <Th>Priority</Th>
                <Th>Owner</Th>
                <Th>Keywords</Th>
                <Th>Budget usage</Th>
                <Th className="text-right">Budget</Th>
                <Th className="text-right">Spent</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => {
                const usage = project.budget > 0 ? (project.spent / project.budget) * 100 : null;

                return (
                  <Tr key={project.id}>
                    <Td>
                      <div className="font-semibold text-ink">{project.name}</div>
                      <div className="mt-0.5 max-w-xs truncate text-xs text-muted">{project.description}</div>
                    </Td>
                    <Td><PriorityBadge priority={project.priority} /></Td>
                    <Td className="text-muted">{project.owner}</Td>
                    <Td>
                      <div className="flex flex-wrap gap-1">
                        {project.keywords.slice(0, 3).map((keyword) => (
                          <span key={keyword} className="inline-flex items-center gap-1 bg-white/[0.04] px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-muted">
                            <Tag className="h-2.5 w-2.5" />
                            {keyword}
                          </span>
                        ))}
                        {project.keywords.length > 3 ? <span className="text-xs text-muted">+{project.keywords.length - 3}</span> : null}
                      </div>
                    </Td>
                    <Td className="w-40">
                      {usage !== null ? (
                        <div>
                          <div className="mb-1 text-xs text-muted">{pct(usage)}</div>
                          <ProgressBar value={usage} />
                        </div>
                      ) : (
                        <span className="text-xs text-muted">No budget</span>
                      )}
                    </Td>
                    <Td className="text-right text-muted">
                      {project.budget > 0 ? <CostValue amount={project.budget} /> : "—"}
                    </Td>
                    <Td className="text-right font-semibold">
                      <span className={usage && usage >= 100 ? "text-danger-ink" : "text-ink"}>
                        <CostValue amount={project.spent} />
                      </span>
                    </Td>
                    <Td>
                      <Button size="xs" variant="ghost" onClick={() => startEdit(project)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        </Card>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="panel w-full max-w-2xl p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="command-label">{form.id ? "Edit project" : "New project"}</div>
                <div className="mt-2 font-display text-3xl font-semibold uppercase tracking-[0.08em] text-ink">
                  {form.id ? "Update project controls" : "Create project control"}
                </div>
              </div>
              <Button variant="ghost" size="xs" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Name</Label>
                <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              </div>
              <div>
                <Label>Budget</Label>
                <Input value={form.budget} onChange={(event) => setForm((current) => ({ ...current, budget: event.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <Label>Description</Label>
                <Input value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value as ProjectFormState["priority"] }))}>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                  <option value="None">None</option>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as "active" | "archived" }))}>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Keywords</Label>
                <Input value={form.keywords} onChange={(event) => setForm((current) => ({ ...current, keywords: event.target.value }))} placeholder="recruiting, onboarding, finance sync" />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={save} disabled={saving}>
                {saving ? "Saving..." : form.id ? "Save changes" : "Create project"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
