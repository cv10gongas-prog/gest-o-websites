import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { ESTADOS, type BusinessStatus, type Tone } from "@/lib/crm";

export const SECCOES = [
  { chave: "/painel", label: "Gestão" },
  { chave: "/negocios", label: "Criação e Modernização de Sites" },
  { chave: "/pipeline", label: "Pipeline" },
  { chave: "/tarefas", label: "Tarefas" },
  { chave: "/emails", label: "Modelos de email" },
  { chave: "/projetos", label: "Projetos" },
  { chave: "/arquivos", label: "Arquivos de projetos" },
  { chave: "/pedidos", label: "Pedidos do site" },
  { chave: "/equipa", label: "Equipa" },
] as const;

/** Secções que já existiam antes de "/arquivos" — usadas para migrar preferências guardadas. */
const SECCOES_ANTIGAS: string[] = [
  "/painel",
  "/negocios",
  "/pipeline",
  "/tarefas",
  "/emails",
  "/projetos",
  "/pedidos",
  "/equipa",
];

export const ATALHOS = [
  { chave: "prioridade", label: "Prioridade alta" },
  { chave: "emails", label: "Emails por enviar" },
  { chave: "seguimentos", label: "Seguimentos" },
] as const;

export const COLUNAS_NEGOCIOS = [
  { chave: "estado", label: "Fase" },
  { chave: "prioridade", label: "Prioridade" },
  { chave: "valor", label: "Valor estimado" },
  { chave: "categoria", label: "Categoria" },
  { chave: "localidade", label: "Localidade" },
  { chave: "contacto", label: "Contacto (telefone/email)" },
  { chave: "responsavel", label: "Responsável" },
  { chave: "interacao", label: "Última interação" },
] as const;

export const CARTOES_PAINEL = [
  { chave: "saudacao", label: "Saudação e resumo do dia" },
  { chave: "m_chamadas", label: "Métrica: chamadas hoje" },
  { chave: "m_interessados", label: "Métrica: interessados" },
  { chave: "m_emails", label: "Métrica: emails enviados" },
  { chave: "m_valor", label: "Métrica: valor em aberto" },
  { chave: "tabela", label: "Tabela de projetos recentes" },
  { chave: "tarefas", label: "Bloco “A fazer agora”" },
  { chave: "oportunidade", label: "Melhor oportunidade" },
] as const;

export const CAMPOS_CARTAO = [
  { chave: "categoria", label: "Categoria e localidade" },
  { chave: "prioridade", label: "Etiqueta de prioridade" },
  { chave: "valor", label: "Valor estimado" },
  { chave: "setas", label: "Setas de mudança de fase" },
  { chave: "responsavel", label: "Responsável" },
] as const;

/** Grupos do formulário de projeto (usados no modal e nas definições). */
export const GRUPOS_CAMPOS = [
  { chave: "identificacao", label: "Identificação" },
  { chave: "contactos", label: "Contactos" },
  { chave: "negocio", label: "Negócio" },
  { chave: "equipa", label: "Equipa" },
  { chave: "seguimento", label: "Seguimento" },
] as const;

export type GrupoCampo = (typeof GRUPOS_CAMPOS)[number]["chave"];

/** Campos do formulário de criação/edição de projeto. */
export const CAMPOS_NEGOCIO: {
  chave: string;
  label: string;
  grupo: GrupoCampo;
  fixo?: boolean;
}[] = [
  { chave: "nome", label: "Nome do cliente / projeto", grupo: "identificacao", fixo: true },
  { chave: "categoria", label: "Categoria", grupo: "identificacao" },
  { chave: "localidade", label: "Localidade", grupo: "identificacao" },
  { chave: "telefone", label: "Telefone", grupo: "contactos" },
  { chave: "email", label: "Email", grupo: "contactos" },
  { chave: "website", label: "Website", grupo: "contactos" },
  { chave: "google_maps", label: "Google Maps", grupo: "contactos" },
  { chave: "responsavel_nome", label: "Nome do responsável", grupo: "contactos" },
  { chave: "valor_estimado", label: "Valor estimado (€)", grupo: "negocio" },
  { chave: "estado", label: "Fase", grupo: "negocio" },
  { chave: "prioridade", label: "Prioridade", grupo: "negocio" },
  { chave: "encontrado_por", label: "Quem encontrou o cliente", grupo: "equipa" },
  { chave: "contactado_por", label: "Quem efetuou a chamada", grupo: "equipa" },
  { chave: "proxima_acao", label: "Próxima ação", grupo: "seguimento" },
  { chave: "data_seguimento", label: "Data de seguimento", grupo: "seguimento" },
  { chave: "notas", label: "Notas", grupo: "seguimento" },
];

