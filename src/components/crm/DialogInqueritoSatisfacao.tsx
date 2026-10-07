import { useEffect, useMemo, useState } from "react";
import { Check, Copy, ExternalLink, MessageSquareHeart } from "lucide-react";
import { toast } from "sonner";

import {
  Modal,
  btnPrimario,
  btnSecundario,
  inputClass,
  selectClass,
} from "@/components/crm/Modal";
import { useBusinesses } from "@/lib/queries";
import { useCriarInqueritoSatisfacao } from "@/lib/satisfacao.queries";
import { gerarUrlInquerito, type SatisfactionSurvey } from "@/lib/satisfacao";

interface DialogInqueritoSatisfacaoProps {
  aberto: boolean;
  onFechar: () => void;
  businessIdPredefinido?: string;
  onCriado?: (inquerito: SatisfactionSurvey) => void;
}

export function DialogInqueritoSatisfacao({
  aberto,
  onFechar,
  businessIdPredefinido,
  onCriado,
}: DialogInqueritoSatisfacaoProps) {
  const { data: businesses = [] } = useBusinesses();
  const criar = useCriarInqueritoSatisfacao();
  const [businessId, setBusinessId] = useState("");
  const [clientDisplayName, setClientDisplayName] = useState("");
  const [projectName, setProjectName] = useState("Website");
  const [created, setCreated] = useState<SatisfactionSurvey | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    const nextId = businessIdPredefinido ?? businessId ?? businesses[0]?.id ?? "";
    if (!businessId && nextId) setBusinessId(nextId);
  }, [aberto, businessId, businessIdPredefinido, businesses]);

  const selectedBusiness = useMemo(
    () => businesses.find((business) => business.id === (businessIdPredefinido ?? businessId)),
    [businessId, businessIdPredefinido, businesses],
  );

  useEffect(() => {
    if (!aberto || created) return;
    if (selectedBusiness?.nome) setClientDisplayName(selectedBusiness.nome);
  }, [aberto, created, selectedBusiness?.id, selectedBusiness?.nome]);

  const publicUrl = created ? gerarUrlInquerito(created.token) : "";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const finalBusinessId = businessIdPredefinido ?? businessId;
    if (!finalBusinessId) {
      toast.error("Seleciona um cliente / negócio.");
      return;
    }

    try {
      const survey = await criar.mutateAsync({
        businessId: finalBusinessId,
        clientDisplayName: clientDisplayName.trim(),
        projectName: projectName.trim(),
      });
      setCreated(survey);
      onCriado?.(survey);
    } catch {
      // O hook mostra a mensagem de erro.
    }
  }

  async function copyLink() {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success("Ligação copiada.");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Não foi possível copiar a ligação.");
    }
  }

  function close() {
    setCreated(null);
    setCopied(false);
    setProjectName("Website");
    onFechar();
  }

  return (
    <Modal
      aberto={aberto}
      onFechar={close}
      titulo={created ? "Inquérito criado" : "Novo inquérito de satisfação"}
      descricao={
        created
          ? "A ligação pública está pronta para enviar ao cliente."
          : "Escolhe o cliente e identifica o projeto. O cliente responde sem iniciar sessão."
      }
      largura="max-w-md"
      rodape={
        created ? (
          <button type="button" onClick={close} className={btnPrimario}>
            Concluir
          </button>
        ) : (
          <>
            <button type="button" onClick={close} className={btnSecundario}>
              Cancelar
            </button>
            <button
              type="submit"
              form="form-criar-inquerito"
              disabled={criar.isPending}
              className={btnPrimario}
            >
              {criar.isPending ? "A criar..." : "Criar inquérito"}
            </button>
          </>
        )
      }
    >
      {created ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-success/30 bg-success/10 p-4 text-xs">
            <div className="flex items-center gap-2 font-bold text-success">
              <MessageSquareHeart className="size-4" />
              Ligação única criada
            </div>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              O cliente pode responder uma única vez. O link não expõe o ID do negócio nem qualquer
              informação interna do CRM.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Ligação pública</label>
            <div className="flex gap-2">
              <input
                readOnly
                value={publicUrl}
                onClick={(event) => event.currentTarget.select()}
                className="h-10 min-w-0 flex-1 rounded-xl border border-input bg-surface-strong px-3 font-mono text-xs"
              />
              <button
                type="button"
                onClick={copyLink}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-bold text-primary-foreground"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
          </div>

          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            Abrir página pública <ExternalLink className="size-3.5" />
          </a>
        </div>
      ) : (
        <form id="form-criar-inquerito" onSubmit={handleSubmit} className="space-y-4 text-xs">
          {!businessIdPredefinido ? (
            <div className="space-y-1.5">
              <label className="font-semibold">Cliente / Negócio</label>
              <select
                value={businessId}
                onChange={(event) => setBusinessId(event.target.value)}
                className={selectClass}
                required
              >
                <option value="">Selecionar...</option>
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.nome}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <label className="font-semibold">Nome mostrado ao cliente</label>
            <input
              value={clientDisplayName}
              onChange={(event) => setClientDisplayName(event.target.value)}
              className={inputClass}
              maxLength={120}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold">Projeto</label>
            <input
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              placeholder="Ex.: Website institucional"
              className={inputClass}
              maxLength={160}
              required
            />
          </div>

          <div className="rounded-xl border border-border/60 bg-surface-strong/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
            O inquérito mede recomendação (0–20) e serviço, resultado, comunicação, prazos e
            facilidade de trabalhar connosco (0–10), além de feedback escrito opcional.
          </div>
        </form>
      )}
    </Modal>
  );
}
