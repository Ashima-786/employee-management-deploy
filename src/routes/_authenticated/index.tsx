import { createFileRoute } from "@tanstack/react-router";
import { WorkspacePage } from "@/components/workspace";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Intelligence Overview · Enterprise AI Workspace" },
      { name: "description", content: "Connect workplace signals, surface emerging risks and review recommended actions in the Enterprise AI Workspace." },
      { property: "og:title", content: "Intelligence Overview · Enterprise AI Workspace" },
      { property: "og:description", content: "A connected view of commitments, workload, meetings, dependencies and project risk." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <WorkspacePage page="/" />;
}
