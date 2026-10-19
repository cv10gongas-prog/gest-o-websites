import { createFileRoute, redirect } from "@tanstack/react-router";

// Links antigos passam a abrir a demo integrada no website novo.
export const Route = createFileRoute("/demo-restaurantes")({
  beforeLoad: () => { throw redirect({ to: "/restaurantes", hash: "demo-nws" }); },
  component: () => null,
});
