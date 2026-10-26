import { createFileRoute } from "@tanstack/react-router";
import { WorkspacePage } from "@/components/workspace";

export const Route = createFileRoute("/_authenticated/workload")({
  head: () => ({ meta: [
    { title: "Workload Intelligence · Enterprise AI Workspace" },
    { name: "description", content: "Explore illustrative employee workload signals, task distribution and upcoming deadlines." },
    { property: "og:title", content: "Workload Intelligence · Enterprise AI Workspace" },
    { property: "og:description", content: "Understand workload factors across people, tasks, commitments and meetings." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Workload,
});

function Workload() { return <WorkspacePage page="/workload" />; }