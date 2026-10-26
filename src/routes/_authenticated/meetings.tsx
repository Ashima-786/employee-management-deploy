import { createFileRoute } from "@tanstack/react-router";
import { WorkspacePage } from "@/components/workspace";

export const Route = createFileRoute("/_authenticated/meetings")({
  head: () => ({ meta: [
    { title: "Meeting Intelligence · Enterprise AI Workspace" },
    { name: "description", content: "Review meeting relevance against employee responsibilities, related tasks and commitments." },
    { property: "og:title", content: "Meeting Intelligence · Enterprise AI Workspace" },
    { property: "og:description", content: "Explore illustrative attendance recommendations with supporting evidence." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Meetings,
});

function Meetings() { return <WorkspacePage page="/meetings" />; }