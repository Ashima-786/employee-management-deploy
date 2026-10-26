import { createFileRoute } from "@tanstack/react-router";
import { WorkspacePage } from "@/components/workspace";

export const Route = createFileRoute("/_authenticated/risk")({
  head: () => ({ meta: [
    { title: "Project Risk Center · Enterprise AI Workspace" },
    { name: "description", content: "Inspect illustrative project risk factors, unresolved dependencies and suggested interventions." },
    { property: "og:title", content: "Project Risk Center · Enterprise AI Workspace" },
    { property: "og:description", content: "Understand the signals contributing to project delivery risk." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Risk,
});

function Risk() { return <WorkspacePage page="/risk" />; }