/** Tipos disponíveis para campos personalizados. */
export const TIPOS_CAMPO = [
  { chave: "texto", label: "Texto curto" },
  { chave: "texto_longo", label: "Texto longo" },
  { chave: "numero", label: "Número" },
  { chave: "data", label: "Data" },
  { chave: "selecao", label: "Lista de opções" },
  { chave: "booleano", label: "Sim / Não" },
] as const;

export type TipoCampo = (typeof TIPOS_CAMPO)[number]["chave"];

export type CampoExtra = {
  chave: string;
  label: string;
  tipo: TipoCampo;
  grupo: GrupoCampo;
  opcoes: string[];
  ajuda: string;
  largura: "meia" | "inteira";
  obrigatorio: boolean;
  visivel: boolean;
};

export function novoCampoExtra(grupo: GrupoCampo = "identificacao"): CampoExtra {
  return {
    chave: `extra_${Math.random().toString(36).slice(2, 8)}`,
    label: "Novo campo",
    tipo: "texto",
    grupo,
    opcoes: [],
    ajuda: "",
    largura: "meia",
    obrigatorio: false,
    visivel: true,
  };
}

export type Densidade = "compacta" | "normal" | "espacosa";

export type Preferencias = {
  /* marca */
  marcaNome: string;
  marcaSubtitulo: string;
  /* menu */
  seccoes: string[];
  rotulosSeccoes: Record<string, string>;
  mostrarAtalhos: boolean;
  atalhos: string[];
  mostrarContagens: boolean;
  /* pipeline */
  fases: BusinessStatus[];
  ordemFases: BusinessStatus[];
  rotulosFases: Record<string, string>;
  colunasPipeline: number;
  camposCartao: string[];
  pipelineTotais: boolean;
  densidade: Densidade;
  /* lista de negócios */
  colunasNegocios: string[];
  ordemPadraoNegocios: string;
  porPagina: number;
  /* painel */
  cartoesPainel: string[];
  /* formulário de projeto */
  camposNegocio: string[];
  ordemCamposNegocio: string[];
  rotulosCamposNegocio: Record<string, string>;
  camposObrigatorios: string[];
  ajudasCampos: Record<string, string>;
  camposLargos: string[];
  camposExtra: CampoExtra[];
  /* formatos */
  moeda: string;
  formatoData: "dd/mm/aaaa" | "aaaa-mm-dd" | "relativo";
};

const FASES_BASE: BusinessStatus[] = [
  "por_contactar",
  "tentativa_contacto",
  "aguardar_resposta",
  "email_por_enviar",
  "email_enviado",
  "seguimento",
  "concluido",
];

export const PREFERENCIAS_PADRAO: Preferencias = {
  marcaNome: "Orbit CRM",
  marcaSubtitulo: "Sales workspace",
  seccoes: SECCOES.map((s) => s.chave),
  rotulosSeccoes: {},
  mostrarAtalhos: true,
  atalhos: ATALHOS.map((a) => a.chave),
  mostrarContagens: true,
  fases: FASES_BASE,
  ordemFases: FASES_BASE,
  rotulosFases: {},
  colunasPipeline: 3,
  camposCartao: ["categoria", "prioridade", "valor", "setas"],
  pipelineTotais: true,
  densidade: "normal",
  colunasNegocios: ["estado", "prioridade", "valor", "categoria", "localidade", "interacao"],
  ordemPadraoNegocios: "recentes",
  porPagina: 25,
  cartoesPainel: CARTOES_PAINEL.map((c) => c.chave),
  camposNegocio: CAMPOS_NEGOCIO.map((c) => c.chave),
  ordemCamposNegocio: CAMPOS_NEGOCIO.map((c) => c.chave),
  rotulosCamposNegocio: {},
  camposObrigatorios: ["nome"],
  ajudasCampos: {},
  camposLargos: ["nome", "notas"],
  camposExtra: [],
  moeda: "EUR",
  formatoData: "dd/mm/aaaa",
};

