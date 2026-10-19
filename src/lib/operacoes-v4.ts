import { dominio, normalizaTelefone, type Business, type Task } from "@/lib/crm";

export type FiltroOperacoes = "todas" | "urgentes" | "seguimentos" | "propostas" | "novos";
export type ItemOperacao = {
  negocio: Business;
  pontos: number;
  urgencia: "alta" | "media" | "normal";
  motivo: string;
  detalhe: string;
  tarefasAtrasadas: number;
  tarefasHoje: number;
  seguimentoAtrasado: boolean;
  seguimentoHoje: boolean;
  semContacto: boolean;
  proposta: boolean;
};

const TERMINAIS = new Set(["aceite", "concluido", "nao_interessado", "arquivado"]);
const PROPOSTAS = new Set(["email_por_enviar", "proposta_enviada", "em_negociacao"]);

/** Datas de tarefas no fuso horário do utilizador, não em UTC. */
export function dataLocal(valor: Date = new Date()): string {
  if (Number.isNaN(valor.getTime())) return "";
  const z = (n: number) => String(n).padStart(2, "0");
  return `${valor.getFullYear()}-${z(valor.getMonth() + 1)}-${z(valor.getDate())}`;
}

function dia(valor?: string | null): string | null {
  if (!valor) return null;
  const convertido = new Date(valor);
  return Number.isNaN(convertido.getTime()) ? null : dataLocal(convertido);
}

export function prepararOperacoes(negocios: Business[], tarefas: Task[], agora = new Date()) {
  const hoje = dataLocal(agora);
  const pendentes = tarefas.filter((t) => t.estado === "pendente");
  const atrasadas = pendentes.filter((t) => { const d = dia(t.data_hora); return d !== null && d < hoje; });
  const paraHoje = pendentes.filter((t) => dia(t.data_hora) === hoje);
  const semData = pendentes.filter((t) => !t.data_hora);
  const ativas = negocios.filter((n) => !TERMINAIS.has(n.estado));
  const ganhas = negocios.filter((n) => n.estado === "aceite" || n.estado === "concluido");
  const porContactar = ativas.filter((n) => n.estado === "por_contactar");
  const propostas = ativas.filter((n) => PROPOSTAS.has(n.estado));

  const tarefasPorNegocio = new Map<string, Task[]>();
  for (const tarefa of pendentes) {
    if (!tarefa.business_id) continue;
    const lista = tarefasPorNegocio.get(tarefa.business_id) ?? [];
    lista.push(tarefa);
    tarefasPorNegocio.set(tarefa.business_id, lista);
  }
  const fila: ItemOperacao[] = ativas.map((negocio) => {
    const associadas = tarefasPorNegocio.get(negocio.id) ?? [];
    const tarefasAtrasadas = associadas.filter((t) => { const d = dia(t.data_hora); return d !== null && d < hoje; }).length;
    const tarefasHoje = associadas.filter((t) => dia(t.data_hora) === hoje).length;
    const seguimentoDia = dia(negocio.data_seguimento);
    const seguimentoAtrasado = seguimentoDia !== null && seguimentoDia < hoje;
    const seguimentoHoje = seguimentoDia !== null && seguimentoDia === hoje;
    const semContacto = negocio.estado === "por_contactar";
    const proposta = PROPOSTAS.has(negocio.estado);
    const ultimaAtividade = dia(negocio.ultima_interacao || negocio.updated_at || negocio.created_at);
    const diasSemAtividade = ultimaAtividade ? Math.floor((new Date(hoje + "T12:00:00").getTime() - new Date(ultimaAtividade + "T12:00:00").getTime()) / 86400000) : 0;

    // Motivos independentes: não apresentar uma empresa como "urgente" só por ser prioridade alta.
    let pontos = 0;
    let motivo = "Acompanhamento comercial";
    let detalhe = negocio.proxima_acao?.trim() || "Abrir a ficha para definir a próxima ação";
    if (negocio.prioridade === "alta") pontos += 15;
    if (negocio.prioridade === "media") pontos += 5;
    if (diasSemAtividade >= 14) pontos += 10;
    if (semContacto) { pontos += 12; motivo = "Primeiro contacto"; detalhe = "Ainda por contactar"; }
    if (proposta) { pontos += 18; motivo = "Proposta em curso"; detalhe = negocio.proxima_acao || "Rever proposta e resposta do cliente"; }
    if (seguimentoHoje) { pontos += 45; motivo = "Seguimento para hoje"; detalhe = negocio.proxima_acao || "Contactar o cliente hoje"; }
    if (seguimentoAtrasado) { pontos += 65; motivo = "Seguimento em atraso"; detalhe = negocio.proxima_acao || "Contacto por realizar"; }
    if (tarefasHoje) { pontos += 35; motivo = "Tarefa para hoje"; detalhe = `${tarefasHoje} tarefa(s) marcada(s) para hoje`; }
    if (tarefasAtrasadas) { pontos += 80; motivo = "Tarefa em atraso"; detalhe = `${tarefasAtrasadas} tarefa(s) por concluir`; }
    const urgencia = tarefasAtrasadas || seguimentoAtrasado ? "alta" : tarefasHoje || seguimentoHoje ? "media" : "normal";
    return { negocio, pontos, urgencia, motivo, detalhe, tarefasAtrasadas, tarefasHoje,
      seguimentoAtrasado, seguimentoHoje, semContacto, proposta };
  }).sort((a, b) => b.pontos - a.pontos || a.negocio.nome.localeCompare(b.negocio.nome, "pt-PT"));

  const semContactoRelevante = ativas.filter((n) => !n.email && !n.telefone && !n.website).length;
  const seguimentosVencidos = fila.filter((n) => n.seguimentoAtrasado || n.seguimentoHoje);
  const valorAberto = ativas.reduce((s, n) => s + (Number(n.valor_estimado) || 0), 0);
  const valorGanho = ganhas.reduce((s, n) => s + (Number(n.valor_estimado) || 0), 0);
  return { fila, ativas, ganhas, porContactar, propostas, pendentes, atrasadas, paraHoje, semData,
    seguimentosVencidos, semContactoRelevante, valorAberto, valorGanho };
}

