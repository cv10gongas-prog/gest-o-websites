import { createFileRoute } from "@tanstack/react-router";
import { SegurancaPainel } from "@/components/crm/SegurancaPainel";
import { PinSettings } from "@/components/crm/PinProtecao";

export const Route = createFileRoute("/_authenticated/seguranca")({
  head: () => ({
    meta: [
      { title: "Central de Segurança — Nova Web Studio" },
      {
        name: "description",
        content: "Monitorização forense de acessos, deteção de anomalias e histórico de logins.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SegurancaPage,
});

function SegurancaPage() {
  return <div className="space-y-6"><PinSettings/><SegurancaPainel/></div>;
}
