"use client";

import * as React from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, Button, Input, Select } from "@/components/ui";
import { MeetingTable } from "@/components/MeetingTable";
import { Search, SlidersHorizontal } from "lucide-react";
import { useAppData } from "@/lib/use-app-data";

export default function MeetingsPage() {
  const { data, loading, error } = useAppData();
  const [search, setSearch]  = React.useState("");
  const [proj,   setProj]    = React.useState("all");
  const [conf,   setConf]    = React.useState("all");

  const meetings = data?.meetings ?? [];
  const projects = data?.projects ?? [];

  function resetFilters() {
    setSearch("");
    setProj("all");
    setConf("all");
  }

  const filtered = meetings.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchProj   = proj === "all" || m.projectName === proj;
    const matchConf   =
      conf === "all"  ? true :
      conf === "low"  ? m.aiConfidence < 0.7 :
      conf === "high" ? m.aiConfidence >= 0.85 : true;
    return matchSearch && matchProj && matchConf;
  });

  if (loading && !data) {
    return <div className="p-6 text-sm text-muted">Loading meetings…</div>;
  }

  if (error) {
    return <div className="p-6 text-sm text-danger-ink">{error}</div>;
  }

  return (
    <div className="flex flex-col">
      <PageHeader title="Meetings" subtitle={`${meetings.length} meetings imported this week`} />

      <div className="space-y-5 p-6">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <Input
              className="pl-9"
              placeholder="Search meetings…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select value={proj} onChange={e => setProj(e.target.value)} className="w-44">
            <option value="all">All projects</option>
            {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </Select>
          <Select value={conf} onChange={e => setConf(e.target.value)} className="w-44">
            <option value="all">All confidence</option>
            <option value="high">High (≥85%)</option>
            <option value="low">Low (&lt;70%)</option>
          </Select>
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <SlidersHorizontal className="h-4 w-4" /> Reset filters
          </Button>
          <span className="ml-auto text-sm text-muted">{filtered.length} meetings</span>
        </div>

        <Card>
          <MeetingTable meetings={filtered} />
        </Card>
      </div>
    </div>
  );
}