export function filtrarOperacoes(fila: ItemOperacao[], filtro: FiltroOperacoes, pesquisa: string): ItemOperacao[] {
  const texto = pesquisa.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-PT").trim();
  return fila.filter((item) => {
    if (filtro === "urgentes" && item.urgencia === "normal") return false;
    if (filtro === "seguimentos" && !item.seguimentoAtrasado && !item.seguimentoHoje) return false;
    if (filtro === "propostas" && !item.proposta) return false;
    if (filtro === "novos" && !item.semContacto) return false;
    if (!texto) return true;
    const n = item.negocio;
    return [n.nome, n.categoria, n.localidade, n.website, n.email, n.telefone, n.proxima_acao]
      .some((v) => (v || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-PT").includes(texto));
  });
}

export type PossivelDuplicado = { primeiro: Business; segundo: Business; motivo: string };
/** Só sinaliza coincidências fortes; nunca funde nem apaga automaticamente. */
export function encontrarParesDuplicados(negocios: Business[], limite = 30): PossivelDuplicado[] {
  const comparar = (s?: string | null) => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase("pt-PT").replace(/\s+/g, " ");
  const candidatos = new Map<string, Business>();
  const pares = new Map<string, PossivelDuplicado>();
  function registar(chave: string, n: Business, motivo: string) {
    const outro = candidatos.get(chave);
    if (!outro) { candidatos.set(chave, n); return; }
    if (outro.id === n.id) return;
    const ids = [outro.id, n.id].sort().join("::");
    if (!pares.has(ids)) pares.set(ids, { primeiro: outro, segundo: n, motivo });
  }
  for (const n of negocios) {
    const website = dominio(n.website || n.website_dominio);
    const email = comparar(n.email);
    const telefone = normalizaTelefone(n.telefone);
    const nome = comparar(n.nome);
    const cidade = comparar(n.localidade);
    if (website && website.includes(".")) registar(`site:${website}`, n, "Mesmo domínio");
    if (email && email.includes("@")) registar(`email:${email}`, n, "Mesmo email");
    if (telefone && telefone.length >= 9) registar(`tel:${telefone}`, n, "Mesmo telefone");
    if (nome && cidade) registar(`nome:${nome}|${cidade}`, n, "Mesmo nome e localidade");
  }
  return Array.from(pares.values()).slice(0, Math.max(0, limite));
}
