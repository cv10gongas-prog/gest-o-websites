import { Save } from "lucide-react";
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
  PRIORIDADES,
  TIPOS_TAREFA,
  deInputDateTime,
  paraInputDateTime,
  type Prioridade,
  type Task,
  type TaskType,
} from "@/lib/crm";
import { useBusinesses, useGuardarTarefa, useProfiles } from "@/lib/queries";

export function DialogTarefa({
  aberto,
  onFechar,
  tarefa,
  businessIdInicial,
}: {
  aberto: boolean;
  onFechar: () => void;
  tarefa?: Task | null;
  businessIdInicial?: string;
}) {
  const [titulo, setTitulo] = useState(tarefa?.titulo ?? "");
  const [tipo, setTipo] = useState<TaskType>(tarefa?.tipo ?? "ligar");
  const [prioridade, setPrioridade] = useState<Prioridade>(tarefa?.prioridade ?? "media");
  const [dataHora, setDataHora] = useState(paraInputDateTime(tarefa?.data_hora));
  const [responsavel, setResponsavel] = useState(tarefa?.responsavel ?? "");
  const [businessId, setBusinessId] = useState(tarefa?.business_id ?? businessIdInicial ?? "");
  const [notas, setNotas] = useState(tarefa?.notas ?? "");

  const { data: perfis = [] } = useProfiles();
  const { data: negocios = [] } = useBusinesses();
  const guardar = useGuardarTarefa();

  async function submeter() {
    if (!titulo.trim()) return;
    await guardar.mutateAsync({
      id: tarefa?.id,
      titulo: titulo.trim(),
      tipo,
      prioridade,
      data_hora: deInputDateTime(dataHora),
      responsavel: responsavel || null,
      business_id: businessId || null,
      notas: notas || null,
    });
    onFechar();
  }

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      largura="max-w-xl"
      titulo={tarefa ? "Editar tarefa" : "Nova tarefa"}
      descricao="Associa a tarefa a um projeto de site e define o responsável."
      rodape={
        <>
          <button className={btnSecundario} onClick={onFechar}>
            Cancelar
          </button>
          <button className={btnPrimario} onClick={submeter} disabled={!titulo.trim() || guardar.isPending}>
            <Save className="size-4" /> Guardar tarefa
          </button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo label="Título" className="sm:col-span-2">
          <input className={inputClass} value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        </Campo>
        <Campo label="Tipo">
          <select className={selectClass} value={tipo} onChange={(e) => setTipo(e.target.value as TaskType)}>
            {TIPOS_TAREFA.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Campo>
        <Campo label="Prioridade">
          <select
            className={selectClass}
            value={prioridade}
            onChange={(e) => setPrioridade(e.target.value as Prioridade)}
          >
            {PRIORIDADES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </Campo>
        <Campo label="Data e hora">
          <input
            className={inputClass}
            type="datetime-local"
            value={dataHora}
            onChange={(e) => setDataHora(e.target.value)}
          />
        </Campo>
        <Campo label="Responsável">
          <select className={selectClass} value={responsavel} onChange={(e) => setResponsavel(e.target.value)}>
            <option value="">—</option>
            {perfis.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome || p.email}
              </option>
            ))}
          </select>
        </Campo>
        <Campo label="Projeto de site associado" className="sm:col-span-2">
          <select className={selectClass} value={businessId} onChange={(e) => setBusinessId(e.target.value)}>
            <option value="">Sem projeto</option>
            {negocios.map((n) => (
              <option key={n.id} value={n.id}>
                {n.nome}
              </option>
            ))}
          </select>
        </Campo>
        <Campo label="Notas" className="sm:col-span-2">
          <textarea className={textareaClass} value={notas} onChange={(e) => setNotas(e.target.value)} />
        </Campo>
      </div>
    </Modal>
  );
}
