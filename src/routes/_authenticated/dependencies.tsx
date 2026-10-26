import { createFileRoute } from "@tanstack/react-router";
import { WorkspacePage } from "@/components/workspace";

export const Route = createFileRoute("/_authenticated/dependencies")({
  head: () => ({ meta: [
    { title: "Dependency Explorer · Enterprise AI Workspace" },
    { name: "description", content: "Trace task, commitment and milestone dependencies in an interactive project graph." },
    { property: "og:title", content: "Dependency Explorer · Enterprise AI Workspace" },
    { property: "og:description", content: "Explore upstream blockers and downstream impacts across connected work." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Dependencies,
});

function Dependencies() { return <WorkspacePage page="/dependencies" />; }