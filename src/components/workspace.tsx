import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, Blocks, CalendarDays, Check,
  CheckCheck, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Clock3, Command, Compass,
  FileText, Filter, GitBranch, Layers3, Lightbulb, ListChecks, Loader2, LogOut, Menu, MoreHorizontal,
  Network, Pencil, Plus, Search, Settings2, ShieldAlert, SlidersHorizontal, Sparkles,
  Trash2, UsersRound, X, Zap,
} from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from "recharts";
import { toast, Toaster } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useProfile, type SignedInProfile } from "@/hooks/use-profile";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  alerts, commitments, demoWeek, dependencyEdges, dependencyNodes, employees as defaultEmployees, meetings, projects,
  projectTeams, recommendations, reprioritization, tasks, type Commitment, type Employee, type Health,
} from "@/lib/workspace-data";

const DependencyGraph = lazy(() => import("@/components/dependency-graph"));

// MongoDB API Helper Functions (Self-Contained)
const env = import.meta.env as Record<string, any>;
const API_URL = env["VITE_API_URL"] || "http://localhost:5000/api";

async function getEmployees(): Promise<Employee[]> {
  try {
    const res = await fetch(`${API_URL}/employees`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function createEmployee(emp: Partial<Employee>): Promise<Employee> {
  const res = await fetch(`${API_URL}/employees`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(emp),
  });
  if (!res.ok) throw new Error("Failed to save employee");
  return await res.json();
}

const navigation = [
  { title: "Intelligence Overview", to: "/", icon: Compass, section: "WORKSPACE" },
  { title: "Commitment Intelligence", to: "/commitments", icon: ListChecks },
  { title: "Workload Intelligence", to: "/workload", icon: UsersRound },
  { title: "Meeting Intelligence", to: "/meetings", icon: CalendarDays },
  { title: "Dependency Explorer", to: "/dependencies", icon: GitBranch, section: "ANALYSIS" },
  { title: "Project Risk Center", to: "/risk", icon: ShieldAlert },
  { title: "Approval Center", to: "/approvals", icon: CheckCheck },
  { title: "Settings", to: "/settings", icon: Settings2, section: "PREFERENCES" },
] as const;

const titles: Record<string, string> = {
  "/": "Intelligence Overview", "/commitments": "Commitment Intelligence",
  "/workload": "Workload Intelligence", "/meetings": "Meeting Intelligence",
  "/dependencies": "Dependency Explorer", "/risk": "Project Risk Center",
  "/approvals": "Approval Center", "/settings": "Settings",
};

const descriptions: Record<string, string> = {
  "/commitments": "Track promises across conversations and see what could slip before it does.",
  "/workload": "Understand where attention is concentrated across people and teams.",
  "/meetings": "Decide who needs to be in the room, and why.",
  "/dependencies": "Trace the connections between delivery work, commitments and milestones.",
  "/risk": "Understand the signals behind project health and what to address first.",
  "/approvals": "Review suggested interventions before they become next steps.",
  "/settings": "Manage your workspace preferences and profile details.",
};

function person(id: string) {
  return defaultEmployees.find((employee) => employee.id === id) ?? defaultEmployees[0]!;
}

function project(id: string) {
  return projects.find((item) => item.id === id) ?? projects[0]!;
}

function healthClass(value: string) {
  if (["Healthy", "Completed", "Balanced", "Approved"].includes(value)) return "border-success/20 bg-success/10 text-success";
  if (["At risk", "At Risk", "Elevated", "Medium", "Moderate Relevance", "Upcoming"].includes(value)) return "border-warning/25 bg-warning/15 text-warning-foreground";
  if (["Blocked", "High", "Overdue", "Rejected", "High Relevance"].includes(value)) return "border-risk/20 bg-risk/10 text-risk";
  if (["Low", "Low Relevance"].includes(value)) return "border-border bg-muted text-muted-foreground";
  return "border-intelligence/20 bg-intelligence/10 text-intelligence";
}

function Status({ value }: { value: string }) {
  return <Badge variant="outline" className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-medium", healthClass(value))}>{value}</Badge>;
}

function SectionHeading({ title, action }: { title: string; action?: React.ReactNode }) {
  return <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-sm font-semibold text-foreground">{title}</h2>{action}</div>;
}

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("rounded-lg border border-border bg-card shadow-card transition-shadow hover:shadow-card-hover", className)}>{children}</section>;
}

function PageHeading({ path, eyebrow }: { path: string; eyebrow?: string }) {
  return <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div><div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground"><span>Workspace</span><ChevronRight className="size-3" /><span>{titles[path]}</span></div>
      <div className="flex items-center gap-2">{eyebrow && <span className="rounded-full bg-intelligence/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-intelligence">{eyebrow}</span>}<h1 className="workspace-page-title text-2xl font-semibold tracking-tight text-foreground">{titles[path]}</h1></div>
      {descriptions[path] && <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{descriptions[path]}</p>}
    </div>
  </div>;
}

function ToolRow({ search, setSearch, placeholder, children }: { search: string; setSearch: (value: string) => void; placeholder: string; children?: React.ReactNode }) {
  return <div className="mb-4 flex flex-wrap items-center gap-2"><div className="relative min-w-[220px] flex-1 md:max-w-sm"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={placeholder} /></div>{children}</div>;
}

function PersonAvatar({ employee, size = "md" }: { employee: Employee; size?: "sm" | "md" }) {
  return <Avatar className={cn("border border-border", size === "sm" ? "size-7" : "size-9")}><AvatarFallback className={cn("font-semibold", size === "sm" ? "text-[10px]" : "text-xs", employee.color === "green" ? "bg-success/10 text-success" : employee.color === "amber" ? "bg-warning/15 text-warning-foreground" : employee.color === "rose" ? "bg-risk/10 text-risk" : employee.color === "violet" ? "bg-intelligence/10 text-intelligence" : "bg-primary/10 text-primary")}>{employee.initials}</AvatarFallback></Avatar>;
}

function greetingForNow() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function profileEmployee(profile: SignedInProfile | null): Employee {
  if (!profile) {
    return { id: "current-user", name: "Workspace member", initials: "··", color: "blue", role: "", team: "", activeTasks: 0, priorityTasks: 0, commitments: 0, meetings: 0, workload: "Balanced" };
  }
  const initials = profile.display_name.split(/\s+/).filter(Boolean).map((word) => word[0]?.toUpperCase() ?? "").join("").slice(0, 2) || "Me";
  return { id: profile.id, name: profile.display_name, initials, color: "blue", role: profile.job_title, team: profile.team, activeTasks: 0, priorityTasks: 0, commitments: 0, meetings: 0, workload: "Balanced" };
}

function roleLabelFor(profile: SignedInProfile | null, loading: boolean) {
  if (!profile) return loading ? "Loading profile…" : "Workspace member";
  return [profile.job_title, profile.team].filter(Boolean).join(" · ") || "Workspace member";
}

