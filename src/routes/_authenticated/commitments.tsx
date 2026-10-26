import { createFileRoute } from "@tanstack/react-router";
import { WorkspacePage } from "@/components/workspace";

export const Route = createFileRoute("/_authenticated/commitments")({
  head: () => ({ meta: [
    { title: "Commitment Intelligence · Enterprise AI Workspace" },
    { name: "description", content: "Track workplace promises, deadlines and delivery risks across connected project signals." },
    { property: "og:title", content: "Commitment Intelligence · Enterprise AI Workspace" },
    { property: "og:description", content: "Review commitments, evidence and potential impact across the workspace." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Commitments,
});

function Commitments() { return <WorkspacePage page="/commitments" />; }