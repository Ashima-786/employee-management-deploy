export type Health = "Healthy" | "At risk" | "Blocked" | "Completed";

export type Employee = {
  id: string;
  name: string;
  role: string;
  team: string;
  initials: string;
  color: "blue" | "green" | "amber" | "rose" | "violet";
  activeTasks: number;
  priorityTasks: number;
  commitments: number;
  meetings: number;
  workload: "Balanced" | "Elevated" | "High";
};

export type Project = {
  id: string;
  name: string;
  lead: string;
  health: Health;
  risk: number;
  milestone: string;
};

export type Commitment = {
  id: string;
  statement: string;
  ownerId: string;
  recipient: string;
  deadline: string;
  source: string;
  projectId: string;
  status: "Upcoming" | "At Risk" | "Completed" | "Overdue";
  risk: "Low" | "Medium" | "High";
  taskId: string;
  transcript: string;
  impact: string;
  nextAction: string;
};

export type Task = {
  id: string;
  name: string;
  ownerId: string;
  projectId: string;
  priority: "High" | "Medium" | "Low";
  status: Health;
  due: string;
};

export const employees: Employee[] = [
  { id: "alex", name: "Alex Morgan", role: "Product Manager", team: "Product", initials: "AM", color: "blue", activeTasks: 6, priorityTasks: 2, commitments: 2, meetings: 4, workload: "Elevated" },
  { id: "maya", name: "Maya Chen", role: "Engineering Lead", team: "Platform", initials: "MC", color: "violet", activeTasks: 8, priorityTasks: 3, commitments: 2, meetings: 5, workload: "High" },
  { id: "jordan", name: "Jordan Lee", role: "Backend Engineer", team: "Platform", initials: "JL", color: "green", activeTasks: 5, priorityTasks: 2, commitments: 1, meetings: 3, workload: "Elevated" },
  { id: "priya", name: "Priya Nair", role: "UX Designer", team: "Design", initials: "PN", color: "rose", activeTasks: 4, priorityTasks: 1, commitments: 1, meetings: 2, workload: "Balanced" },
  { id: "sam", name: "Sam Rivera", role: "QA Engineer", team: "Quality", initials: "SR", color: "amber", activeTasks: 7, priorityTasks: 2, commitments: 1, meetings: 3, workload: "Elevated" },
];

export const projects: Project[] = [
  { id: "payment", name: "Payment Platform", lead: "Maya Chen", health: "At risk", risk: 78, milestone: "Payments beta · Oct 30" },
  { id: "identity", name: "Identity Refresh", lead: "Alex Morgan", health: "Healthy", risk: 24, milestone: "Release candidate · Nov 06" },
  { id: "data", name: "Data Foundation", lead: "Jordan Lee", health: "At risk", risk: 61, milestone: "Warehouse launch · Nov 12" },
  { id: "mobile", name: "Mobile Experience", lead: "Priya Nair", health: "Healthy", risk: 19, milestone: "Design sign-off · Nov 18" },
];

export const tasks: Task[] = [
  { id: "migration", name: "Complete database migration", ownerId: "jordan", projectId: "payment", priority: "High", status: "At risk", due: "Oct 21" },
  { id: "api", name: "Build API integration", ownerId: "maya", projectId: "payment", priority: "High", status: "Blocked", due: "Oct 23" },
  { id: "docs", name: "Publish API documentation", ownerId: "maya", projectId: "payment", priority: "High", status: "At risk", due: "Oct 23" },
  { id: "tests", name: "Run payment test suite", ownerId: "sam", projectId: "payment", priority: "High", status: "Blocked", due: "Oct 27" },
  { id: "ledger", name: "Finalize ledger schema", ownerId: "jordan", projectId: "payment", priority: "Medium", status: "Healthy", due: "Oct 24" },
  { id: "tokens", name: "Refresh design tokens", ownerId: "priya", projectId: "mobile", priority: "Medium", status: "Healthy", due: "Oct 26" },
  { id: "audit", name: "Review access audit", ownerId: "alex", projectId: "identity", priority: "Low", status: "Healthy", due: "Oct 29" },
  { id: "auth", name: "Verify SSO flows", ownerId: "sam", projectId: "identity", priority: "Medium", status: "Healthy", due: "Nov 02" },
];