const CHAVE = "orbit-crm:preferencias";

const Ctx = createContext<{
  prefs: Preferencias;
  guardar: (parcial: Partial<Preferencias>) => void;
  reiniciar: () => void;
}>({ prefs: PREFERENCIAS_PADRAO, guardar: () => {}, reiniciar: () => {} });

export function PreferenciasProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Preferencias>(PREFERENCIAS_PADRAO);

  useEffect(() => {
    try {
      const bruto = localStorage.getItem(CHAVE);
      if (!bruto) return;
      const guardado = JSON.parse(bruto) as Partial<Preferencias>;
      const limpo = Object.fromEntries(
        Object.entries(guardado).filter(([, valor]) => valor !== null && valor !== undefined),
      ) as Partial<Preferencias>;
      const combinado = { ...PREFERENCIAS_PADRAO, ...limpo };
      // secções novas (adicionadas depois das preferências guardadas) ficam visíveis
      if (Array.isArray(limpo.seccoes)) {
        const conhecidas = new Set(limpo.seccoes);
        combinado.seccoes = SECCOES.map((s) => s.chave).filter(
          (c) => conhecidas.has(c) || !SECCOES_ANTIGAS.includes(c),
        );
      }
      setPrefs(combinado);
    } catch {
      /* ignora */
    }
  }, []);


  const guardar = useCallback((parcial: Partial<Preferencias>) => {
    setPrefs((anterior) => {
      const seguinte = { ...anterior, ...parcial };
      try {
        localStorage.setItem(CHAVE, JSON.stringify(seguinte));
      } catch {
        /* ignora */
      }
      return seguinte;
    });
  }, []);

  const reiniciar = useCallback(() => {
    try {
      localStorage.removeItem(CHAVE);
    } catch {
      /* ignora */
    }
    setPrefs(PREFERENCIAS_PADRAO);
  }, []);

  const valor = useMemo(() => ({ prefs, guardar, reiniciar }), [prefs, guardar, reiniciar]);
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export const usePreferencias = () => useContext(Ctx);

/** Etiqueta de uma fase, com o nome personalizado se existir. */
export function rotuloFase(prefs: Preferencias, valor: BusinessStatus) {
  const base = ESTADOS.find((e) => e.value === valor);
  return prefs.rotulosFases[valor]?.trim() || base?.label || valor;
}

/** Etiqueta de uma secção do menu, com o nome personalizado se existir. */
export function rotuloSeccao(prefs: Preferencias, chave: string, base: string) {
  return prefs.rotulosSeccoes[chave]?.trim() || base;
}

export type FaseVisivel = { value: BusinessStatus; label: string; tone: Tone };

/** Fases visíveis do pipeline, pela ordem definida pelo utilizador. */
export function fasesVisiveis(prefs: Preferencias): FaseVisivel[] {
  const ordem = prefs.ordemFases.length ? prefs.ordemFases : FASES_BASE;
  const restantes = ESTADOS.map((e) => e.value).filter((v) => !ordem.includes(v));
  return [...ordem, ...restantes]
    .filter((v) => prefs.fases.includes(v))
    .map((v) => {
      const base = ESTADOS.find((e) => e.value === v)!;
      return { value: v, label: rotuloFase(prefs, v), tone: base.tone };
    });
}

export const espacamentoCartao: Record<Densidade, string> = {
  compacta: "p-2 gap-1.5",
  normal: "p-3 gap-2.5",
  espacosa: "p-4 gap-4",
};

/** Formata um valor monetário na moeda escolhida nas definições. */
export function formatarValor(prefs: Preferencias, valor?: number | null) {
  if (valor === null || valor === undefined) return "—";
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: prefs.moeda }).format(valor);
}

