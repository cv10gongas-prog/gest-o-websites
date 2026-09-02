import { PhoneCall } from "lucide-react";
import { useState } from "react";

import { Campo } from "@/components/crm/Bits";
import {
  Modal,
  btnPrimario,
  btnSecundario,
  inputClass,
  selectClass,
  textareaClass,
} from "@/components/crm/Modal";
import {
  RESULTADOS,
  deInputDateTime,
  type Business,
  type CallOutcome,
} from "@/lib/crm";
import { useRegistarChamada } from "@/lib/queries";

export function DialogChamada({
  aberto,
  onFechar,
  negocio,
}: {
  aberto: boolean;
  onFechar: () => void;
  negocio: Business;
}) {
  const [resultado, setResultado] = useState<CallOutcome>("nao_atendeu");
  const [notas, setNotas] = useState("");
  const [proximoPasso, setProximoPasso] = useState("");
  const [dataProximo, setDataProximo] = useState("");
  const [criarTarefaEmail, setCriarTarefaEmail] = useState(false);

  // campos de oportunidade
  const [pretende, setPretende] = useState("");
  const [tipoProjeto, setTipoProjeto] = useState("");
  const [precoIndicado, setPrecoIndicado] = useState("");
  const [orcamento, setOrcamento] = useState("");
  const [emailDecisor, setEmailDecisor] = useState("");
  const [portefolio, setPortefolio] = useState(false);
  const [proposta, setProposta] = useState(false);
  const [reuniao, setReuniao] = useState(false);
  const [proximaConversa, setProximaConversa] = useState("");
  const [probabilidade, setProbabilidade] = useState(50);

  const registar = useRegistarChamada();
  const info = RESULTADOS.find((r) => r.value === resultado);
  const eInteressado = resultado === "interessado";
  const eFerias = resultado === "ferias";
  const eNaoAtendeu = resultado === "nao_atendeu";

  async function guardar() {
    await registar.mutateAsync({
      interacao: {
        business_id: negocio.id,
        tipo: "chamada",
        resultado,
        notas: notas || null,
        proximo_passo: proximoPasso || null,
        data_proximo_contacto: deInputDateTime(dataProximo),
      },
      novoEstado: info?.estado,
      proximaAccao: proximoPasso || info?.label || null,
      dataSeguimento: deInputDateTime(dataProximo),
      oportunidade: eInteressado
        ? {
            pretende: pretende || null,
            tipo_projeto: tipoProjeto || null,
            preco_indicado: precoIndicado ? Number(precoIndicado) : null,
            orcamento_previsto: orcamento ? Number(orcamento) : null,
            email_decisor: emailDecisor || null,
            portefolio_solicitado: portefolio,
            proposta_solicitada: proposta,
            reuniao_online: reuniao,
            data_proxima_conversa: deInputDateTime(proximaConversa),
            probabilidade,
          }
        : null,
      tarefa:
        eNaoAtendeu && criarTarefaEmail
          ? {
              titulo: `Enviar email a ${negocio.nome}`,
              tipo: "enviar_email",
              prioridade: "alta",
              data_hora: deInputDateTime(dataProximo) ?? new Date().toISOString(),
            }
          : null,
    });
    onFechar();
  }

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      largura="max-w-2xl"
      titulo={`Registar chamada · ${negocio.nome}`}
      descricao="Guarda o resultado, as notas e o próximo passo."
      rodape={
        <>
          <button className={btnSecundario} onClick={onFechar}>
            Cancelar
          </button>
          <button className={btnPrimario} onClick={guardar} disabled={registar.isPending}>
            <PhoneCall className="size-4" /> Guardar chamada
          </button>
        </>
      }
    >
      <div className="grid gap-4">
        <Campo label="Resultado da chamada">
          <select
            className={selectClass}
            value={resultado}
            onChange={(e) => setResultado(e.target.value as CallOutcome)}
          >
            {RESULTADOS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </Campo>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Próximo passo">
            <input
              className={inputClass}
              value={proximoPasso}
              onChange={(e) => setProximoPasso(e.target.value)}
              placeholder="Ex.: voltar a ligar na segunda"
            />
          </Campo>
          <Campo label={eFerias ? "Voltar a ligar em (obrigatório)" : "Data do próximo contacto"}>
            <input
              className={inputClass}
              type="datetime-local"
              value={dataProximo}
              onChange={(e) => setDataProximo(e.target.value)}
            />
          </Campo>
        </div>

        {eNaoAtendeu && (
          <label className="flex items-center gap-2 rounded-xl border border-border bg-secondary/30 p-3 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-[var(--primary)]"
              checked={criarTarefaEmail}
              onChange={(e) => setCriarTarefaEmail(e.target.checked)}
            />
            Criar tarefa para enviar email a este cliente
          </label>
        )}

        {eInteressado && (
          <div className="rounded-xl border border-success/25 bg-success/5 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[.15em] text-success">
              Detalhes da oportunidade
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="O que o cliente pretende" className="sm:col-span-2">
                <textarea
                  className={textareaClass}
                  value={pretende}
                  onChange={(e) => setPretende(e.target.value)}
                />
              </Campo>
              <Campo label="Tipo de website/projeto">
                <input
                  className={inputClass}
                  value={tipoProjeto}
                  onChange={(e) => setTipoProjeto(e.target.value)}
                  placeholder="Ex.: site institucional"
                />
              </Campo>
              <Campo label="Email do decisor">
                <input
                  className={inputClass}
                  value={emailDecisor}
                  onChange={(e) => setEmailDecisor(e.target.value)}
                />
              </Campo>
              <Campo label="Preço indicado (€)">
                <input
                  className={inputClass}
                  type="number"
                  value={precoIndicado}
                  onChange={(e) => setPrecoIndicado(e.target.value)}
                />
              </Campo>
              <Campo label="Orçamento previsto (€)">
                <input
                  className={inputClass}
                  type="number"
                  value={orcamento}
                  onChange={(e) => setOrcamento(e.target.value)}
                />
              </Campo>
              <Campo label="Data da próxima conversa">
                <input
                  className={inputClass}
                  type="datetime-local"
                  value={proximaConversa}
                  onChange={(e) => setProximaConversa(e.target.value)}
                />
              </Campo>
              <Campo label={`Probabilidade de fechar · ${probabilidade}%`}>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={probabilidade}
                  onChange={(e) => setProbabilidade(Number(e.target.value))}
                  className="mt-3 w-full accent-[var(--primary)]"
                />
              </Campo>
              <div className="flex flex-wrap gap-4 text-sm sm:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="size-4 accent-[var(--primary)]"
                    checked={portefolio}
                    onChange={(e) => setPortefolio(e.target.checked)}
                  />
                  Portefólio solicitado
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="size-4 accent-[var(--primary)]"
                    checked={proposta}
                    onChange={(e) => setProposta(e.target.checked)}
                  />
                  Proposta solicitada
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="size-4 accent-[var(--primary)]"
                    checked={reuniao}
                    onChange={(e) => setReuniao(e.target.checked)}
                  />
                  Reunião online
                </label>
              </div>
            </div>
          </div>
        )}

        <Campo label="Notas da chamada">
          <textarea className={textareaClass} value={notas} onChange={(e) => setNotas(e.target.value)} />
        </Campo>
      </div>
    </Modal>
  );
}
