"use client";

import * as React from "react";
import { Pencil, Plus, X } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge, Button, Card, Input, Label, Select, Table, Td, Th, Tr } from "@/components/ui";
import { CostValue } from "@/components/CostValue";
import { useAppData } from "@/lib/use-app-data";

type EmployeeFormState = {
  id?: string;
  name: string;
  email: string;
  role: string;
  department: string;
  hourlyRate: string;
  costBand: string;
  status: "active" | "inactive";
};

const EMPTY_FORM: EmployeeFormState = {
  name: "",
  email: "",
  role: "",
  department: "",
  hourlyRate: "",
  costBand: "",
  status: "active",
};

export default function EmployeesPage() {
  const { data, loading, error, reload } = useAppData();
  const employees = data?.employees ?? [];
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState<EmployeeFormState>(EMPTY_FORM);

  if (loading && !data) {
    return <div className="p-6 text-sm text-muted">Loading employees...</div>;
  }

  if (error || !data) {
    return <div className="p-6 text-sm text-danger-ink">{error ?? "Failed to load employees."}</div>;
  }

  function startCreate() {
    setForm(EMPTY_FORM);
    setOpen(true);
  }

  function startEdit(employee: (typeof employees)[number]) {
    setForm({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department,
      hourlyRate: String(employee.hourlyRate),
      costBand: employee.costBand,
      status: employee.status,
    });
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    const response = await fetch(form.id ? `/api/employees/${form.id}` : "/api/employees", {
      method: form.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        hourlyRate: Number(form.hourlyRate || 0),
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
        title="Employees"
        subtitle="Employee roster and hourly cost bands used in meeting cost calculation."
        showDateRange={false}
        action={
          <Button variant="primary" size="sm" onClick={startCreate}>
            <Plus className="h-4 w-4" /> Add employee
          </Button>
        }
      />

      <div className="p-6">
        <Card>
          <Table>
            <thead>
              <tr>
                <Th>Employee</Th>
                <Th>Role</Th>
                <Th>Department</Th>
                <Th>Cost band</Th>
                <Th className="text-right">Hourly rate</Th>
                <Th>Status</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <Tr key={employee.id}>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-line/70 bg-bone font-display text-lg font-semibold text-ink">
                        {employee.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-semibold text-ink">{employee.name}</div>
                        <div className="text-xs text-muted">{employee.email}</div>
                      </div>
                    </div>
                  </Td>
                  <Td className="text-muted">{employee.role}</Td>
                  <Td>
                    <Badge tone="neutral">{employee.department}</Badge>
                  </Td>
                  <Td>
                    <span className="bg-brand/12 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand">
                      {employee.costBand}
                    </span>
                  </Td>
                  <Td className="text-right font-semibold">
                    <CostValue amount={employee.hourlyRate} individual className="text-ink" />
                    <span className="text-xs font-normal text-muted"> /hr</span>
                  </Td>
                  <Td>
                    <Badge tone={employee.status === "active" ? "success" : "neutral"}>
                      {employee.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </Td>
                  <Td>
                    <Button size="xs" variant="ghost" onClick={() => startEdit(employee)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <p className="mt-3 text-xs uppercase tracking-[0.14em] text-muted">
          Hourly rates are visible only to Admin and Finance Manager roles. Switch roles in the header to verify privacy.
        </p>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="panel w-full max-w-2xl p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="command-label">{form.id ? "Edit employee" : "New employee"}</div>
                <div className="mt-2 font-display text-3xl font-semibold uppercase tracking-[0.08em] text-ink">
                  {form.id ? "Update roster entry" : "Add roster entry"}
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
                <Label>Email</Label>
                <Input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
              </div>
              <div>
                <Label>Role</Label>
                <Input value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} />
              </div>
              <div>
                <Label>Department</Label>
                <Input value={form.department} onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))} />
              </div>
              <div>
                <Label>Hourly Rate</Label>
                <Input value={form.hourlyRate} onChange={(event) => setForm((current) => ({ ...current, hourlyRate: event.target.value }))} />
              </div>
              <div>
                <Label>Cost Band</Label>
                <Input value={form.costBand} onChange={(event) => setForm((current) => ({ ...current, costBand: event.target.value }))} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as "active" | "inactive" }))}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={save} disabled={saving}>
                {saving ? "Saving..." : form.id ? "Save changes" : "Create employee"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