function Overview({ openCommitment, profile }: { openCommitment: (item: Commitment) => void; profile: SignedInProfile | null }) {
  const atRiskCount = commitments.filter((item) => ["At Risk", "Overdue"].includes(item.status)).length;
  const strainedCount = defaultEmployees.filter((item) => item.workload !== "Balanced").length;
  const openDependencyCount = dependencyNodes.filter((item) => ["At risk", "Blocked"].includes(item.status)).length;
  const stats = [
    { label: "Delivery projects", value: String(projects.length).padStart(2, "0"), change: "All teams active", icon: Layers3, tone: "text-intelligence", trend: "steady" },
    { label: "At-risk commitments", value: String(atRiskCount).padStart(2, "0"), change: "+2 from last week", icon: Clock3, tone: "text-warning-foreground", trend: "up" },
    { label: "Workload warnings", value: String(strainedCount).padStart(2, "0"), change: "Across 3 teams", icon: UsersRound, tone: "text-risk", trend: "up" },
    { label: "Open dependencies", value: String(openDependencyCount).padStart(2, "0"), change: "2 blocking delivery", icon: GitBranch, tone: "text-intelligence", trend: "down" },
    { label: "Suggested actions", value: String(recommendations.length).padStart(2, "0"), change: "Awaiting review", icon: Lightbulb, tone: "text-warning-foreground", trend: "steady" },
  ];
  return <>
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div><div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-intelligence/20 bg-intelligence/5 px-2.5 py-1 text-[11px] font-medium text-intelligence"><Sparkles className="size-3.5" />Workspace intelligence <span className="ml-1 border-l border-intelligence/20 pl-1.5 text-muted-foreground">Demo</span></div><h1 className="workspace-page-title text-3xl font-semibold tracking-tight">{greetingForNow()}, {profile?.display_name ?? "there"}</h1><p className="mt-1.5 text-sm text-muted-foreground">Here is what needs your attention across your workspace.</p></div>
      <div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={() => toast.info("Dates reflect the demonstration week of 19–25 Oct.")}><CalendarDays className="size-4" /> Mon, Oct 19</Button><ProjectSelect /></div>
    </div>
    <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-5">{stats.map(({ label, value, change, icon: Icon, tone, trend }) => <Panel key={label} className="p-4"><div className="mb-4 flex items-center justify-between"><span className="text-xs text-muted-foreground">{label}</span><Icon className={cn("size-4", tone)} /></div><div className="flex items-end justify-between gap-2"><span className="text-2xl font-semibold tabular-nums">{value}</span><span className="mb-1 flex items-center gap-1 text-[10px] text-muted-foreground">{trend === "up" ? <ArrowUpRight className="size-3 text-warning-foreground" /> : trend === "down" ? <ArrowDownRight className="size-3 text-success" /> : <Activity className="size-3" />}{change}</span></div></Panel>)}</div>
    <Panel className="mb-6 p-5"><SectionHeading title="Upcoming milestones" action={<Link to="/risk"><Button variant="ghost" size="sm" className="h-7 text-[11px]">Risk center <ArrowRight className="size-3.5" /></Button></Link>} /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{projects.map((item) => <div key={item.id} className="rounded-lg border border-border bg-muted/30 p-3"><div className="flex items-center justify-between gap-2"><span className="truncate text-xs font-semibold">{item.name}</span><Status value={item.health} /></div><div className="mt-2 text-xs text-muted-foreground">{item.milestone}</div><div className="mt-1.5 text-[10px] text-muted-foreground">Lead {item.lead} · risk score {item.risk}%</div></div>)}</div></Panel>
    <div className="mb-6 grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.82fr)]">
      <Panel className="overflow-hidden"><div className="flex items-center justify-between border-b border-border px-5 py-4"><div><div className="flex items-center gap-2"><h2 className="font-semibold">Intelligence feed</h2><Badge variant="outline" className="rounded-full border-intelligence/20 bg-intelligence/5 text-intelligence">04 new</Badge></div><p className="mt-1 text-xs text-muted-foreground">Signals connected across commitments, workload and delivery.</p></div><Button variant="ghost" size="sm" onClick={() => toast.info("Showing the latest workspace signals.")}>View all <ArrowRight className="size-3.5" /></Button></div>
        <div className="divide-y divide-border">{alerts.map((alert) => <div key={alert.id} className="group flex gap-3 px-5 py-4 transition-colors hover:bg-muted/40"><div className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full", alert.severity === "High" ? "bg-risk/10 text-risk" : "bg-warning/15 text-warning-foreground")}><Zap className="size-4" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold">{alert.title}</span><Status value={alert.severity} /><span className="text-[11px] text-muted-foreground">{alert.time}</span></div><p className="mt-1 text-sm leading-5 text-muted-foreground">{alert.description}</p><div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground"><span className="font-medium text-foreground">{project(alert.projectId).name}</span><span>·</span><span>{alert.person}</span><button className="ml-auto inline-flex items-center gap-1 font-medium text-primary opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100" onClick={() => { const found = commitments.find((item) => item.id === alert.commitmentId); if (found) openCommitment(found); }}>View details <ArrowRight className="size-3" /></button></div></div></div>)}</div>
        <div className="border-t border-border bg-muted/30 px-5 py-3"><div className="flex items-center gap-2 text-[11px] text-muted-foreground"><span className="size-1.5 rounded-full bg-success" />Last checked moments ago <span>·</span><span>Signals are illustrative demonstration data</span></div></div>
      </Panel>
      <div className="space-y-5">
        <Panel className="p-5"><SectionHeading title="Why this matters" action={<span className="rounded-full bg-intelligence/10 p-1.5 text-intelligence"><Network className="size-4" /></span>} /><p className="mb-5 text-xs leading-5 text-muted-foreground">One missed handoff can ripple through delivery. Here’s the chain our demo workspace connects.</p><div className="relative ml-3 space-y-0 border-l border-dashed border-intelligence/30 pl-5">{[
          ["Meeting commitment", "API docs due Friday", "text-intelligence"], ["Delayed task", "Database migration", "text-warning-foreground"], ["Blocked dependency", "API integration", "text-risk"], ["Workload pressure", "Maya · 3 priorities", "text-warning-foreground"], ["Project risk", "Payment Platform", "text-risk"],
        ].map(([title, text, color], index) => <div key={title} className="relative flex items-center justify-between gap-2 py-2"><span className="absolute -left-[25px] flex size-[9px] items-center justify-center rounded-full border-2 border-background bg-primary ring-1 ring-primary/30" /><div className="min-w-0"><div className={cn("text-[10px] font-semibold uppercase", color)}>{title}</div><div className="mt-0.5 truncate text-xs font-medium">{text}</div></div>{index < 4 && <ChevronRight className="size-3 shrink-0 text-muted-foreground" />}</div>)}</div></Panel>
        <Panel className="p-5"><SectionHeading title="Recommended actions" action={<Lightbulb className="size-4 text-warning-foreground" />} /><div className="space-y-3">{recommendations.slice(0, 3).map((item, index) => <div key={item.id} className="border-b border-border pb-3 last:border-0 last:pb-0"><div className="flex gap-2"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">{index + 1}</span><div className="min-w-0 flex-1"><p className="text-xs font-medium leading-5">{item.action}</p><div className="mt-1.5 flex gap-2"><Button size="sm" variant="outline" className="h-7 px-2 text-[10px]" onClick={() => toast.info(item.explanation)}>View details</Button><Link to="/approvals"><Button size="sm" variant="ghost" className="h-7 px-2 text-[10px]">Review action <ArrowRight className="size-3" /></Button></Link></div></div></div></div>)}</div><div className="mt-3 text-[10px] text-muted-foreground">Suggested actions require human review.</div></Panel>
      </div>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-3"><div className="flex items-center gap-2 text-xs"><div className="flex size-7 items-center justify-center rounded-full bg-intelligence/10 text-intelligence"><Sparkles className="size-3.5" /></div><span className="font-medium">Signal coverage</span><span className="text-muted-foreground">{new Set(defaultEmployees.map((item) => item.team)).size} teams · {projects.length} delivery projects · refreshed just now</span></div><span className="text-[10px] text-muted-foreground">Illustrative workspace data · not connected to live systems</span></div>
  </>;
}

function ProjectSelect() {
  const [value, setValue] = useState("all");
  return <Select value={value} onValueChange={setValue}><SelectTrigger className="h-9 w-[170px] bg-card text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All projects</SelectItem>{projects.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select>;
}

function extractFromTranscript(text: string) {
  const lower = text.toLowerCase();
  const owner = defaultEmployees.find((item) => lower.includes(item.name.split(" ")[0]?.toLowerCase() ?? ""));
  const dayEntry = Object.entries(demoWeek.weekdays).find(([name]) => lower.includes(name));
  const deadline = dayEntry?.[1] ?? null;
  const recipientMatch = text.match(/(?:for|so)\s+(?:the\s+)?([A-Za-z][A-Za-z ]{2,28}team)/);
  const recipient = recipientMatch?.[1]?.trim();
  const keywords: Record<string, string[]> = {
    payment: ["payment", "api", "ledger"], identity: ["identity", "sso", "access"],
    mobile: ["mobile", "onboarding", "design"], data: ["warehouse", "data"],
  };
  const project = projects.find((item) => (keywords[item.id] ?? []).some((word) => lower.includes(word)));
  const statement = text.trim().replace(/^[A-Z][a-z]+:\s*/, "").slice(0, 160);
  const impact = owner && project
    ? commitments.find((item) => item.ownerId === owner.id && item.projectId === project.id)?.impact ?? "Downstream work that depends on this handoff may shift."
    : "Downstream work that depends on this handoff may shift.";
  return { owner, deadline, recipient, project, statement, impact };
}

function CommitmentPage({ openCommitment }: { openCommitment: (item: Commitment) => void }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [projectFilter, setProjectFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [dialog, setDialog] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [preview, setPreview] = useState(false);
  const filtered = commitments.filter((item) => {
    const text = `${item.statement} ${person(item.ownerId).name} ${project(item.projectId).name}`.toLowerCase();
    return text.includes(search.toLowerCase()) && (status === "All" || item.status === status)
      && (projectFilter === "all" || item.projectId === projectFilter)
      && (ownerFilter === "all" || item.ownerId === ownerFilter);
  });
  return <><PageHeading path="/commitments" eyebrow="Connected signals" /><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-2">{["All", "Upcoming", "At Risk", "Completed", "Overdue"].map((item) => <Button key={item} variant={status === item ? "secondary" : "ghost"} size="sm" className={cn("h-8 text-xs", status === item && "border border-border bg-card shadow-sm")} onClick={() => setStatus(item)}>{item}{item === "At Risk" && <span className="ml-1 rounded-full bg-risk/10 px-1.5 text-[10px] text-risk">2</span>}</Button>)}</div><Button size="sm" onClick={() => { setDialog(true); setPreview(false); }}><FileText className="size-4" />Analyze meeting text</Button></div>
    <ToolRow search={search} setSearch={setSearch} placeholder="Search commitments, owners or projects"><Select value={projectFilter} onValueChange={setProjectFilter}><SelectTrigger className="w-[150px] bg-card text-xs"><Filter className="mr-2 size-3.5" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All projects</SelectItem>{projects.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select><Select value={ownerFilter} onValueChange={setOwnerFilter}><SelectTrigger className="w-[140px] bg-card text-xs"><UsersRound className="mr-2 size-3.5" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All owners</SelectItem>{defaultEmployees.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></ToolRow>
    <Panel><div className="flex items-center justify-between border-b border-border px-4 py-3"><div><div className="text-sm font-semibold">Commitment register</div><div className="mt-0.5 text-xs text-muted-foreground">{filtered.length} commitments · connected to the shared demo scenario</div></div><Button variant="ghost" size="icon" aria-label="More table options" onClick={() => toast.info("Column options are placeholders in this demo.")}><MoreHorizontal className="size-4" /></Button></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left"><thead><tr className="border-b border-border bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">{["Commitment", "Owner", "Recipient", "Deadline", "Source", "Project", "Status", "Risk", ""].map((head) => <th key={head} className="px-4 py-3 font-medium">{head}</th>)}</tr></thead><tbody className="divide-y divide-border">{filtered.map((item) => <tr key={item.id} onClick={() => openCommitment(item)} className="cursor-pointer transition-colors hover:bg-muted/40"><td className="max-w-[250px] px-4 py-3 text-xs font-medium leading-5">{item.statement}</td><td className="px-4 py-3"><div className="flex items-center gap-2 whitespace-nowrap"><PersonAvatar employee={person(item.ownerId)} size="sm" /><span className="text-xs">{person(item.ownerId).name}</span></div></td><td className="px-4 py-3 text-xs text-muted-foreground">{item.recipient}</td><td className="px-4 py-3 text-xs">{item.deadline}</td><td className="px-4 py-3 text-xs text-muted-foreground">{item.source}</td><td className="px-4 py-3 text-xs">{project(item.projectId).name}</td><td className="px-4 py-3"><Status value={item.status} /></td><td className="px-4 py-3"><Status value={item.risk} /></td><td className="px-4 py-3"><Button variant="ghost" size="icon" aria-label={`Open ${item.statement}`}><ChevronRight className="size-4" /></Button></td></tr>)}</tbody></table>{filtered.length === 0 && <EmptyState message="No commitments match this search." />}</div><div className="flex items-center justify-between border-t border-border px-4 py-3 text-[11px] text-muted-foreground"><span>Showing {filtered.length} of {commitments.length} commitments</span><div className="flex gap-1"><Button variant="outline" size="icon" className="size-7" aria-label="Previous page" onClick={() => toast.info("All matching commitments fit on one page in this demo.")}><ChevronLeft className="size-3.5" /></Button><Button variant="outline" size="icon" className="size-7" aria-label="Next page" onClick={() => toast.info("All matching commitments fit on one page in this demo.")}><ChevronRight className="size-3.5" /></Button></div></div></Panel>
    <Dialog open={dialog} onOpenChange={setDialog}><DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>Analyze meeting text</DialogTitle><DialogDescription>Paste a transcript excerpt to run the simulated commitment extraction demo.</DialogDescription></DialogHeader><div className="rounded-md border border-warning/25 bg-warning/10 px-3 py-2 text-xs text-warning-foreground">Frontend demonstration only · rule-based demo logic, no AI service is connected</div><div className="flex items-center justify-between gap-2"><label className="text-xs font-medium" htmlFor="transcript">Meeting transcript</label><Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={() => { setTranscript(demoWeek.sampleTranscript); setPreview(false); }}>Load sample excerpt</Button></div><Textarea id="transcript" value={transcript} onChange={(event) => { setTranscript(event.target.value); setPreview(false); }} placeholder="Paste a meeting excerpt here…" className="min-h-32" />{preview && (() => { const extracted = extractFromTranscript(transcript); const detected = Boolean(extracted.owner || extracted.deadline || extracted.project); return <div className="space-y-3 rounded-md border border-border bg-muted/30 p-3"><div className="flex items-center justify-between gap-2"><div className="text-xs font-semibold text-intelligence">Simulated extraction preview</div><Badge variant="outline" className="text-[10px]">Demo logic</Badge></div>{detected ? <><div className="grid grid-cols-2 gap-3 text-xs">{[["Owner", extracted.owner?.name], ["Deadline", extracted.deadline ? `Due ${extracted.deadline}` : null], ["Recipient", extracted.recipient], ["Related project", extracted.project?.name]].map(([label, value]) => <div key={label}><div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div><div className="mt-0.5 font-medium">{value ?? "Not detected"}</div></div>)}</div><div><div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Commitment</div><div className="mt-0.5 text-sm leading-5">{extracted.statement}</div></div><div><div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Status · Downstream impact</div><div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs"><Status value="Upcoming" /><span className="text-muted-foreground">{extracted.impact}</span></div></div><div className="text-[11px] text-muted-foreground">Extraction uses simple demo rules. Confirm owner, date and project before saving.</div></> : <div className="text-xs text-muted-foreground">No commitment signals detected. Try a sentence like “I’ll have the API documentation ready by Friday for the payments team.”</div>}</div>; })()}<DialogFooter><Button variant="outline" onClick={() => setDialog(false)}>Cancel</Button><Button onClick={() => { if (!transcript.trim()) { toast.error("Paste a transcript excerpt first."); return; } setPreview(true); }}>Preview extraction <Sparkles className="size-4" /></Button></DialogFooter></DialogContent></Dialog>
  </>;
}

function WorkloadPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("maya");
  const [teamFilter, setTeamFilter] = useState("all");
  const [liveEmployees, setLiveEmployees] = useState<Employee[]>(defaultEmployees);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ id: "", name: "", role: "", team: "Product" });

  useEffect(() => {
    getEmployees()
      .then((data: Employee[]) => { if (data && data.length > 0) setLiveEmployees(data); })
      .catch((error: unknown) => console.error("MongoDB Fetch Error:", error));
  }, []);

  const filtered = liveEmployees.filter((item) => `${item.name} ${item.team}`.toLowerCase().includes(search.toLowerCase()) && (teamFilter === "all" || item.team === teamFilter));
  const employee = liveEmployees.find((item) => item.id === selected) ?? liveEmployees[0]!;
  const loadData = liveEmployees.map((item) => ({ name: item.name.split(" ")[0], tasks: item.activeTasks, commitments: item.commitments * 2, meetings: item.meetings }));
  
  const openAdd = () => { setForm({ id: "", name: "", role: "", team: "Product" }); setFormOpen(true); };
  
  const saveEmployee = async () => {
    try {
      const name = form.name.trim();
      if (!name) { toast.error("Enter a name to save."); return; }
      const id = form.id.trim() || name.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now().toString().slice(-4);
      const initials = name.split(/\s+/).map((word) => word[0]?.toUpperCase() ?? "").join("").slice(0, 2) || "EW";
      
      const newEmpPayload = {
        id,
        name,
        role: form.role.trim() || "Team Member",
        team: form.team,
        initials,
        color: "blue" as const,
        activeTasks: 1,
        priorityTasks: 0,
        commitments: 1,
        meetings: 1,
        workload: "Balanced" as const,
      };

      const added = await createEmployee(newEmpPayload);
      setLiveEmployees([...liveEmployees, added]);
      setFormOpen(false);
      toast.success(`${name} successfully saved to MongoDB Atlas!`);
    } catch (error: unknown) {
      toast.error("Failed to add employee to database.");
    }
  };

  const removeEmployee = async (item: Employee) => {
    setLiveEmployees(liveEmployees.filter((e) => e.id !== item.id));
    if (selected === item.id && liveEmployees.length > 1) {
      setSelected(liveEmployees[0]!.id);
    }
    toast.success(`${item.name} removed from roster.`);
  };

  const employeeTasks = tasks.filter((item) => item.ownerId === selected);

  return <><PageHeading path="/workload" eyebrow="Live MongoDB Connected" /><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><ToolRow search={search} setSearch={setSearch} placeholder="Find an employee or team" /><Select value={teamFilter} onValueChange={setTeamFilter}><SelectTrigger className="w-[155px] bg-card text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All teams</SelectItem>{[...new Set(liveEmployees.map((item) => item.team))].map((team) => <SelectItem key={team} value={team}>{team}</SelectItem>)}</SelectContent></Select><Button size="sm" className="shrink-0" onClick={openAdd}><Plus className="size-4" />Add employee</Button></div>
    <div className="mb-5 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.7fr)]"><Panel className="p-5"><SectionHeading title="Workload distribution" action={<Badge variant="outline" className="text-[10px]">Live API</Badge>} /><div className="h-[240px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={loadData} barSize={16} barGap={5}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" /><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }} /><Tooltip cursor={{ fill: "var(--color-muted)" }} contentStyle={{ borderRadius: 6, border: "1px solid var(--color-border)", fontSize: 12 }} /><Bar dataKey="tasks" name="Active tasks" fill="var(--color-primary)" radius={[3, 3, 0, 0]} /><Bar dataKey="commitments" name="Commitment load" fill="var(--color-warning)" radius={[3, 3, 0, 0]} /><Bar dataKey="meetings" name="Meetings" fill="var(--color-chart-2)" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer></div><div className="mt-2 flex justify-center gap-4 text-[10px] text-muted-foreground"><span>Data sourced from MongoDB Atlas.</span></div></Panel><Panel className="p-5"><SectionHeading title="Priority mix" action={<SlidersHorizontal className="size-4 text-muted-foreground" />} /><div className="space-y-5 pt-3">{(["High", "Medium", "Low"] as const).map((priority) => { const count = tasks.filter((item) => item.priority === priority).length; return <div key={priority}><div className="mb-1.5 flex justify-between text-xs"><span>{priority} priority</span><span className="tabular-nums text-muted-foreground">{count} tasks</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full", priority === "High" ? "bg-risk" : priority === "Medium" ? "bg-warning" : "bg-success")} style={{ width: `${(count / tasks.length) * 100}%` }} /></div></div>; })}</div><div className="mt-6 rounded-md bg-muted/40 p-3 text-[11px] leading-5 text-muted-foreground">Upcoming deadlines cluster across 21–26 Oct. Review the team-level workload before moving delivery dates.</div></Panel></div>
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)]"><Panel><div className="border-b border-border px-4 py-3"><div className="text-sm font-semibold">Employee workload</div><div className="mt-0.5 text-xs text-muted-foreground">Live data from Node.js Express & MongoDB Atlas.</div></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left"><thead><tr className="border-b border-border bg-muted/40 text-[10px] uppercase text-muted-foreground">{["Employee", "Team", "Active tasks", "High priority", "Upcoming", "Meetings", "Status", "Actions"].map((text) => <th key={text} className="px-3 py-3 font-medium">{text}</th>)}</tr></thead><tbody className="divide-y divide-border">{filtered.map((item) => <tr key={item.id} onClick={() => setSelected(item.id)} className={cn("cursor-pointer transition-colors hover:bg-muted/40", selected === item.id && "bg-accent/50")}><td className="px-3 py-3"><div className="flex items-center gap-2"><PersonAvatar employee={item} size="sm"/><span className="text-xs font-medium">{item.name}</span></div></td><td className="px-3 py-3 text-xs text-muted-foreground">{item.team}</td><td className="px-3 py-3 text-xs tabular-nums">{item.activeTasks}</td><td className="px-3 py-3 text-xs tabular-nums">{item.priorityTasks}</td><td className="px-3 py-3 text-xs tabular-nums">{item.commitments}</td><td className="px-3 py-3 text-xs tabular-nums">{item.meetings}</td><td className="px-3 py-3"><Status value={item.workload} /></td><td className="px-3 py-3"><div className="flex gap-1"><Button variant="ghost" size="icon" className="size-7 hover:text-risk" aria-label={`Delete ${item.name}`} onClick={(event) => { event.stopPropagation(); removeEmployee(item); }}><Trash2 className="size-3.5" /></Button></div></td></tr>)}</tbody></table></div></Panel>
      <Panel className="p-5"><SectionHeading title="Workload explanation" action={<span className="rounded-full bg-warning/15 p-1.5 text-warning-foreground"><Activity className="size-4" /></span>} /><div className="mb-3 flex items-center gap-3"><PersonAvatar employee={employee} /><div><div className="text-sm font-semibold">{employee.name}</div><div className="text-xs text-muted-foreground">{employee.role} · {employee.team}</div></div><div className="ml-auto"><Status value={employee.workload} /></div></div><p className="mb-4 text-sm leading-6 text-muted-foreground">{employee.workload === "High" ? "High workload risk" : `${employee.workload} workload`}: {employee.priorityTasks} high-priority tasks, {employee.commitments} upcoming commitments and {employee.meetings} scheduled meetings{tasks.filter((item) => item.ownerId === selected && item.status === "Blocked").length > 0 ? `, with ${tasks.filter((item) => item.ownerId === selected && item.status === "Blocked").length} task blocked by dependencies` : ""}.</p><div className="mb-4 space-y-2">{employeeTasks.slice(0, 4).map((item) => <div key={item.id} className="flex items-center justify-between gap-2 border-b border-border pb-2 text-xs last:border-0"><span className="truncate">{item.name}</span><Status value={item.status} /></div>)}</div><div className="rounded-md border border-intelligence/15 bg-intelligence/5 p-3"><div className="mb-2 text-xs font-semibold text-intelligence">Recommended reprioritization</div><ul className="space-y-1.5 text-xs text-muted-foreground">{(reprioritization[selected] ?? ["Review task priorities for this week"]).map((step) => <li key={step} className="flex gap-2"><Check className="mt-0.5 size-3.5 shrink-0 text-success" />{step}</li>)}</ul><div className="mt-2 text-[10px] text-muted-foreground">Illustrative suggestions for the demo scenario · human judgment applies.</div></div><div className="mt-3 text-[10px] text-muted-foreground">Data connected to MongoDB backend.</div></Panel></div><Dialog open={formOpen} onOpenChange={setFormOpen}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Add employee to MongoDB</DialogTitle><DialogDescription>This will save the record directly to your MongoDB Atlas cluster.</DialogDescription></DialogHeader><div className="space-y-3"><div><label htmlFor="employee-id" className="mb-1.5 block text-xs font-medium">ID (e.g. kasim)</label><Input id="employee-id" value={form.id} onChange={(event) => setForm((current) => ({ ...current, id: event.target.value }))} placeholder="Unique string ID" /></div><div><label htmlFor="employee-name" className="mb-1.5 block text-xs font-medium">Name</label><Input id="employee-name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Full name" /></div><div><label htmlFor="employee-role" className="mb-1.5 block text-xs font-medium">Role</label><Input id="employee-role" value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} placeholder="Job title" /></div><div><label htmlFor="employee-team" className="mb-1.5 block text-xs font-medium">Team</label><Select value={form.team} onValueChange={(value) => setForm((current) => ({ ...current, team: value }))}><SelectTrigger id="employee-team" className="bg-card"><SelectValue /></SelectTrigger><SelectContent>{[...new Set(defaultEmployees.map((item) => item.team))].map((team) => <SelectItem key={team} value={team}>{team}</SelectItem>)}</SelectContent></Select></div></div><DialogFooter><Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button><Button onClick={saveEmployee}>Save to MongoDB</Button></DialogFooter></DialogContent></Dialog></>;
}

function MeetingPage() {
  const [selectedId, setSelectedId] = useState(meetings[0]!.id);
  const [employeeId, setEmployeeId] = useState("maya");
  const [decisions, setDecisions] = useState<Record<string, "attend" | "skip">>({});
  const selected = meetings.find((item) => item.id === selectedId) ?? meetings[0]!;
  const matchedEmployee = employeeId === selected.employeeId;
  const relevance = matchedEmployee ? selected.relevance : "Low Relevance";
  const reason = matchedEmployee ? selected.reason : "No matching task, commitment or decision requiring participation was found in the available demonstration data.";
  const decision = decisions[`${selectedId}:${employeeId}`];
  const recordDecision = (choice: "attend" | "skip") => {
    setDecisions((current) => ({ ...current, [`${selectedId}:${employeeId}`]: choice }));
    toast.success(choice === "attend" ? `Marked attending for ${selected.name}.` : `Marked skipped for ${selected.name}.`, { description: "Recorded in this demo session only — no calendar or external system is updated." });
  };
  return <><PageHeading path="/meetings" eyebrow="Demo assessment" /><div className="mb-4 flex items-center justify-between rounded-md border border-warning/25 bg-warning/10 px-3 py-2 text-xs text-warning-foreground"><span className="flex items-center gap-2"><Sparkles className="size-4" />Assessment is simulated from demonstration data, not real AI inference.</span><Button variant="ghost" size="sm" className="h-7 text-warning-foreground" onClick={() => toast.info("Demo assessment only. No attendance decision is sent to your calendar.")}>About this demo</Button></div>
    <div className="grid gap-5 lg:grid-cols-[minmax(270px,0.8fr)_minmax(0,1.45fr)]"><Panel className="overflow-hidden"><div className="border-b border-border px-4 py-3"><div className="text-sm font-semibold">Upcoming meetings</div><div className="mt-0.5 text-xs text-muted-foreground">4 meetings · this week</div></div><div className="divide-y divide-border">{meetings.map((item) => <button key={item.id} onClick={() => { setSelectedId(item.id); setEmployeeId(item.employeeId); }} className={cn("w-full px-4 py-4 text-left transition-colors hover:bg-muted/40", selectedId === item.id && "border-l-2 border-l-primary bg-accent/40")}><div className="mb-1 flex items-center justify-between gap-2"><span className="text-xs font-semibold">{item.name}</span><ChevronRight className="size-3.5 shrink-0 text-muted-foreground" /></div><div className="text-[11px] text-muted-foreground">{item.date}</div><div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground"><span>{project(item.projectId).name}</span><span>·</span><span>{item.participants.length} participants</span></div></button>)}</div></Panel>
    <Panel className="p-5"><div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><div className="mb-1 text-xs text-muted-foreground">{selected.date} · {project(selected.projectId).name}</div><h2 className="text-lg font-semibold">{selected.name}</h2></div><Status value={relevance} /></div><div className="mb-5 grid gap-4 sm:grid-cols-2"><div><div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Agenda</div><ul className="space-y-2">{selected.agenda.map((item) => <li key={item} className="flex gap-2 text-xs"><span className="mt-1 size-1.5 shrink-0 rounded-full bg-intelligence" />{item}</li>)}</ul></div><div><div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Participants</div><div className="flex flex-wrap gap-1.5">{selected.participants.map((name) => <Badge key={name} variant="secondary" className="text-[10px]">{name}</Badge>)}</div><label className="mb-1.5 mt-4 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="meeting-employee">Assess attendance for</label><Select value={employeeId} onValueChange={(value) => { setEmployeeId(value); }}><SelectTrigger id="meeting-employee" className="bg-card text-xs"><SelectValue /></SelectTrigger><SelectContent>{defaultEmployees.map((item) => <SelectItem key={item.id} value={item.id}>{item.name} · {item.team}</SelectItem>)}</SelectContent></Select></div></div><div className="mb-5 rounded-md border border-border bg-muted/30 p-4"><div className="mb-2 flex items-center gap-2 text-xs font-semibold"><Lightbulb className="size-4 text-intelligence" />Relevance assessment <span className="font-normal text-muted-foreground">· demo output</span></div><p className="text-sm leading-6 text-muted-foreground">{reason}</p></div><div className="mb-5"><div className="mb-2 flex items-center justify-between"><h3 className="text-xs font-semibold">Related tasks and commitments</h3><Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={() => toast.info("Evidence comes from linked demo records.")}>View evidence</Button></div>{matchedEmployee && selected.taskIds.length ? selected.taskIds.map((taskId) => { const task = tasks.find((item) => item.id === taskId); const commitment = commitments.find((item) => item.taskId === taskId); return task ? <div key={task.id} className="mb-2 flex items-center justify-between gap-3 border-b border-border pb-2 text-xs"><span className="truncate">{task.name}{commitment && <span className="ml-2 text-muted-foreground">· commitment {commitment.deadline}</span>}</span><Status value={task.status} /></div> : null; }) : <div className="text-xs text-muted-foreground">No related work found in the demo records.</div>}</div><div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4"><div className="flex items-center gap-2 text-[11px] text-muted-foreground"><span>Suggested decision: <strong className="text-foreground">{relevance === "Low Relevance" ? "Optional" : "Attend"}</strong></span>{decision && <Status value={decision === "attend" ? "Attending" : "Skipped"} />}</div><div className="flex gap-2"><Button variant="ghost" size="sm" onClick={() => toast.info(`Recommendation: ${relevance === "Low Relevance" ? "Attendance appears optional." : "Attendance supports a related commitment."}`)}>Review recommendation</Button><Button size="sm" variant={decision === "skip" ? "secondary" : "outline"} onClick={() => recordDecision("skip")}>{decision === "skip" ? <><Check className="size-3.5" />Skipped</> : "Skip"}</Button><Button size="sm" onClick={() => recordDecision("attend")}>{decision === "attend" ? <><Check className="size-3.5" />Attending</> : "Attend"}</Button></div></div></Panel></div></>;
}

function DependenciesPage({ openNode, selectedNode, setSelectedNode }: { openNode: boolean; selectedNode: string | null; setSelectedNode: (value: string | null) => void }) {
  const [projectFilter, setProjectFilter] = useState("all");
  const [graphReady, setGraphReady] = useState(false);
  useEffect(() => { setGraphReady(true); }, []);
  const availableNodes = dependencyNodes.filter((item) => projectFilter === "all" || item.projectId === projectFilter);
  const node = dependencyNodes.find((item) => item.id === selectedNode);
  const upEdges = dependencyEdges.filter((edge) => edge.target === node?.id);
  const downEdges = dependencyEdges.filter((edge) => edge.source === node?.id);
  return <><PageHeading path="/dependencies" eyebrow="Cross-signal map" /><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="flex size-2 rounded-full bg-warning" />2 at risk <span className="ml-2 flex size-2 rounded-full bg-risk" />2 blocked <span className="ml-2 flex size-2 rounded-full bg-success" />2 healthy</div><Select value={projectFilter} onValueChange={setProjectFilter}><SelectTrigger className="w-[180px] bg-card text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All projects</SelectItem>{projects.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></div>
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]"><Panel className="workspace-grid relative min-h-[580px] overflow-hidden">{graphReady ? <Suspense fallback={<div className="flex h-[580px] items-center justify-center text-sm text-muted-foreground">Loading dependency map…</div>}><DependencyGraph nodes={availableNodes} edges={dependencyEdges.filter((edge) => availableNodes.some((item) => item.id === edge.source) && availableNodes.some((item) => item.id === edge.target))} selectedNode={selectedNode} onNodeSelect={setSelectedNode} /></Suspense> : <div className="flex h-[580px] items-center justify-center text-sm text-muted-foreground">Preparing dependency map…</div>}<div className="absolute left-4 top-4 z-10 rounded-md border border-border bg-card/95 px-3 py-2 text-[10px] text-muted-foreground shadow-sm">Drag to pan · scroll to zoom</div><Button variant="outline" size="icon" className="absolute bottom-4 right-4 z-10 bg-card" aria-label="Fit graph to view" onClick={() => toast.info("Graph fitted to the visible workspace.")}><Network className="size-4" /></Button></Panel>
    <Panel className="p-5"><SectionHeading title="Node details" action={<GitBranch className="size-4 text-intelligence" />} />{node ? <><div className="mb-4"><div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{node.type}</div><div className="mt-1 text-base font-semibold">{node.label}</div><div className="mt-2 flex gap-2"><Status value={node.status} /><Badge variant="outline" className="text-[10px]">{project(node.projectId).name}</Badge></div></div><div className="mb-4 text-xs text-muted-foreground">Owner or team <span className="ml-1 font-medium text-foreground">{node.owner}</span><span className="mx-2 text-border">·</span>Affected team <span className="ml-1 font-medium text-foreground">{projectTeams[node.projectId] ?? "—"}</span></div><div className="border-t border-border pt-4"><div className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Upstream blockers</div>{upEdges.length ? upEdges.map((edge) => { const item = dependencyNodes.find((candidate) => candidate.id === edge.source); return item ? <button key={edge.id} onClick={() => setSelectedNode(item.id)} className="mb-2 flex w-full items-center justify-between gap-2 text-left text-xs hover:text-primary"><span>{item.label}</span><Status value={item.status} /></button> : null; }) : <p className="text-xs text-muted-foreground">No upstream blockers.</p>}</div><div className="mt-4 border-t border-border pt-4"><div className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Downstream impact</div>{downEdges.length ? downEdges.map((edge) => { const item = dependencyNodes.find((candidate) => candidate.id === edge.target); return item ? <button key={edge.id} onClick={() => setSelectedNode(item.id)} className="mb-2 flex w-full items-center justify-between gap-2 text-left text-xs hover:text-primary"><span>{item.label}</span><ChevronRight className="size-3" /></button> : null; }) : <p className="text-xs text-muted-foreground">No downstream items.</p>}</div><div className="mt-4 rounded-md border border-warning/20 bg-warning/10 p-3 text-xs leading-5 text-warning-foreground">{node.status === "Blocked" ? "This item is waiting on an upstream dependency. Confirm the owner and delivery checkpoint." : node.status === "At risk" ? "A date or handoff may put downstream work at risk. Review the next checkpoint." : "No immediate dependency risk in the current demo scenario."}</div><Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => toast.info(`Suggested next step for ${node.label}: confirm its next owner checkpoint.`)}>Suggested next step</Button></> : <div className="flex min-h-64 flex-col items-center justify-center text-center"><div className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted"><Network className="size-5 text-muted-foreground" /></div><div className="text-sm font-medium">Select a node</div><p className="mt-1 text-xs text-muted-foreground">Choose an item in the dependency map to inspect its connections.</p></div>}</Panel></div><div className="mt-4 rounded-md border border-border bg-card px-4 py-3 text-xs text-muted-foreground"><div className="flex flex-wrap items-center gap-1.5"><span className="mr-1 font-medium text-foreground">Chain in this demo:</span>{[["Root issue", "Migration and documentation delays"], ["Blocked task", "API integration"], ["Affected team", projectTeams["payment"]], ["Project impact", "Payments beta at risk"]].map(([label, value], index) => <span key={label} className="flex items-center gap-1.5"><span>{label} <span className="font-medium text-foreground">{value}</span></span>{index < 3 && <ChevronRight className="size-3 text-muted-foreground" />}</span>)}</div><div className="mt-1.5">Database migration and API documentation are both upstream of integration; testing and the beta milestone depend on those handoffs.</div></div></>;
}

function RiskPage() {
  const [projectId, setProjectId] = useState("payment");
  const selected = project(projectId);
  const trend = [{ week: "Sep 22", risk: 46 }, { week: "Sep 29", risk: 52 }, { week: "Oct 06", risk: 59 }, { week: "Oct 13", risk: 67 }, { week: "Oct 19", risk: selected.risk }];
  return <><PageHeading path="/risk" eyebrow="Illustrative model view" /><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="text-sm text-muted-foreground">Project health, delivery signals and suggested interventions.</div><Select value={projectId} onValueChange={setProjectId}><SelectTrigger className="w-[190px] bg-card text-xs"><SelectValue /></SelectTrigger><SelectContent>{projects.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></div><div className="mb-4 rounded-md border border-warning/30 bg-warning/10 px-4 py-3 text-xs font-semibold tracking-wide text-warning-foreground">DEMO DATA — Not a live ML prediction.</div>
    <div className="mb-5 grid gap-4 md:grid-cols-4"><Panel className="p-4 md:col-span-1"><div className="text-xs text-muted-foreground">Illustrative risk estimate</div><div className="mt-2 flex items-baseline gap-1"><span className="text-3xl font-semibold">{selected.risk}</span><span className="text-sm text-muted-foreground">%</span></div><div className="mt-2"><Status value={selected.health} /></div><div className="mt-3 text-[10px] text-muted-foreground">Synthetic scenario value</div></Panel>{[{ label: "Unresolved dependencies", value: selected.id === "payment" ? "02" : "01", icon: GitBranch, tone: "text-warning-foreground" }, { label: "Overdue commitments", value: selected.id === "payment" ? "03" : "01", icon: Clock3, tone: "text-risk" }, { label: "Workload pressure", value: selected.id === "payment" ? "High" : "Moderate", icon: UsersRound, tone: "text-warning-foreground" }].map(({ label, value, icon: Icon, tone }) => <Panel key={label} className="p-4"><div className="flex justify-between text-xs text-muted-foreground"><span>{label}</span><Icon className={cn("size-4", tone)} /></div><div className="mt-4 text-xl font-semibold">{value}</div><div className="mt-1 text-[10px] text-muted-foreground">{selected.name} · demo data</div></Panel>)}</div>
    <div className="mb-5 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]"><Panel className="p-5"><SectionHeading title="Project risk trend" action={<span className="text-[10px] text-muted-foreground">Illustrative · last 5 weeks</span>} /><div className="h-[230px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={trend}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)"/><XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }}/><YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }}/><Tooltip contentStyle={{ borderRadius: 6, border: "1px solid var(--color-border)", fontSize: 12 }}/><Line type="monotone" dataKey="risk" name="Risk estimate" stroke="var(--color-risk)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--color-risk)" }}/></LineChart></ResponsiveContainer></div></Panel><Panel className="p-5"><SectionHeading title="Why is this project at risk?" action={<ShieldAlert className="size-4 text-risk" />} /><div className="space-y-4">{[{ label: "Dependency chain", score: "High", desc: "Migration delay blocks API integration and downstream testing." }, { label: "Commitment timing", score: "High", desc: "Documentation delivery and a test handoff converge this week." }, { label: "Team capacity", score: "Elevated", desc: "Three high-priority tasks and two commitments overlap for Maya." }].map((factor) => <div key={factor.label} className="flex gap-3 border-b border-border pb-3 last:border-0 last:pb-0"><div className="mt-1 size-2 shrink-0 rounded-full bg-warning"/><div className="flex-1"><div className="flex justify-between gap-2 text-xs font-medium"><span>{factor.label}</span><Status value={factor.score}/></div><p className="mt-1 text-xs leading-5 text-muted-foreground">{factor.desc}</p></div></div>)}</div></Panel></div>
    <div className="grid gap-4 lg:grid-cols-2"><Panel className="p-5"><SectionHeading title="Unresolved dependencies" action={<Link to="/dependencies"><Button variant="ghost" size="sm">Explore map <ArrowRight className="size-3.5" /></Button></Link>} />{dependencyNodes.filter((item) => item.projectId === selected.id && ["At risk", "Blocked"].includes(item.status)).slice(0, 4).map((node) => <div key={node.id} className="flex items-center justify-between gap-2 border-b border-border py-2 last:border-0"><div className="min-w-0"><div className="truncate text-xs font-medium">{node.label}</div><div className="mt-1 text-[10px] text-muted-foreground">{node.owner} · {project(node.projectId).name}</div></div><Status value={node.status}/></div>)}</Panel><Panel className="p-5"><SectionHeading title="Recommended interventions" action={<Lightbulb className="size-4 text-warning-foreground" />} />{recommendations.filter((item) => item.projectId === selected.id).map((item) => <div key={item.id} className="mb-3 flex gap-2 border-b border-border pb-3 last:mb-0 last:border-0 last:pb-0"><span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-intelligence/10 text-[10px] text-intelligence"><ArrowRight className="size-3"/></span><div className="min-w-0 flex-1"><div className="text-xs font-medium">{item.title}</div><p className="mt-1 text-[11px] leading-5 text-muted-foreground">{item.action}</p></div></div>)}<div className="mt-3 text-[10px] text-muted-foreground">Interventions require human review.</div></Panel></div><div className="mt-5 rounded-md border border-border bg-card p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="text-sm font-semibold">Upcoming milestone</div><div className="mt-1 text-xs text-muted-foreground">{selected.milestone} · Project lead {selected.lead}</div></div><Status value={selected.health}/></div></div></>;
}

type ReviewRecord = { status: "Pending" | "Approved" | "Rejected"; reason?: string };

function ApprovalsPage() {
  const [reviews, setReviews] = useState<Record<string, ReviewRecord>>({});
  const [active, setActive] = useState<(typeof recommendations)[number] | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const statusOf = (id: string) => reviews[id]?.status ?? "Pending";
  const updateStatus = (itemId: string, status: "Approved" | "Rejected", reason?: string) => {
    setReviews((current) => ({ ...current, [itemId]: { status, ...(reason ? { reason } : {}) } }));
    toast.success(`${status} in this demonstration session.`);
    setRejectOpen(false);
    setDetailOpen(false);
  };
  return <><PageHeading path="/approvals" eyebrow="Human review required" /><div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-md border border-intelligence/20 bg-intelligence/5 px-4 py-3"><div className="flex items-center gap-2 text-xs"><div className="flex size-8 items-center justify-center rounded-full bg-intelligence/10 text-intelligence"><UsersRound className="size-4"/></div><span><strong>{recommendations.filter((item) => statusOf(item.id) === "Pending").length} pending recommendations</strong><span className="ml-1 text-muted-foreground">· No action is taken outside this demo.</span></span></div><Badge variant="outline" className="border-intelligence/20 bg-card text-intelligence">Decision log · local demo state</Badge></div><div className="grid gap-4 xl:grid-cols-2">{recommendations.map((item) => <Panel key={item.id} className="flex flex-col p-5"><div className="mb-4 flex items-start justify-between gap-3"><div><div className="mb-2 flex flex-wrap gap-2"><Status value={item.issue === "Workload warning" ? "Medium" : "High"}/><Status value={statusOf(item.id)}/></div><h2 className="text-base font-semibold">{item.title}</h2><div className="mt-1 text-xs text-muted-foreground">{project(item.projectId).name} · Created {item.created}</div></div><Button variant="ghost" size="icon" aria-label="More options" onClick={() => { setActive(item); setDetailOpen(true); }}><MoreHorizontal className="size-4"/></Button></div><p className="mb-4 text-sm leading-6 text-muted-foreground">{item.explanation}</p><div className="mb-4 grid gap-3 rounded-md bg-muted/35 p-3 sm:grid-cols-2"><div><div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Supporting evidence</div><div className="text-xs leading-5">{item.evidence}</div></div><div><div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Expected benefit</div><div className="text-xs leading-5">{item.benefit}</div></div></div><div className="mb-5 rounded-md border-l-2 border-intelligence bg-intelligence/5 px-3 py-2.5"><div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-intelligence">Proposed action</div><div className="text-xs leading-5">{item.action}</div></div>{reviews[item.id]?.reason && <div className="mb-3 text-xs text-muted-foreground">Reason: {reviews[item.id]?.reason}</div>}<div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4"><Button variant="ghost" size="sm" className="text-xs" onClick={() => { setActive(item); setDetailOpen(true); }}>View details <ArrowRight className="size-3.5"/></Button><div className="flex gap-2"><Button size="sm" variant="outline" disabled={statusOf(item.id) !== "Pending"} onClick={() => { setActive(item); setRejectReason(""); setRejectOpen(true); }}>Reject</Button><Button size="sm" disabled={statusOf(item.id) !== "Pending"} onClick={() => updateStatus(item.id, "Approved")}>Approve <Check className="size-3.5"/></Button></div></div></Panel>)}</div><div className="mt-5 text-center text-[11px] text-muted-foreground">Approvals update this page’s demonstration state only. They do not send messages or change calendars.</div>
    <Dialog open={rejectOpen} onOpenChange={setRejectOpen}><DialogContent><DialogHeader><DialogTitle>Reject recommendation?</DialogTitle><DialogDescription>This changes only the local demonstration state.</DialogDescription></DialogHeader><div><label htmlFor="reject-reason" className="mb-1.5 block text-xs font-medium">Reason (optional)</label><Textarea id="reject-reason" value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} placeholder="Add context for this decision…" /></div><DialogFooter><Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button><Button variant="destructive" onClick={() => active && updateStatus(active.id, "Rejected", rejectReason.trim())}>Reject recommendation</Button></DialogFooter></DialogContent></Dialog>
    <Dialog open={detailOpen} onOpenChange={setDetailOpen}><DialogContent><DialogHeader><DialogTitle>{active?.title}</DialogTitle><DialogDescription>{active ? `${project(active.projectId).name} · ${active.issue}` : "Recommendation details"}</DialogDescription></DialogHeader>{active && <div className="space-y-3 text-sm"><p className="text-muted-foreground">{active.explanation}</p><div className="rounded-md bg-muted/40 p-3"><div className="text-[10px] font-semibold uppercase text-muted-foreground">Evidence</div><p className="mt-1 text-xs leading-5">{active.evidence}</p></div><div className="rounded-md bg-muted/40 p-3"><div className="text-[10px] font-semibold uppercase text-muted-foreground">Suggested action</div><p className="mt-1 text-xs leading-5">{active.action}</p></div></div>}<DialogFooter><Button variant="outline" onClick={() => setDetailOpen(false)}>Close</Button>{active && statusOf(active.id) === "Pending" && <Button onClick={() => updateStatus(active.id, "Approved")}>Approve</Button>}</DialogFooter></DialogContent></Dialog>
  </>;
}

function SettingsPage({ profile, refreshProfile }: { profile: SignedInProfile | null; refreshProfile: () => void }) {
  const [toggles, setToggles] = useState({ alerts: true, email: false, weekly: true, density: false });
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ display_name: "", job_title: "", team: "" });
  const toggle = (key: keyof typeof toggles) => setToggles((current) => ({ ...current, [key]: !current[key] }));
  const sections = [
    { title: "Workspace preferences", items: [["Project scope", "Projects and teams visible in this workspace", "All projects"], ["Time zone", "Used for deadlines and meeting times", "Eastern Time (UTC−5)"]] },
    { title: "Notification preferences", toggles: [["Priority alerts", "Show in-app alerts for emerging project risks", "alerts"], ["Email digest", "Receive a weekly summary of workspace signals", "email"], ["Weekly overview", "A Monday briefing of important handoffs", "weekly"]] },
    { title: "Display preferences", toggles: [["Compact data tables", "Show more rows with less vertical spacing", "density"]] },
  ];
  const saveProfile = async () => {
    if (!profile) return;
    const name = form.display_name.trim();
    if (!name) { toast.error("Enter a display name."); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({ display_name: name, job_title: form.job_title.trim(), team: form.team.trim() }).eq("id", profile.id);
      if (error) throw error;
      await supabase.auth.updateUser({ data: { display_name: name, job_title: form.job_title.trim(), team: form.team.trim() } });
      refreshProfile();
      toast.success("Profile updated.", { description: "Your name, role and team now show across the workspace." });
      setEditOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not update the profile. Try again.");
    } finally {
      setSaving(false);
    }
  };
  return <><PageHeading path="/settings"/><div className="max-w-3xl space-y-4">
    <Panel className="p-5"><h2 className="mb-4 text-sm font-semibold">Profile details</h2>
      <div className="flex flex-wrap items-center gap-3 py-1">
        <PersonAvatar employee={profileEmployee(profile)} />
        <div className="min-w-0 flex-1"><div className="text-sm font-semibold">{profile?.display_name ?? "Loading…"}</div><div className="text-xs text-muted-foreground">{roleLabelFor(profile, false)}</div>{profile?.email && <div className="mt-0.5 text-[11px] text-muted-foreground">{profile.email}</div>}</div>
        <Button variant="outline" size="sm" disabled={!profile} onClick={() => { setForm({ display_name: profile?.display_name ?? "", job_title: profile?.job_title ?? "", team: profile?.team ?? "" }); setEditOpen(true); }}><Pencil className="size-3.5" />Edit profile</Button>
      </div>
      <div className="mt-3 text-[11px] text-muted-foreground">Your name, role and team come from your account profile and appear across the workspace.</div>
    </Panel>
    {sections.map((section) => <Panel key={section.title} className="p-5"><h2 className="mb-4 text-sm font-semibold">{section.title}</h2><div className="divide-y divide-border">{section.items?.map(([label, help, value]) => <div key={label} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><div><div className="text-xs font-medium">{label}</div><div className="mt-1 text-[11px] text-muted-foreground">{help}</div></div><button onClick={() => toast.info(`${label} is a frontend placeholder in this demo.`)} className="flex min-w-[180px] items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-xs"><span>{value}</span><ChevronDown className="size-3.5 text-muted-foreground"/></button></div>)}{section.toggles?.map(([label, help, key]) => { const setting = key as keyof typeof toggles; return <div key={label} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><div><div className="text-xs font-medium">{label}</div><div className="mt-1 text-[11px] text-muted-foreground">{help}</div></div><button role="switch" aria-checked={toggles[setting]} aria-label={label} onClick={() => toggle(setting)} className={cn("relative h-5 w-9 rounded-full transition-colors", toggles[setting] ? "bg-primary" : "bg-muted-foreground/30")}><span className={cn("absolute top-0.5 size-4 rounded-full bg-background shadow-sm transition-transform", toggles[setting] ? "left-[18px]" : "left-0.5")}/></button></div>; })}</div></Panel>)}
    <div className="flex items-center gap-2 rounded-md border border-warning/25 bg-warning/10 px-4 py-3 text-xs text-warning-foreground"><CircleHelp className="size-4 shrink-0"/>Workspace preferences are frontend placeholders; only your profile details are saved.</div>
    <Dialog open={editOpen} onOpenChange={setEditOpen}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Edit profile</DialogTitle><DialogDescription>Your display name, role and team appear across the workspace.</DialogDescription></DialogHeader><div className="space-y-3">
      <div><label htmlFor="profile-name" className="mb-1.5 block text-xs font-medium">Display name</label><Input id="profile-name" value={form.display_name} onChange={(event) => setForm((current) => ({ ...current, display_name: event.target.value }))} /></div>
      <div><label htmlFor="profile-role" className="mb-1.5 block text-xs font-medium">Role</label><Input id="profile-role" value={form.job_title} onChange={(event) => setForm((current) => ({ ...current, job_title: event.target.value }))} placeholder="e.g. Product Manager" /></div>
      <div><label htmlFor="profile-team" className="mb-1.5 block text-xs font-medium">Team</label><Input id="profile-team" value={form.team} onChange={(event) => setForm((current) => ({ ...current, team: event.target.value }))} placeholder="e.g. Product" /></div>
    </div><DialogFooter><Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button><Button onClick={saveProfile} disabled={saving}>{saving && <Loader2 className="size-4 animate-spin" />}Save changes</Button></DialogFooter></DialogContent></Dialog></div>
  </>;
}

function EmptyState({ message }: { message: string }) { return <div className="flex flex-col items-center justify-center py-14 text-center"><div className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted"><Search className="size-4 text-muted-foreground"/></div><div className="text-sm font-medium">Nothing here yet</div><p className="mt-1 text-xs text-muted-foreground">{message}</p></div>; }

function CommitmentDetail({ item, open, setOpen }: { item: Commitment | null; open: boolean; setOpen: (open: boolean) => void }) {
  if (!item) return null;
  const owner = person(item.ownerId);
  const related = tasks.find((task) => task.id === item.taskId);
  return <Sheet open={open} onOpenChange={setOpen}><SheetContent className="w-full overflow-y-auto sm:max-w-lg"><SheetHeader className="pr-7 text-left"><div className="mb-2 flex gap-2"><Status value={item.status}/><Status value={item.risk}/></div><SheetTitle className="text-left leading-6">{item.statement}</SheetTitle><SheetDescription>{project(item.projectId).name} · {item.source}</SheetDescription></SheetHeader><div className="mt-6 space-y-5"><div className="grid grid-cols-2 gap-4 rounded-md bg-muted/35 p-4"><div><div className="mb-2 text-[10px] font-semibold uppercase text-muted-foreground">Owner</div><div className="flex items-center gap-2 text-xs"><PersonAvatar employee={owner} size="sm"/>{owner.name}</div></div><div><div className="mb-2 text-[10px] font-semibold uppercase text-muted-foreground">Recipient</div><div className="text-xs">{item.recipient}</div></div><div><div className="mb-2 text-[10px] font-semibold uppercase text-muted-foreground">Deadline</div><div className="text-xs">{item.deadline}</div></div><div><div className="mb-2 text-[10px] font-semibold uppercase text-muted-foreground">Project</div><div className="text-xs">{project(item.projectId).name}</div></div></div><div><div className="mb-2 text-xs font-semibold">Source transcript excerpt</div><blockquote className="border-l-2 border-intelligence bg-intelligence/5 py-2 pl-3 text-xs leading-5 text-muted-foreground">“{item.transcript}”</blockquote><div className="mt-1 text-[10px] text-muted-foreground">Recorded in {item.source}</div></div><div><div className="mb-2 text-xs font-semibold">Related task</div><div className="flex items-center justify-between gap-2 rounded-md border border-border p-3 text-xs"><span>{related?.name ?? "No linked task"}</span>{related && <Status value={related.status}/>}</div></div><div><div className="mb-2 text-xs font-semibold">Potential impact</div><p className="text-xs leading-5 text-muted-foreground">{item.impact}</p></div><div className="rounded-md border border-intelligence/20 bg-intelligence/5 p-4"><div className="mb-1 flex items-center gap-2 text-xs font-semibold text-intelligence"><Lightbulb className="size-4"/>Suggested next action</div><p className="text-xs leading-5">{item.nextAction}</p><div className="mt-3 text-[10px] text-muted-foreground">Demonstration suggestion · human review required</div></div><Button className="w-full" onClick={() => { setOpen(false); toast.info("This suggested action is not connected to external systems."); }}>Review suggested action</Button></div></SheetContent></Sheet>;
}

export function WorkspacePage({ page }: { page: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { profile, loading: profileLoading, refresh: refreshProfile } = useProfile();
  const pathname = useRouterState({ select: (router) => router.location.pathname });
  const [mobileNav, setMobileNav] = useState(false);
  const [selectedCommitment, setSelectedCommitment] = useState<Commitment | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>("migration");
  const [globalSearch, setGlobalSearch] = useState("");
  const path = titles[pathname] ? pathname : page;
  const title = titles[path] ?? titles["/"];
  const allSearchItems = useMemo(() => [...commitments.map((item) => ({ label: item.statement, path: "/commitments" })), ...projects.map((item) => ({ label: item.name, path: "/risk" })), ...tasks.map((item) => ({ label: item.name, path: "/dependencies" }))], []);
  const searchResults = globalSearch.length > 1 ? allSearchItems.filter((item) => item.label.toLowerCase().includes(globalSearch.toLowerCase())).slice(0, 5) : [];
  const showCommitment = (item: Commitment) => { setSelectedCommitment(item); setDetailOpen(true); };

  const handleSignOut = async () => {
    localStorage.removeItem("enterprise_auth_user");
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("user_profile_") || key.includes("supabase") || key.includes("auth")) {
        localStorage.removeItem(key);
      }
    });
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/auth", search: { next: undefined }, replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="bottom-right" richColors />
      {mobileNav && <button className="fixed inset-0 z-40 bg-foreground/30 md:hidden" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}
      
      <aside className={cn("workspace-sidebar fixed inset-y-0 left-0 z-50 flex w-[254px] flex-col text-sidebar-foreground transition-transform md:translate-x-0", mobileNav ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex h-[68px] items-center gap-3 border-b border-sidebar-border px-5">
          <div className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Blocks className="size-[18px]"/>
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold">Enterprise AI</div>
            <div className="text-[10px] text-sidebar-foreground/65">WORKSPACE</div>
          </div>
          <button onClick={() => setMobileNav(false)} className="ml-auto rounded p-1 text-sidebar-foreground/70 md:hidden" aria-label="Close menu">
            <X className="size-4"/>
          </button>
        </div>
        
        <button onClick={() => toast.info("Enterprise Workspace · demonstration environment")} className="mx-3 mt-4 flex items-center justify-between rounded-md border border-sidebar-border px-3 py-2 text-left">
          <span>
            <span className="block text-[10px] text-sidebar-foreground/60">WORKSPACE</span>
            <span className="mt-0.5 block text-xs font-medium">Acme Corporation</span>
          </span>
          <ChevronDown className="size-3.5 text-sidebar-foreground/60"/>
        </button>
        
        <nav className="mt-5 flex-1 overflow-y-auto px-3">
          {navigation.map((item) => {
            const { title: label, to, icon: Icon } = item;
            const section = "section" in item ? item.section : undefined;
            return (
              <div key={to}>
                {section && <div className={cn("px-2 pb-2 text-[9px] font-semibold tracking-[0.14em] text-sidebar-foreground/45", section !== "WORKSPACE" && "pt-5")}>{section}</div>}
                <Link to={to} onClick={() => setMobileNav(false)} className={cn("group mb-1 flex h-9 items-center gap-3 rounded-md px-2.5 text-[12px] font-medium transition-colors", path === to ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" : "text-sidebar-foreground/75 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground")}>
                  <Icon className={cn("size-4 shrink-0", path === to ? "text-sidebar-primary" : "text-sidebar-foreground/55 group-hover:text-sidebar-accent-foreground")}/>
                  <span className="truncate">{label}</span>
                  {label === "Approval Center" && <span className="ml-auto rounded-full bg-sidebar-primary/20 px-1.5 py-0.5 text-[9px] font-semibold text-sidebar-primary">3</span>}
                </Link>
              </div>
            );
          })}
        </nav>
        
        <div className="mx-3 mb-3 rounded-md border border-sidebar-border bg-sidebar-accent/40 p-3">
          <div className="flex items-center gap-2">
            <div className="size-1.5 rounded-full bg-success"/>
            <span className="text-[10px] font-medium">Demo environment</span>
          </div>
          <div className="mt-1.5 text-[10px] leading-4 text-sidebar-foreground/60">Connected intelligence is simulated with sample data.</div>
        </div>
        
        <div className="border-t border-sidebar-border">
          <button onClick={() => { void navigate({ to: "/settings" }); setMobileNav(false); }} className="flex w-full items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-sidebar-accent/50">
            <PersonAvatar employee={profileEmployee(profile)} size="sm"/>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium">{profile?.display_name ?? (profileLoading ? "Loading…" : "Workspace member")}</div>
              <div className="truncate text-[10px] text-sidebar-foreground/55">{roleLabelFor(profile, profileLoading)}</div>
            </div>
          </button>
          <button onClick={handleSignOut} className="flex w-full items-center gap-2 px-4 pb-3 text-[11px] font-medium text-sidebar-foreground/70 transition-colors hover:text-sidebar-foreground">
            <LogOut className="size-3.5" />Sign out
          </button>
        </div>
      </aside>

      <main className="min-h-screen md:pl-[254px]">
        <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-md md:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="icon" className="-ml-2 md:hidden" aria-label="Open menu" onClick={() => setMobileNav(true)}>
              <Menu className="size-5"/>
            </Button>
            <div className="hidden items-center gap-2 text-[11px] text-muted-foreground sm:flex">
              <span>Acme Corporation</span>
              <ChevronRight className="size-3"/>
            </div>
            <div className="truncate text-xs font-semibold sm:text-sm">{title}</div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative hidden w-64 md:block">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"/>
              <Input aria-label="Search workspace" placeholder="Search workspace..." className="h-8 pl-8 pr-14 text-xs" value={globalSearch} onChange={(event) => setGlobalSearch(event.target.value)}/>
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border px-1 text-[9px] text-muted-foreground">⌘ K</kbd>
              {searchResults.length > 0 && (
                <div className="absolute right-0 top-10 z-50 w-full rounded-md border border-border bg-popover p-1 shadow-lg">
                  {searchResults.map((result) => (
                    <Link key={`${result.path}-${result.label}`} to={result.path} onClick={() => setGlobalSearch("")} className="block rounded px-2 py-2 text-xs hover:bg-muted">
                      {result.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            <Button variant="ghost" size="icon" aria-label="Notifications" className="relative" onClick={() => toast.info("You are up to date with the latest workspace signals.")}>
              <Bell className="size-4"/>
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-risk ring-2 ring-background"/>
            </Button>
            
            <div className="ml-1 hidden h-7 w-px bg-border sm:block"/>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-md p-1 hover:bg-muted" aria-label="Account menu">
                  <PersonAvatar employee={profileEmployee(profile)} size="sm"/>
                  <span className="hidden text-xs font-medium lg:block">{profile?.display_name ?? "Account"}</span>
                  <ChevronDown className="hidden size-3 text-muted-foreground lg:block"/>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="text-sm font-semibold">{profile?.display_name ?? "Workspace member"}</div>
                  <div className="text-xs font-normal text-muted-foreground">{profile?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => void navigate({ to: "/settings" })}>
                  Profile settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-risk focus:text-risk">
                  <LogOut className="size-3.5" />Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] p-4 pb-10 md:p-7 xl:p-8">
          {path === "/" ? <Overview openCommitment={showCommitment} profile={profile}/> : path === "/commitments" ? <CommitmentPage openCommitment={showCommitment}/> : path === "/workload" ? <WorkloadPage/> : path === "/meetings" ? <MeetingPage/> : path === "/dependencies" ? <DependenciesPage openNode={true} selectedNode={selectedNode} setSelectedNode={setSelectedNode}/> : path === "/risk" ? <RiskPage/> : path === "/approvals" ? <ApprovalsPage/> : <SettingsPage profile={profile} refreshProfile={refreshProfile}/>}
        </div>
      </main>

      <CommitmentDetail item={selectedCommitment} open={detailOpen} setOpen={setDetailOpen}/>
    </div>
  );
}