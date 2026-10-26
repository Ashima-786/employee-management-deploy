import { createFileRoute } from "@tanstack/react-router";
import { WorkspacePage } from "@/components/workspace";

export const Route = createFileRoute("/_authenticated/approvals")({
  head: () => ({ meta: [
    { title: "Approval Center · Enterprise AI Workspace" },
    { name: "description", content: "Review, approve or reject proposed workspace interventions with clear evidence." },
    { property: "og:title", content: "Approval Center · Enterprise AI Workspace" },
    { property: "og:description", content: "Human review for recommended actions across project signals." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Approvals,
});

function Approvals() { return <WorkspacePage page="/approvals" />; }