export const commitments: Commitment[] = [
  { id: "c1", statement: "Publish API documentation for payment endpoints", ownerId: "maya", recipient: "Payments team", deadline: "Fri, Oct 23", source: "Payments sync · Oct 16", projectId: "payment", status: "At Risk", risk: "High", taskId: "docs", transcript: "Maya: I'll have the API documentation ready by Friday so the payments team can start their integration tests.", impact: "Payment integration testing cannot begin until endpoint behavior and error codes are documented.", nextAction: "Review the documentation scope with Maya and confirm a delivery checkpoint by Wednesday." },
  { id: "c2", statement: "Complete the database migration", ownerId: "jordan", recipient: "Platform engineering", deadline: "Wed, Oct 21", source: "Platform stand-up · Oct 16", projectId: "payment", status: "At Risk", risk: "High", taskId: "migration", transcript: "Jordan: The production migration should be complete by Wednesday. We need to validate the backfill first.", impact: "The API integration and test environment both depend on the migration completing.", nextAction: "Pair with the database owner to confirm the backfill window and rollback plan." },
  { id: "c3", statement: "Share the revised onboarding flow", ownerId: "priya", recipient: "Customer success", deadline: "Mon, Oct 26", source: "Design review · Oct 15", projectId: "mobile", status: "Upcoming", risk: "Low", taskId: "tokens", transcript: "Priya: I'll share the revised flow with customer success early next week.", impact: "Customer success needs the flow before updating their launch materials.", nextAction: "Keep the review on Monday's design check-in." },
  { id: "c4", statement: "Confirm the SSO edge-case checklist", ownerId: "sam", recipient: "Security team", deadline: "Thu, Oct 22", source: "Identity weekly · Oct 15", projectId: "identity", status: "Upcoming", risk: "Medium", taskId: "auth", transcript: "Sam: I can send the final SSO edge-case checklist by Thursday afternoon.", impact: "Security sign-off is scheduled after the checklist review.", nextAction: "Add a short security review slot to the team calendar." },
  { id: "c5", statement: "Review access audit findings", ownerId: "alex", recipient: "Identity team", deadline: "Tue, Oct 20", source: "Planning · Oct 14", projectId: "identity", status: "Overdue", risk: "Medium", taskId: "audit", transcript: "Alex: I'll go through the access audit notes before the Tuesday planning session.", impact: "The team is holding the final permission changes until the findings are reviewed.", nextAction: "Reschedule a 20-minute review and share findings asynchronously." },
  { id: "c6", statement: "Approve the ledger schema", ownerId: "jordan", recipient: "Finance systems", deadline: "Oct 16", source: "Payments sync · Oct 12", projectId: "payment", status: "Completed", risk: "Low", taskId: "ledger", transcript: "Jordan: I'll send the approved ledger schema by Friday.", impact: "Finance systems can proceed with their reconciliation setup.", nextAction: "No follow-up needed." },
  { id: "c7", statement: "Provide test coverage summary", ownerId: "sam", recipient: "Project leads", deadline: "Mon, Oct 26", source: "QA planning · Oct 16", projectId: "payment", status: "Upcoming", risk: "Medium", taskId: "tests", transcript: "Sam: I will share the coverage gaps with the project leads Monday morning.", impact: "The release decision depends on closing the payment-path coverage gaps.", nextAction: "Confirm test environment readiness after the migration." },
];

export const meetings = [
  { id: "m1", name: "Payments integration checkpoint", date: "Today · 2:00 PM", projectId: "payment", participants: ["Maya Chen", "Jordan Lee", "Sam Rivera"], agenda: ["Database migration readiness", "API contract and error codes", "Testing window and blockers"], employeeId: "maya", relevance: "High Relevance", reason: "Maya owns the API documentation commitment and an unresolved API dependency expected to be discussed.", taskIds: ["api", "docs"] },
  { id: "m2", name: "Mobile design critique", date: "Tomorrow · 10:30 AM", projectId: "mobile", participants: ["Priya Nair", "Alex Morgan", "Design team"], agenda: ["Review onboarding flow", "Accessibility feedback", "Next design handoff"], employeeId: "priya", relevance: "High Relevance", reason: "Priya owns the onboarding design and its upcoming customer success handoff.", taskIds: ["tokens"] },
  { id: "m3", name: "Quarterly operations forum", date: "Thu, Oct 22 · 3:00 PM", projectId: "data", participants: ["Operations", "Finance", "Project leads"], agenda: ["Quarterly metrics", "Process updates", "Open discussion"], employeeId: "jordan", relevance: "Low Relevance", reason: "No matching task, commitment or decision requiring Jordan's participation was found in the demonstration data.", taskIds: [] },
  { id: "m4", name: "Security sign-off review", date: "Fri, Oct 23 · 11:00 AM", projectId: "identity", participants: ["Sam Rivera", "Security team", "Alex Morgan"], agenda: ["SSO test evidence", "Access review findings", "Sign-off decision"], employeeId: "sam", relevance: "Moderate Relevance", reason: "Sam owns the SSO edge-case checklist that supports the sign-off discussion.", taskIds: ["auth"] },
];

