import { createFileRoute } from "@tanstack/react-router";
import { WorkspacePage } from "@/components/workspace";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [
    { title: "Settings · Enterprise AI Workspace" },
    { name: "description", content: "View workspace, notification, display and profile preferences for the Enterprise AI Workspace demo." },
    { property: "og:title", content: "Settings · Enterprise AI Workspace" },
    { property: "og:description", content: "Frontend demonstration preferences for the enterprise intelligence workspace." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Settings,
});

function Settings() { return <WorkspacePage page="/settings" />; }