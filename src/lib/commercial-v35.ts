import type { Business, Task } from "@/lib/crm";
import { dominio, normalizaTelefone } from "@/lib/crm";

/** Comparação conservadora: contactos e domínio, ou nome e localidade conhecida. */
export function corresponderNegocio(
  candidato: { nome?: string | null; email?: string | null; telefone?: string | null; website?: string | null; localidade?: string | null },
  negocios: Business[],
): Business[] {
  const normalizar = (v?: string | null) => (v ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase("pt-PT").replace(/\s+/g, " ");
  const nome = normalizar(candidato.nome);
  const zona = normalizar(candidato.localidade);
  const email = normalizar(candidato.email);
  const tel = normalizaTelefone(candidato.telefone);
  const dom = dominio(candidato.website);
  return negocios.filter(n => {
    if (dom && dom === dominio(n.website || n.website_dominio)) return true;
    if (email && n.email && email === normalizar(n.email)) return true;
    if (tel && n.telefone && tel === normalizaTelefone(n.telefone)) return true;
    return Boolean(nome && zona && nome === normalizar(n.nome) && zona === normalizar(n.localidade));
  });
}

export const FECHADOS = new Set(["concluido", "aceite", "arquivado", "nao_interessado"]);
export function dataLocal(d: Date = new Date()) {
  const a = d.getFullYear();
  return `${a}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
export function resumoComercial(negocios: Business[], tarefas: Task[], hoje = dataLocal()) {
  const activos = negocios.filter(n => !FECHADOS.has(n.estado));
  const porContactar = activos.filter(n => n.estado === "por_contactar");
  const propostas = activos.filter(n => ["email_por_enviar", "proposta_enviada", "em_negociacao"].includes(n.estado));
  const diaTarefa = (valor: string) => dataLocal(new Date(valor));
  const vencidas = tarefas.filter(t => t.estado === "pendente" && !!t.data_hora && diaTarefa(t.data_hora) < hoje);
  const paraHoje = tarefas.filter(t => t.estado === "pendente" && !!t.data_hora && diaTarefa(t.data_hora) === hoje);
  const semData = tarefas.filter(t => t.estado === "pendente" && !t.data_hora);
  const seguimentos = activos.filter(n => n.data_seguimento && diaTarefa(n.data_seguimento) <= hoje);
  return { activos, porContactar, propostas, vencidas, paraHoje, semData, seguimentos,
    conquistados: negocios.filter(n => ["aceite", "concluido"].includes(n.estado)),
    valorOportunidades: activos.reduce((acc,n)=>acc + Number(n.valor_estimado || 0),0),
  };
}

/** Evita criar a mesma tarefa pendente com o mesmo assunto duas vezes. */
export function existeTarefaProposta(tarefas: Task[], negocioId: string, assunto: string) {
  return tarefas.some(t => t.business_id === negocioId && t.estado === "pendente"
    && t.tipo === "enviar_email" && (t.notas || "").includes(`Assunto: ${assunto.slice(0,160)}`));
}
