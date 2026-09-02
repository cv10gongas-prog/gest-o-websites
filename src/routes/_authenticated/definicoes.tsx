import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUp,
  Coins,
  Columns3,
  LayoutDashboard,
  List,
  PanelsTopLeft,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Tag,
  Trash2,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import { Dot } from "@/components/crm/Bits";
import { inputClass, selectClass } from "@/components/crm/Modal";
import { ESTADOS } from "@/lib/crm";
import {
  ATALHOS,
  CAMPOS_CARTAO,
  CAMPOS_NEGOCIO,
  CARTOES_PAINEL,
  COLUNAS_NEGOCIOS,
  GRUPOS_CAMPOS,
  PREFERENCIAS_PADRAO,
  SECCOES,
  TIPOS_CAMPO,
  novoCampoExtra,
  rotuloFase,
  usePreferencias,
  type CampoExtra,
  type Densidade,
  type GrupoCampo,
  type TipoCampo,
} from "@/lib/preferencias";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/definicoes")({
  head: () => ({
    meta: [
      { title: "Definições — Orbit CRM" },
      {
        name: "description",
        content:
          "Configura marca, menu, fases do pipeline, formulário de projeto, lista, painel e formatos do CRM.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Definições — Orbit CRM" },
      { property: "og:description", content: "Personaliza todo o CRM por tópicos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Definicoes,
});

const TOPICOS = [
  { chave: "marca", label: "Marca", nota: "Nome da app e nomes do menu", icone: Tag },
  { chave: "menu", label: "Menu lateral", nota: "O que aparece na barra lateral", icone: PanelsTopLeft },
  { chave: "fases", label: "Fases do pipeline", nota: "Colunas do quadro e os seus nomes", icone: Columns3 },
  { chave: "quadro", label: "Quadro", nota: "Grelha, cartões e espaçamento", icone: LayoutDashboard },
  { chave: "formulario", label: "Formulário de projeto", nota: "Campos ao criar ou editar", icone: SlidersHorizontal },
  { chave: "lista", label: "Lista de projetos", nota: "Colunas, ordem e paginação", icone: List },
  { chave: "painel", label: "Painel de gestão", nota: "Blocos e métricas do painel", icone: LayoutDashboard },
  { chave: "formatos", label: "Moeda e datas", nota: "Como os valores são escritos", icone: Coins },
] as const;

function Definicoes() {
  const { prefs, guardar, reiniciar } = usePreferencias();
  const [topico, setTopico] = useState<string>("marca");
  const [editar, setEditar] = useState<string | null>(null);
  const activo = TOPICOS.find((t) => t.chave === topico) ?? TOPICOS[0];

  function alternar<T extends string>(lista: T[], valor: T) {
    return lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor];
  }

  const ordemFases = (() => {
    const base = prefs.ordemFases.length ? prefs.ordemFases : PREFERENCIAS_PADRAO.ordemFases;
    const restantes = ESTADOS.map((e) => e.value).filter(
      (v) => !base.includes(v) && v !== "arquivado",
    );
    return [...base, ...restantes];
  })();

  function moverFase(indice: number, direcao: -1 | 1) {
    const seguinte = [...ordemFases];
    const alvo = indice + direcao;
    if (alvo < 0 || alvo >= seguinte.length) return;
    [seguinte[indice], seguinte[alvo]] = [seguinte[alvo]!, seguinte[indice]!];
    guardar({ ordemFases: seguinte });
  }

  const extras = prefs.camposExtra ?? [];
  const todasChaves = [...CAMPOS_NEGOCIO.map((c) => c.chave), ...extras.map((c) => c.chave)];

  const ordemCampos: string[] = (() => {
    const base = prefs.ordemCamposNegocio.length ? prefs.ordemCamposNegocio : todasChaves;
    const restantes = todasChaves.filter((c) => !base.includes(c));
    return [...base, ...restantes].filter((c) => todasChaves.includes(c));
  })();

  function moverCampo(chave: string, direcao: -1 | 1) {
    const seguinte = [...ordemCampos];
    const indice = seguinte.indexOf(chave);
    const alvo = indice + direcao;
    if (indice < 0 || alvo < 0 || alvo >= seguinte.length) return;
    [seguinte[indice], seguinte[alvo]] = [seguinte[alvo]!, seguinte[indice]!];
    guardar({ ordemCamposNegocio: seguinte });
  }

  function actualizarExtra(chave: string, parcial: Partial<CampoExtra>) {
    guardar({ camposExtra: extras.map((c) => (c.chave === chave ? { ...c, ...parcial } : c)) });
  }

  function removerExtra(chave: string) {
    guardar({
      camposExtra: extras.filter((c) => c.chave !== chave),
      ordemCamposNegocio: ordemCampos.filter((c) => c !== chave),
    });
  }

  function adicionarExtra(grupo: GrupoCampo) {
    const campo = novoCampoExtra(grupo);
    guardar({ camposExtra: [...extras, campo], ordemCamposNegocio: [...ordemCampos, campo.chave] });
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Definições</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Escolhe um tópico à esquerda. Tudo é guardado automaticamente neste navegador.
          </p>
        </div>
        <button
          onClick={reiniciar}
          className="flex items-center gap-2 rounded-xl border border-border/70 px-3 py-2 text-xs text-muted-foreground transition hover:text-foreground"
        >
          <RotateCcw className="size-3.5" /> Restaurar tudo
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[248px_minmax(0,1fr)]">
        <nav className="flex gap-2 overflow-x-auto pb-1 lg:sticky lg:top-6 lg:flex-col lg:overflow-visible lg:pb-0">
          {TOPICOS.map((t) => {
            const Icone = t.icone;
            const sel = topico === t.chave;
            return (
              <button
                key={t.chave}
                onClick={() => setTopico(t.chave)}
                className={cn(
                  "flex shrink-0 items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition lg:w-full",
                  sel
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-transparent text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                )}
              >
                <Icone className="mt-0.5 size-4 shrink-0" />
                <span>
                  <span className="block text-sm font-medium">{t.label}</span>
                  <span className="hidden text-[11px] opacity-70 lg:block">{t.nota}</span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="min-w-0">
          <header className="mb-4">
            <h2 className="text-lg font-semibold">{activo.label}</h2>
            <p className="text-xs text-muted-foreground">{activo.nota}</p>
          </header>

          <div className="space-y-5">
            {topico === "marca" && (
              <>
                <Bloco titulo="Identidade" nota="Aparece no topo da barra lateral.">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Etiqueta texto="Nome da aplicação">
                      <input
                        className={inputClass}
                        value={prefs.marcaNome}
                        onChange={(e) => guardar({ marcaNome: e.target.value })}
                      />
                    </Etiqueta>
                    <Etiqueta texto="Subtítulo">
                      <input
                        className={inputClass}
                        value={prefs.marcaSubtitulo}
                        onChange={(e) => guardar({ marcaSubtitulo: e.target.value })}
                      />
                    </Etiqueta>
                  </div>
                </Bloco>

                <Bloco
                  titulo="Nomes das secções"
                  nota="Deixa vazio para usar o nome original. Isto só muda o texto do menu."
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    {SECCOES.map((s) => (
                      <Etiqueta key={s.chave} texto={s.label}>
                        <input
                          className={inputClass}
                          placeholder={s.label}
                          value={prefs.rotulosSeccoes[s.chave] ?? ""}
                          onChange={(e) =>
                            guardar({
                              rotulosSeccoes: {
                                ...prefs.rotulosSeccoes,
                                [s.chave]: e.target.value,
                              },
                            })
                          }
                        />
                      </Etiqueta>
                    ))}
                  </div>
                </Bloco>
              </>
            )}

            {topico === "menu" && (
              <>
                <Bloco titulo="Secções visíveis" nota="Desliga o que não usas no dia a dia.">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {SECCOES.map((s) => (
                      <Linha
                        key={s.chave}
                        label={prefs.rotulosSeccoes[s.chave]?.trim() || s.label}
                        activo={prefs.seccoes.includes(s.chave)}
                        onToggle={() => guardar({ seccoes: alternar(prefs.seccoes, s.chave) })}
                      />
                    ))}
                  </div>
                </Bloco>

                <Bloco titulo="Atalhos e contadores" nota="Blocos rápidos abaixo do menu.">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Linha
                      label="Mostrar atalhos rápidos"
                      activo={prefs.mostrarAtalhos}
                      onToggle={() => guardar({ mostrarAtalhos: !prefs.mostrarAtalhos })}
                    />
                    <Linha
                      label="Mostrar contagens no menu"
                      activo={prefs.mostrarContagens}
                      onToggle={() => guardar({ mostrarContagens: !prefs.mostrarContagens })}
                    />
                    {ATALHOS.map((a) => (
                      <Linha
                        key={a.chave}
                        label={a.label}
                        activo={prefs.atalhos.includes(a.chave)}
                        onToggle={() => guardar({ atalhos: alternar(prefs.atalhos, a.chave) })}
                      />
                    ))}
                  </div>
                </Bloco>
              </>
            )}

            {topico === "fases" && (
              <Bloco
                titulo="Fases do quadro"
                nota="Liga/desliga, muda o nome e ordena. O estado guardado na base de dados nunca muda."
              >
                <div className="space-y-2">
                  {ordemFases.map((v, i) => {
                    const base = ESTADOS.find((e) => e.value === v);
                    if (!base) return null;
                    const visivel = prefs.fases.includes(v);
                    return (
                      <div
                        key={v}
                        className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-secondary/20 p-2"
                      >
                        <Setas
                          onSubir={() => moverFase(i, -1)}
                          onDescer={() => moverFase(i, 1)}
                          primeiro={i === 0}
                          ultimo={i === ordemFases.length - 1}
                        />
                        <Dot tone={base.tone} />
                        <input
                          className={cn(inputClass, "h-9 min-w-[170px] flex-1")}
                          placeholder={base.label}
                          value={prefs.rotulosFases[v] ?? ""}
                          onChange={(e) =>
                            guardar({
                              rotulosFases: { ...prefs.rotulosFases, [v]: e.target.value },
                            })
                          }
                        />
                        <span className="hidden text-[11px] text-muted-foreground sm:block">
                          {rotuloFase(prefs, v)}
                        </span>
                        <Interruptor
                          activo={visivel}
                          onToggle={() => guardar({ fases: alternar(prefs.fases, v) })}
                          rotulo="Mostrar fase no quadro"
                        />
                      </div>
                    );
                  })}
                </div>
              </Bloco>
            )}

            {topico === "quadro" && (
              <>
                <Bloco titulo="Colunas por linha" nota="Em ecrãs pequenos passa sempre a uma coluna.">
                  <Escolhas
                    valores={[1, 2, 3, 4, 5].map((n) => ({
                      valor: String(n),
                      label: `${n} ${n === 1 ? "coluna" : "colunas"}`,
                    }))}
                    seleccionado={String(prefs.colunasPipeline)}
                    onEscolher={(valor) => guardar({ colunasPipeline: Number(valor) })}
                  />
                </Bloco>

                <Bloco titulo="Conteúdo dos cartões" nota="O que aparece dentro de cada cartão.">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {CAMPOS_CARTAO.map((c) => (
                      <Linha
                        key={c.chave}
                        label={c.label}
                        activo={prefs.camposCartao.includes(c.chave)}
                        onToggle={() =>
                          guardar({ camposCartao: alternar(prefs.camposCartao, c.chave) })
                        }
                      />
                    ))}
                    <Linha
                      label="Totais no topo de cada coluna"
                      activo={prefs.pipelineTotais}
                      onToggle={() => guardar({ pipelineTotais: !prefs.pipelineTotais })}
                    />
                  </div>
                </Bloco>

                <Bloco titulo="Densidade" nota="Espaçamento dos cartões.">
                  <Escolhas
                    valores={(["compacta", "normal", "espacosa"] as Densidade[]).map((d) => ({
                      valor: d,
                      label: d,
                    }))}
                    seleccionado={prefs.densidade}
                    onEscolher={(valor) => guardar({ densidade: valor as Densidade })}
                  />
                </Bloco>
              </>
            )}

            {topico === "formulario" && (
              <>
                <p className="rounded-xl border border-border/60 bg-secondary/20 p-3 text-xs text-muted-foreground">
                  Estes são os campos da janela “Novo projeto de site”. Clica em <b>Editar</b> para
                  mudar o nome, o texto de ajuda e a largura. Usa as setas para a ordem, <b>Obrig.</b>
                  {" "}para tornar obrigatório e o interruptor para esconder. Podes ainda criar campos
                  novos em qualquer grupo — os valores ficam guardados no projeto.
                </p>

                {GRUPOS_CAMPOS.map((g) => {
                  const doGrupo = ordemCampos.filter((chave) => {
                    const extra = extras.find((c) => c.chave === chave);
                    if (extra) return extra.grupo === g.chave;
                    return CAMPOS_NEGOCIO.find((c) => c.chave === chave)?.grupo === g.chave;
                  });
                  return (
                    <Bloco key={g.chave} titulo={g.label}>
                      <div className="space-y-2">
                        {doGrupo.map((chave) => {
                          const extra = extras.find((c) => c.chave === chave);
                          const base = CAMPOS_NEGOCIO.find((c) => c.chave === chave);
                          if (!extra && !base) return null;
                          const fixo = base?.fixo === true;
                          const visivel = extra
                            ? extra.visivel
                            : fixo || prefs.camposNegocio.includes(chave);
                          const obrig = extra
                            ? extra.obrigatorio
                            : fixo || prefs.camposObrigatorios.includes(chave);
                          const largo = extra
                            ? extra.largura === "inteira"
                            : (prefs.camposLargos ?? []).includes(chave);
                          const i = ordemCampos.indexOf(chave);
                          const aEditar = editar === chave;
                          return (
                            <div
                              key={chave}
                              className="rounded-xl border border-border/60 bg-secondary/20 p-2"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <Setas
                                  onSubir={() => moverCampo(chave, -1)}
                                  onDescer={() => moverCampo(chave, 1)}
                                  primeiro={i === 0}
                                  ultimo={i === ordemCampos.length - 1}
                                />
                                <span className="min-w-[150px] flex-1 truncate text-sm">
                                  {extra
                                    ? extra.label || "Campo"
                                    : prefs.rotulosCamposNegocio[chave]?.trim() || base!.label}
                                  {extra && (
                                    <span className="ml-2 rounded-md border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                                      {TIPOS_CAMPO.find((t) => t.chave === extra.tipo)?.label}
                                    </span>
                                  )}
                                </span>
                                <button
                                  onClick={() => setEditar(aEditar ? null : chave)}
                                  className="rounded-lg border border-border/70 px-2.5 py-1.5 text-[11px] text-muted-foreground transition hover:text-foreground"
                                >
                                  {aEditar ? "Fechar" : "Editar"}
                                </button>
                                <button
                                  onClick={() =>
                                    extra
                                      ? actualizarExtra(chave, { obrigatorio: !extra.obrigatorio })
                                      : guardar({
                                          camposObrigatorios: alternar(
                                            prefs.camposObrigatorios,
                                            chave,
                                          ),
                                        })
                                  }
                                  disabled={fixo}
                                  aria-pressed={obrig}
                                  title="Campo obrigatório"
                                  className={cn(
                                    "rounded-lg border px-2.5 py-1.5 text-[11px] transition disabled:opacity-50",
                                    obrig
                                      ? "border-primary/40 bg-primary/10 text-primary"
                                      : "border-border/70 text-muted-foreground hover:text-foreground",
                                  )}
                                >
                                  Obrig.
                                </button>
                                <Interruptor
                                  activo={visivel}
                                  desactivado={fixo}
                                  onToggle={() =>
                                    extra
                                      ? actualizarExtra(chave, { visivel: !extra.visivel })
                                      : guardar({
                                          camposNegocio: alternar(prefs.camposNegocio, chave),
                                        })
                                  }
                                  rotulo="Mostrar campo no formulário"
                                />
                                {extra && (
                                  <button
                                    onClick={() => removerExtra(chave)}
                                    aria-label="Remover campo"
                                    title="Remover campo"
                                    className="text-muted-foreground transition hover:text-destructive"
                                  >
                                    <Trash2 className="size-4" />
                                  </button>
                                )}
                              </div>

                              {aEditar && (
                                <div className="mt-3 grid gap-3 border-t border-border/60 pt-3 sm:grid-cols-2">
                                  <Etiqueta texto="Nome do campo">
                                    <input
                                      className={inputClass}
                                      value={
                                        extra ? extra.label : (prefs.rotulosCamposNegocio[chave] ?? "")
                                      }
                                      placeholder={base?.label ?? "Nome do campo"}
                                      onChange={(e) =>
                                        extra
                                          ? actualizarExtra(chave, { label: e.target.value })
                                          : guardar({
                                              rotulosCamposNegocio: {
                                                ...prefs.rotulosCamposNegocio,
                                                [chave]: e.target.value,
                                              },
                                            })
                                      }
                                    />
                                  </Etiqueta>
                                  <Etiqueta texto="Texto de ajuda (abaixo do campo)">
                                    <input
                                      className={inputClass}
                                      value={extra ? extra.ajuda : (prefs.ajudasCampos[chave] ?? "")}
                                      placeholder="Ex.: usa o nome que o cliente usa nas faturas"
                                      onChange={(e) =>
                                        extra
                                          ? actualizarExtra(chave, { ajuda: e.target.value })
                                          : guardar({
                                              ajudasCampos: {
                                                ...prefs.ajudasCampos,
                                                [chave]: e.target.value,
                                              },
                                            })
                                      }
                                    />
                                  </Etiqueta>

                                  {extra && (
                                    <>
                                      <Etiqueta texto="Tipo de campo">
                                        <select
                                          className={selectClass}
                                          value={extra.tipo}
                                          onChange={(e) =>
                                            actualizarExtra(chave, {
                                              tipo: e.target.value as TipoCampo,
                                            })
                                          }
                                        >
                                          {TIPOS_CAMPO.map((t) => (
                                            <option key={t.chave} value={t.chave}>
                                              {t.label}
                                            </option>
                                          ))}
                                        </select>
                                      </Etiqueta>
                                      <Etiqueta texto="Grupo no formulário">
                                        <select
                                          className={selectClass}
                                          value={extra.grupo}
                                          onChange={(e) =>
                                            actualizarExtra(chave, {
                                              grupo: e.target.value as GrupoCampo,
                                            })
                                          }
                                        >
                                          {GRUPOS_CAMPOS.map((x) => (
                                            <option key={x.chave} value={x.chave}>
                                              {x.label}
                                            </option>
                                          ))}
                                        </select>
                                      </Etiqueta>
                                      {extra.tipo === "selecao" && (
                                        <Etiqueta texto="Opções da lista (uma por linha)">
                                          <textarea
                                            className={cn(inputClass, "h-24 py-2")}
                                            value={extra.opcoes.join("\n")}
                                            placeholder={"Institucional\nLoja online\nLanding page"}
                                            onChange={(e) =>
                                              actualizarExtra(chave, {
                                                opcoes: e.target.value
                                                  .split("\n")
                                                  .map((o) => o.trim())
                                                  .filter(Boolean),
                                              })
                                            }
                                          />
                                        </Etiqueta>
                                      )}
                                    </>
                                  )}

                                  <div className="sm:col-span-2">
                                    <Linha
                                      label="Ocupar a linha toda no formulário"
                                      activo={largo}
                                      onToggle={() =>
                                        extra
                                          ? actualizarExtra(chave, {
                                              largura: largo ? "meia" : "inteira",
                                            })
                                          : guardar({
                                              camposLargos: alternar(
                                                prefs.camposLargos ?? [],
                                                chave,
                                              ),
                                            })
                                      }
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        <button
                          onClick={() => adicionarExtra(g.chave)}
                          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border/70 px-3 py-2.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                        >
                          <Plus className="size-3.5" /> Adicionar campo em {g.label.toLowerCase()}
                        </button>
                      </div>
                    </Bloco>
                  );
                })}
              </>
            )}

            {topico === "lista" && (
              <>
                <Bloco titulo="Colunas da lista" nota="O que mostrar na lista de projetos.">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {COLUNAS_NEGOCIOS.map((c) => (
                      <Linha
                        key={c.chave}
                        label={c.label}
                        activo={prefs.colunasNegocios.includes(c.chave)}
                        onToggle={() =>
                          guardar({ colunasNegocios: alternar(prefs.colunasNegocios, c.chave) })
                        }
                      />
                    ))}
                  </div>
                </Bloco>

                <Bloco titulo="Ordenação e paginação" nota="Como a lista abre por omissão.">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Etiqueta texto="Ordem predefinida">
                      <select
                        className={selectClass}
                        value={prefs.ordemPadraoNegocios}
                        onChange={(e) => guardar({ ordemPadraoNegocios: e.target.value })}
                      >
                        <option value="recentes">Mais recentes</option>
                        <option value="nome">Nome</option>
                        <option value="valor">Valor estimado</option>
                        <option value="prioridade">Prioridade</option>
                        <option value="interacao">Última interação</option>
                      </select>
                    </Etiqueta>
                    <Etiqueta texto="Projetos por página">
                      <select
                        className={selectClass}
                        value={prefs.porPagina}
                        onChange={(e) => guardar({ porPagina: Number(e.target.value) })}
                      >
                        {[10, 25, 50, 100, 500].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </Etiqueta>
                  </div>
                </Bloco>
              </>
            )}

            {topico === "painel" && (
              <Bloco titulo="Blocos do painel" nota="Escolhe os cartões da página de gestão.">
                <div className="grid gap-2 sm:grid-cols-2">
                  {CARTOES_PAINEL.map((c) => (
                    <Linha
                      key={c.chave}
                      label={c.label}
                      activo={prefs.cartoesPainel.includes(c.chave)}
                      onToggle={() =>
                        guardar({ cartoesPainel: alternar(prefs.cartoesPainel, c.chave) })
                      }
                    />
                  ))}
                </div>
              </Bloco>
            )}

            {topico === "formatos" && (
              <Bloco titulo="Moeda e datas" nota="Como os valores são apresentados em todo o CRM.">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Etiqueta texto="Moeda">
                    <select
                      className={selectClass}
                      value={prefs.moeda}
                      onChange={(e) => guardar({ moeda: e.target.value })}
                    >
                      <option value="EUR">Euro (€)</option>
                      <option value="USD">Dólar ($)</option>
                      <option value="GBP">Libra (£)</option>
                      <option value="BRL">Real (R$)</option>
                    </select>
                  </Etiqueta>
                  <Etiqueta texto="Formato de data">
                    <select
                      className={selectClass}
                      value={prefs.formatoData}
                      onChange={(e) =>
                        guardar({ formatoData: e.target.value as typeof prefs.formatoData })
                      }
                    >
                      <option value="dd/mm/aaaa">31/12/2026</option>
                      <option value="aaaa-mm-dd">2026-12-31</option>
                      <option value="relativo">há 3 dias</option>
                    </select>
                  </Etiqueta>
                </div>
              </Bloco>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Bloco({
  titulo,
  nota,
  children,
}: {
  titulo: string;
  nota?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h3 className="text-sm font-medium">{titulo}</h3>
      {nota && <p className="mt-0.5 text-[11px] text-muted-foreground">{nota}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Etiqueta({ texto, children }: { texto: string; children: ReactNode }) {
  return (
    <label className="block text-[11px] text-muted-foreground">
      {texto}
      <span className="mt-1 block">{children}</span>
    </label>
  );
}

function Escolhas({
  valores,
  seleccionado,
  onEscolher,
}: {
  valores: { valor: string; label: string }[];
  seleccionado: string;
  onEscolher: (valor: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {valores.map((v) => (
        <button
          key={v.valor}
          onClick={() => onEscolher(v.valor)}
          className={cn(
            "rounded-xl border px-4 py-2 text-xs capitalize transition",
            seleccionado === v.valor
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border/70 text-muted-foreground hover:text-foreground",
          )}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}

function Setas({
  onSubir,
  onDescer,
  primeiro,
  ultimo,
}: {
  onSubir: () => void;
  onDescer: () => void;
  primeiro: boolean;
  ultimo: boolean;
}) {
  return (
    <div className="flex flex-col">
      <button
        onClick={onSubir}
        disabled={primeiro}
        aria-label="Subir"
        className="text-muted-foreground transition hover:text-foreground disabled:opacity-30"
      >
        <ArrowUp className="size-3.5" />
      </button>
      <button
        onClick={onDescer}
        disabled={ultimo}
        aria-label="Descer"
        className="text-muted-foreground transition hover:text-foreground disabled:opacity-30"
      >
        <ArrowDown className="size-3.5" />
      </button>
    </div>
  );
}

function Interruptor({
  activo,
  onToggle,
  rotulo,
  desactivado,
}: {
  activo: boolean;
  onToggle: () => void;
  rotulo: string;
  desactivado?: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={desactivado}
      role="switch"
      aria-checked={activo}
      aria-label={rotulo}
      title={rotulo}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full transition disabled:opacity-40",
        activo ? "bg-primary/70" : "bg-border",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-4 rounded-full bg-background transition-all",
          activo ? "left-[18px]" : "left-0.5",
        )}
      />
    </button>
  );
}

function Linha({
  label,
  activo,
  onToggle,
}: {
  label: ReactNode;
  activo: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={activo}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-border/60 px-3 py-2.5 text-left text-sm transition hover:border-primary/30"
    >
      <span className={activo ? "" : "text-muted-foreground"}>{label}</span>
      <span
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition",
          activo ? "bg-primary/70" : "bg-border",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-4 rounded-full bg-background transition-all",
            activo ? "left-[18px]" : "left-0.5",
          )}
        />
      </span>
    </button>
  );
}