/** Formata uma data no formato escolhido nas definições. */
export function formatarDataPref(prefs: Preferencias, valor?: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return "—";
  if (prefs.formatoData === "aaaa-mm-dd") return d.toISOString().slice(0, 10);
  if (prefs.formatoData === "relativo") {
    const dias = Math.round((Date.now() - d.getTime()) / 86_400_000);
    if (dias === 0) return "hoje";
    if (dias === 1) return "ontem";
    if (dias > 0) return `há ${dias} dias`;
    return `em ${Math.abs(dias)} dias`;
  }
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** Etiqueta de um campo do formulário de projeto, com o nome personalizado se existir. */
export function rotuloCampo(prefs: Preferencias, chave: string) {
  const base = CAMPOS_NEGOCIO.find((c) => c.chave === chave);
  return prefs.rotulosCamposNegocio?.[chave]?.trim() || base?.label || chave;
}

export type CampoFormulario = {
  chave: string;
  label: string;
  grupo: GrupoCampo;
  obrigatorio: boolean;
  ajuda: string;
  largo: boolean;
  extra: boolean;
  tipo: TipoCampo;
  opcoes: string[];
};

/** Campos visíveis do formulário de projeto, pela ordem definida nas definições. */
export function camposFormulario(prefs: Preferencias): CampoFormulario[] {
  const extras = prefs.camposExtra ?? [];
  const todas = [...CAMPOS_NEGOCIO.map((c) => c.chave), ...extras.map((c) => c.chave)];
  const ordem = prefs.ordemCamposNegocio?.length ? prefs.ordemCamposNegocio : todas;
  const restantes = todas.filter((c) => !ordem.includes(c));
  const visiveis = prefs.camposNegocio ?? CAMPOS_NEGOCIO.map((c) => c.chave);
  const largos = prefs.camposLargos ?? [];

  return [...ordem, ...restantes]
    .map((chave): CampoFormulario | null => {
      const extra = extras.find((c) => c.chave === chave);
      const base = CAMPOS_NEGOCIO.find((c) => c.chave === chave);
      if (extra) {
        if (!extra.visivel) return null;
        return {
          chave,
          label: extra.label || "Campo",
          grupo: extra.grupo,
          obrigatorio: extra.obrigatorio,
          ajuda: extra.ajuda ?? "",
          largo: extra.largura === "inteira",
          extra: true,
          tipo: extra.tipo,
          opcoes: extra.opcoes ?? [],
        };
      }
      if (!base) return null;
      if (chave !== "nome" && !visiveis.includes(chave)) return null;
      return {
        chave,
        label: rotuloCampo(prefs, chave),
        grupo: base.grupo,
        obrigatorio: chave === "nome" || (prefs.camposObrigatorios ?? []).includes(chave),
        ajuda: prefs.ajudasCampos?.[chave]?.trim() ?? "",
        largo: largos.includes(chave),
        extra: false,
        tipo: "texto" as TipoCampo,
        opcoes: [],
      };
    })
    .filter((c): c is CampoFormulario => c !== null);
}

const MARCA_EXTRAS = "--- Campos extra ---";

/** Lê os valores dos campos personalizados guardados no fim das notas. */
export function lerCamposExtra(notas?: string | null): Record<string, string> {
  if (!notas) return {};
  const i = notas.indexOf(MARCA_EXTRAS);
  if (i < 0) return {};
  const valores: Record<string, string> = {};
  for (const linha of notas.slice(i + MARCA_EXTRAS.length).split("\n")) {
    const sep = linha.indexOf(":");
    if (sep <= 0) continue;
    valores[linha.slice(0, sep).trim()] = linha.slice(sep + 1).trim();
  }
  return valores;
}

/** Devolve apenas o texto livre das notas, sem o bloco de campos personalizados. */
export function notasSemExtras(notas?: string | null) {
  if (!notas) return "";
  const i = notas.indexOf(MARCA_EXTRAS);
  return (i < 0 ? notas : notas.slice(0, i)).trimEnd();
}

/** Junta o texto das notas com o bloco de campos personalizados. */
export function juntarNotasComExtras(
  notas: string,
  campos: CampoFormulario[],
  valores: Record<string, string>,
) {
  const linhas = campos
    .filter((c) => c.extra && String(valores[c.chave] ?? "").trim())
    .map((c) => `${c.label}: ${String(valores[c.chave]).trim()}`);
  const base = notasSemExtras(notas);
  if (!linhas.length) return base;
  return `${base ? `${base}\n\n` : ""}${MARCA_EXTRAS}\n${linhas.join("\n")}`;
}
