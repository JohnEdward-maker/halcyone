import { createFileRoute } from "@tanstack/react-router";
import { HalcyoneSite } from "@/components/halcyone-site";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return <HalcyoneSite />;
}
