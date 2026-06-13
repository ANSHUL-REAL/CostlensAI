"use client";

import * as React from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Cloud,
  Database,
  FileUp,
  Sparkles,
  Users,
} from "lucide-react";
import { Badge, Button, Card, CardBody, CardHeader } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { useAppData } from "@/lib/use-app-data";

type Step = "idle" | "loading" | "done" | "error";

export default function CalendarImportPage() {
  const { data, reload } = useAppData();
  const [demoStep, setDemoStep] = React.useState<Step>("idle");
  const [liveStep, setLiveStep] = React.useState<Step>("idle");
  const [fileStep, setFileStep] = React.useState<Step>("idle");
  const [attrStep, setAttrStep] = React.useState<Step>("idle");
  
  const [googleConnected, setGoogleConnected] = React.useState(false);
  const [googleConfigured, setGoogleConfigured] = React.useState(true);
  
  const [startDate, setStartDate] = React.useState("2026-06-08");
  const [endDate, setEndDate] = React.useState("2026-06-13");
  
  const [message, setMessage] = React.useState<string | null>(null);
  const [messageType, setMessageType] = React.useState<"success" | "error" | "info">("info");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Check Google OAuth connection status and handle query redirects on mount
  React.useEffect(() => {
    async function checkConnection() {
      try {
        const response = await fetch("/api/calendar/connect", { method: "POST" });
        const payload = await response.json();
        
        if (response.ok && payload.connected) {
          setGoogleConnected(true);
        } else if (payload.configured === false) {
          setGoogleConfigured(false);
        }
      } catch (err) {
        console.error("Failed to check Google connection:", err);
      }
    }
    
    checkConnection();

    // Check URL parameters for OAuth status callbacks
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected") === "true") {
      setGoogleConnected(true);
      setMessage("Successfully connected to your Google Calendar account!");
      setMessageType("success");
    } else if (params.get("error")) {
      setMessage(`Connection failed: ${params.get("error")}`);
      setMessageType("error");
    }
  }, []);

  async function loadDemo() {
    setDemoStep("loading");
    setMessage(null);
    try {
      const response = await fetch("/api/calendar/demo-import", { method: "POST" });
      const payload = await response.json();
      if (!response.ok) {
        setDemoStep("error");
        setMessage(payload.error || "Failed to load demo calendar.");
        setMessageType("error");
        return;
      }
      setDemoStep("done");
      setMessage(`Successfully imported ${payload.importedMeetings} meetings from demo dataset!`);
      setMessageType("success");
      await reload();
    } catch (err: any) {
      setDemoStep("error");
      setMessage(err.message || "Failed to load demo calendar.");
      setMessageType("error");
    }
  }

  async function runAI() {
    setAttrStep("loading");
    setMessage(null);
    try {
      const response = await fetch("/api/ai/attribute-meetings", { method: "POST" });
      const payload = await response.json();
      if (!response.ok) {
        setAttrStep("error");
        setMessage(payload.error || "Failed to run AI attribution.");
        setMessageType("error");
        return;
      }
      setAttrStep("done");
      setMessage(`Successfully attributed ${payload.updated} meetings to projects using ${payload.provider.toUpperCase()}!`);
      setMessageType("success");
      await reload();
    } catch (err: any) {
      setAttrStep("error");
      setMessage(err.message || "Failed to run AI attribution.");
      setMessageType("error");
    }
  }

  async function handleGoogleAction() {
    setLiveStep("loading");
    setMessage(null);

    if (!googleConnected) {
      // Connect flow
      try {
        const response = await fetch("/api/calendar/connect", { method: "POST" });
        const payload = await response.json();
        
        if (!response.ok) {
          setLiveStep("error");
          setMessage(payload.message || "Google setup failed.");
          setMessageType("error");
          return;
        }

        if (payload.url) {
          window.location.href = payload.url;
        } else if (payload.connected) {
          setGoogleConnected(true);
          setLiveStep("done");
        }
      } catch (err: any) {
        setLiveStep("error");
        setMessage(err.message || "Failed to connect to Google.");
        setMessageType("error");
      }
    } else {
      // Sync flow
      try {
        const response = await fetch("/api/calendar/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ startDate, endDate }),
        });
        const payload = await response.json();
        
        if (!response.ok) {
          setLiveStep("error");
          setMessage(payload.error || "Google sync failed.");
          setMessageType("error");
          return;
        }
        
        setLiveStep("done");
        setMessage(`Successfully synced ${payload.importedMeetings} meetings from Google Calendar!`);
        setMessageType("success");
        await reload();
      } catch (err: any) {
        setLiveStep("error");
        setMessage(err.message || "Google sync failed.");
        setMessageType("error");
      }
    }
  }

  async function handleIcsUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileStep("loading");
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/calendar/upload", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok) {
        setFileStep("error");
        setMessage(payload.error || "Failed to upload iCalendar file.");
        setMessageType("error");
        return;
      }

      setFileStep("done");
      setMessage(`Successfully imported ${payload.importedMeetings} meetings from ${file.name}!`);
      setMessageType("success");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      await reload();
    } catch (err: any) {
      setFileStep("error");
      setMessage(err.message || "Failed to upload iCalendar file.");
      setMessageType("error");
    }
  }

  const meetingCount = data?.summary.meetingCount ?? 0;
  const employeeCount = data?.summary.employeeCount ?? 0;
  const reviewCount = data?.reviewQueue.length ?? 0;

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Calendar Import"
        subtitle="Import calendar events using demo datasets, direct Google Calendar API sync, or manual iCalendar (.ics) uploads."
        showDateRange={false}
      />

      <div className="space-y-6 p-6">
        {/* Status Indicators */}
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            { label: "Meetings imported", value: meetingCount > 0 ? String(meetingCount) : "0", icon: <CalendarDays className="h-4 w-4 text-brand" /> },
            { label: "Employees matched", value: employeeCount > 0 ? `${employeeCount}/${employeeCount}` : "0", icon: <Users className="h-4 w-4 text-brand" /> },
            { label: "Attribution status", value: meetingCount === 0 ? "Pending" : reviewCount > 0 ? "Needs review" : "Complete", icon: <Sparkles className="h-4 w-4 text-brand" /> },
          ].map((stat) => (
            <div key={stat.label} className="panel panel-grid px-4 py-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted">
                {stat.icon}
                {stat.label}
              </div>
              <div className="mt-3 font-display text-5xl font-semibold uppercase tracking-[-0.05em] text-ink">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Global Feedback Message */}
        {message ? (
          <div
            className={[
              "border p-4 text-sm font-medium transition-all animate-rise",
              messageType === "success"
                ? "border-success/30 bg-success/10 text-success-ink"
                : messageType === "error"
                ? "border-rose-500/20 bg-rose-500/10 text-rose-300"
                : "border-line/70 bg-white/[0.03] text-body",
            ].join(" ")}
          >
            <div className="flex items-center gap-2">
              <div className={messageType === "success" ? "text-success" : messageType === "error" ? "text-rose-400" : "text-muted"}>
                ●
              </div>
              <span>{message}</span>
            </div>
          </div>
        ) : null}

        {/* Action Grid */}
        <div className="grid gap-5 xl:grid-cols-3">
          {/* Card 1: Demo Import */}
          <Card className="flex flex-col h-full">
            <CardHeader
              title="Demo Dataset"
              subtitle="Quick pre-seeded calendar data to evaluate system behaviors"
              action={<Badge tone="neutral">Static</Badge>}
            />
            <CardBody className="flex-1 flex flex-col justify-between space-y-5">
              <div className="border border-line/70 bg-white/[0.03] p-4 text-xs text-body space-y-2 flex-1">
                <div className="command-label">Demo contents:</div>
                <div className="flex items-center gap-2"><span className="h-1 w-1 bg-brand" /> 25 meetings on 5 projects</div>
                <div className="flex items-center gap-2"><span className="h-1 w-1 bg-brand" /> Pre-configured employee mapping</div>
                <div className="flex items-center gap-2"><span className="h-1 w-1 bg-brand" /> Simulates budget & leakage events</div>
              </div>

              <div className="space-y-3 pt-4">
                <Button variant={demoStep === "done" || meetingCount > 0 ? "secondary" : "primary"} className="w-full" onClick={loadDemo} disabled={demoStep === "loading"}>
                  {demoStep === "loading" ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" /> Ingesting...
                    </>
                  ) : meetingCount > 0 ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-success" /> Imported {meetingCount} meetings
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4" /> Load Demo Calendar
                    </>
                  )}
                </Button>

                {meetingCount > 0 ? (
                  <Button variant="primary" className="w-full" onClick={runAI} disabled={attrStep === "loading"}>
                    {attrStep === "loading" ? (
                      <>
                        <Sparkles className="h-4 w-4 animate-pulse" /> Running Gemini AI...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" /> Run AI Attribution <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                ) : null}
              </div>
            </CardBody>
          </Card>

          {/* Card 2: Google Calendar API */}
          <Card className="flex flex-col h-full">
            <CardHeader
              title="Google Calendar"
              subtitle="Read-only live synchronization using official Google credentials"
              action={googleConnected ? <Badge tone="success">Connected</Badge> : <Badge tone="warning">Setup Needed</Badge>}
            />
            <CardBody className="flex-1 flex flex-col justify-between space-y-5">
              <div className="space-y-4 flex-1">
                <div className="grid gap-2.5 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-muted uppercase tracking-wider">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-10 w-full border border-line/80 bg-panel/70 px-3 text-xs text-ink focus:border-brand/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-muted uppercase tracking-wider">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="h-10 w-full border border-line/80 bg-panel/70 px-3 text-xs text-ink focus:border-brand/50 focus:outline-none"
                    />
                  </div>
                </div>

                {!googleConfigured ? (
                  <div className="border border-yellow-500/20 bg-yellow-500/5 p-3 text-xs text-warning-ink leading-relaxed">
                    Note: To connect to Google Calendar, define <code className="bg-white/5 px-1 font-mono">GOOGLE_CLIENT_ID</code> and <code className="bg-white/5 px-1 font-mono">GOOGLE_CLIENT_SECRET</code> in your local `.env.local` configuration.
                  </div>
                ) : (
                  <div className="text-xs text-muted leading-relaxed">
                    Once authorized, CostLens AI securely retrieves meeting details, matching attendees against your {employeeCount} database employee rates.
                  </div>
                )}
              </div>

              <div className="pt-4">
                <Button
                  variant={googleConnected ? "primary" : "secondary"}
                  className="w-full"
                  onClick={handleGoogleAction}
                  disabled={liveStep === "loading" || (!googleConnected && !googleConfigured)}
                >
                  {liveStep === "loading" ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" /> Synchronizing...
                    </>
                  ) : googleConnected ? (
                    <>
                      <Cloud className="h-4 w-4" /> Sync Google Calendar
                    </>
                  ) : (
                    <>
                      <Cloud className="h-4 w-4" /> Connect Google Account
                    </>
                  )}
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Card 3: Manual File Upload (.ics) */}
          <Card className="flex flex-col h-full">
            <CardHeader
              title="Upload iCalendar File"
              subtitle="Import your schedules instantly by uploading an exported .ics calendar file"
              action={<Badge tone="success">Zero Config</Badge>}
            />
            <CardBody className="flex-1 flex flex-col justify-between space-y-5">
              <div className="flex-1 flex flex-col justify-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".ics"
                  onChange={handleIcsUpload}
                  className="hidden"
                  id="ics-file-uploader"
                />
                
                <label
                  htmlFor="ics-file-uploader"
                  className={[
                    "flex flex-col items-center justify-center border border-dashed border-line/90 bg-white/[0.02] p-8 text-center cursor-pointer transition-all hover:bg-white/[0.05] hover:border-brand/50 group h-40",
                    fileStep === "loading" ? "pointer-events-none opacity-60" : "",
                  ].join(" ")}
                >
                  {fileStep === "loading" ? (
                    <>
                      <Clock className="h-8 w-8 text-brand animate-spin" />
                      <span className="mt-3 text-xs font-semibold text-ink">Reading calendar file...</span>
                    </>
                  ) : (
                    <>
                      <FileUp className="h-8 w-8 text-muted transition-colors group-hover:text-brand" />
                      <span className="mt-3 text-xs font-semibold text-ink">Select an .ics iCalendar file</span>
                      <span className="mt-1 text-[10px] text-muted">Supports Outlook, Google, and Apple exports</span>
                    </>
                  )}
                </label>
              </div>

              <div className="text-xs text-muted text-center pt-2">
                Export calendar: <span className="font-semibold text-body">Settings → Export (.ics)</span>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Recent Import log */}
        {meetingCount > 0 ? (
          <Card>
            <CardHeader title="Import Log" subtitle="Most recent ingest activity" />
            <CardBody>
              <div className="space-y-2.5 text-sm">
                {[
                  `Database contains ${meetingCount} active meetings`,
                  `Roster matches ${employeeCount} employee profiles`,
                  "Calculated attendee hourly cost contributions and meeting expenditures",
                  reviewCount > 0 ? `${reviewCount} low-confidence meetings flagged in Human Review Queue` : "All imported meetings successfully attributed",
                ].map((line, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-body animate-rise">
                    <span className="h-1.5 w-1.5 bg-success rounded-full" />
                    {line}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
