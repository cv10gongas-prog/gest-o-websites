import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Clock3, Mail, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Campo, Chip, Panel } from "@/components/crm/Bits";
import { btnPrimario, inputClass, selectClass, textareaClass } from "@/components/crm/Modal";
import { SiteChrome } from "@/components/site/SiteChrome";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto e pedido de orçamento — Nova Web Studio" },
      {
        name: "description",
        content:
          "Peça um orçamento para o seu website ou marque uma reunião com a equipa da Nova Web Studio.",
      },
      { property: "og:title", content: "Contacto e pedido de orçamento — Nova Web Studio" },
      {
        property: "og:description",
        content: "Conte-nos o que precisa. Respondemos em 24 horas úteis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contacto,
});

const TIPOS = [
  "Website institucional",
  "Loja online",
  "Landing page",
  "Aplicação web",
  "Redesign de site existente",
  "Outro",
];

const ORCAMENTOS = ["Até 1.000 €", "1.000 € – 2.500 €", "2.500 € – 5.000 €", "Mais de 5.000 €"];

function Contacto() {
  const [nome, setNome] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipoProjeto, setTipoProjeto] = useState(TIPOS[0]);
  const [orcamento, setOrcamento] = useState(ORCAMENTOS[0]);
  const [mensagem, setMensagem] = useState("");
  const [querReuniao, setQuerReuniao] = useState(false);
  const [aEnviar, setAEnviar] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) {
      toast.error("Indique o nome e o email.");
      return;
    }
    setAEnviar(true);
    const { error } = await supabase.from("website_requests").insert({
      nome: nome.trim(),
      empresa: empresa.trim() || null,
      email: email.trim(),
      telefone: telefone.trim() || null,
      tipo_projeto: tipoProjeto,
      orcamento,
      mensagem: mensagem.trim() ? `${mensagem.trim()}\n\nOrigem: Website público` : "Origem: Website público",
      quer_reuniao: querReuniao,
    });
    setAEnviar(false);
    if (error) {
      toast.error("Não foi possível enviar o pedido. Tente novamente.");
      return;
    }
    setEnviado(true);
    toast.success("Pedido enviado. Entramos em contacto em breve.");
  }

  return (
    <SiteChrome>
      <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
        <section>
          <Chip tone="primary">Contacto</Chip>
          <h1 className="orbit-gradient-text mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Vamos falar sobre o seu projeto
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Preencha o formulário com o máximo de detalhe possível. Analisamos o pedido e enviamos
            uma proposta com prazos e valores.
          </p>

          <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Clock3 className="size-4" /> Resposta em 24 horas úteis
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4" /> geral@novawebstudio.pt
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-4" /> Portugal · trabalho remoto
            </li>
          </ul>
        </section>

        <Panel title="Pedido de orçamento" subtitle="Sem compromisso.">
          {enviado ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle2 className="size-8 text-primary" />
              <p className="text-sm font-medium">Pedido recebido, obrigado!</p>
              <p className="text-xs text-muted-foreground">
                A nossa equipa entra em contacto pelo email indicado.
              </p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={submeter}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo label="Nome *">
                  <input
                    className={inputClass}
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </Campo>
                <Campo label="Empresa">
                  <input
                    className={inputClass}
                    value={empresa}
                    onChange={(e) => setEmpresa(e.target.value)}
                  />
                </Campo>
                <Campo label="Email *">
                  <input
                    className={inputClass}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Campo>
                <Campo label="Telefone">
                  <input
                    className={inputClass}
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                  />
                </Campo>
                <Campo label="Tipo de projeto">
                  <select
                    className={selectClass}
                    value={tipoProjeto}
                    onChange={(e) => setTipoProjeto(e.target.value)}
                  >
                    {TIPOS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Campo>
                <Campo label="Orçamento previsto">
                  <select
                    className={selectClass}
                    value={orcamento}
                    onChange={(e) => setOrcamento(e.target.value)}
                  >
                    {ORCAMENTOS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </Campo>
              </div>

              <Campo label="Mensagem">
                <textarea
                  className={textareaClass}
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Descreva o que pretende, prazos e referências."
                />
              </Campo>

              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={querReuniao}
                  onChange={(e) => setQuerReuniao(e.target.checked)}
                  className="size-4 rounded border-input bg-secondary/40"
                />
                Quero marcar uma reunião de apresentação
              </label>

              <button className={`${btnPrimario} w-full`} disabled={aEnviar}>
                {aEnviar ? "A enviar…" : "Enviar pedido"}
              </button>
            </form>
          )}
        </Panel>
      </div>
    </SiteChrome>
  );
}