export const recommendations = [
  { id: "r1", title: "Set an API documentation checkpoint", projectId: "payment", issue: "Commitment at risk", explanation: "Maya's Friday documentation commitment may delay payment integration testing.", evidence: "Commitment c1 · API integration task · Payments sync transcript", benefit: "Surface scope or ownership gaps before the testing window narrows.", action: "Schedule a 15-minute scope review with Maya by Wednesday.", created: "Today · 9:12 AM" },
  { id: "r2", title: "Confirm the database migration window", projectId: "payment", issue: "Dependency risk", explanation: "A migration delay would block API integration and downstream payment testing.", evidence: "Task migration → API integration → Payment test suite", benefit: "Give downstream owners a reliable start date and a recovery path.", action: "Ask Platform to confirm the backfill and rollback plan.", created: "Today · 8:42 AM" },
  { id: "r3", title: "Rebalance Maya's near-term workload", projectId: "payment", issue: "Workload warning", explanation: "Three high-priority tasks and two commitments converge before Friday.", evidence: "Workload view · commitments c1 and c2 · tasks api and docs", benefit: "Protect the highest-impact delivery without adding work to an overloaded week.", action: "Move one lower-priority review or delegate documentation QA.", created: "Yesterday · 4:18 PM" },
];

export const alerts = [
  { id: "a1", title: "Commitment at risk", description: "API documentation promised for Friday may delay the payment integration.", projectId: "payment", person: "Maya Chen · Platform", severity: "High", time: "12 min ago", commitmentId: "c1" },
  { id: "a2", title: "Workload warning", description: "Three high-priority tasks and two upcoming commitments overlap for one employee.", projectId: "payment", person: "Maya Chen · Platform", severity: "Medium", time: "38 min ago", commitmentId: "c1" },
  { id: "a3", title: "Dependency risk", description: "A delayed database migration may block API integration and downstream testing.", projectId: "payment", person: "Jordan Lee · Platform", severity: "High", time: "1 hr ago", commitmentId: "c2" },
  { id: "a4", title: "Project risk", description: "Payment Platform has unresolved dependencies and an approaching milestone.", projectId: "payment", person: "Payments team", severity: "High", time: "2 hrs ago", commitmentId: "c2" },
];

export const dependencyNodes = [
  { id: "migration", label: "Database migration", type: "task", status: "At risk" as Health, owner: "Jordan Lee", projectId: "payment" },
  { id: "api", label: "API integration", type: "task", status: "Blocked" as Health, owner: "Maya Chen", projectId: "payment" },
  { id: "docs", label: "API documentation", type: "commitment", status: "At risk" as Health, owner: "Maya Chen", projectId: "payment" },
  { id: "tests", label: "Payment testing", type: "task", status: "Blocked" as Health, owner: "Sam Rivera", projectId: "payment" },
  { id: "milestone", label: "Payments beta", type: "milestone", status: "At risk" as Health, owner: "Payments team", projectId: "payment" },
  { id: "payment", label: "Payment Platform", type: "project", status: "At risk" as Health, owner: "Maya Chen", projectId: "payment" },
  { id: "tokens", label: "Design token refresh", type: "task", status: "Healthy" as Health, owner: "Priya Nair", projectId: "mobile" },
  { id: "mobile", label: "Mobile design sign-off", type: "milestone", status: "Healthy" as Health, owner: "Design team", projectId: "mobile" },
];

export const dependencyEdges = [
  { id: "e1", source: "migration", target: "api", animated: true },
  { id: "e2", source: "docs", target: "api" },
  { id: "e3", source: "api", target: "tests", animated: true },
  { id: "e4", source: "tests", target: "milestone" },
  { id: "e5", source: "milestone", target: "payment" },
  { id: "e6", source: "tokens", target: "mobile" },
];

// Demo-only reprioritization guidance, one set per employee, referencing actual task IDs.
export const reprioritization: Record<string, string[]> = {
  maya: [
    "Delegate documentation QA for the API guide to a peer reviewer before Thursday",
    "Move the ledger schema review to next week — Jordan already owns that track",
    "Reserve a two-hour focus block for the API integration contract before Friday",
  ],
  jordan: [
    "Pair with the database owner to lock the backfill window and rollback plan",
    "Hand the approved ledger schema handoff note to finance systems",
  ],
  priya: [
    "Keep the onboarding flow review on Monday's design check-in — no changes needed",
  ],
  alex: [
    "Reschedule the 20-minute access audit review and share findings asynchronously",
  ],
  sam: [
    "Confirm the test environment is ready after the migration before sharing coverage gaps",
    "Send the SSO edge-case checklist by Thursday afternoon as planned",
  ],
};

// Affected team per project, used to explain downstream dependency impact.
export const projectTeams: Record<string, string> = {
  payment: "Payments team",
  identity: "Security & Identity",
  data: "Data & Analytics",
  mobile: "Design & Mobile",
};

// Meeting-day reference dates used by the simulated extraction demo.
export const demoWeek = {
  weekdays: { monday: "Oct 26", tuesday: "Oct 20", wednesday: "Oct 21", thursday: "Oct 22", friday: "Oct 23" } as Record<string, string>,
  sampleTranscript: "Maya: I'll have the API documentation ready by Friday so the payments team can start their integration tests.",
};
