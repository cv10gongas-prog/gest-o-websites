import { Link } from "@tanstack/react-router";
import { AlertTriangle, Plus, Save, Settings2 } from "lucide-react";
import { useMemo, useState } from "react";

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
  ESTADOS,
  PRIORIDADES,
  encontrarDuplicados,
  paraInputDateTime,
  deInputDateTime,
  type Business,
} from "@/lib/crm";
import {
  GRUPOS_CAMPOS,
  camposFormulario,
  juntarNotasComExtras,
  lerCamposExtra,
  notasSemExtras,
  rotuloFase,
  usePreferencias,
  type CampoFormulario,
} from "@/lib/preferencias";
import { useActualizarNegocio, useBusinesses, useCriarNegocio, useProfiles } from "@/lib/queries";
import { cn } from "@/lib/utils";

type Valores = {
  nome: string;
  categoria: string;
  telefone: string;
  email: string;
  website: string;
  google_maps: string;
  localidade: string;
  responsavel_nome: string;
  encontrado_por: string;
  contactado_por: string;
  estado: Business["estado"];
  prioridade: Business["prioridade"];
  notas: string;
  valor_estimado: string;
  proxima_acao: string;
  data_seguimento: string;
};

function inicial(negocio?: Business | null): Valores {
  return {
    nome: negocio?.nome ?? "",
    categoria: negocio?.categoria ?? "",
    telefone: negocio?.telefone ?? "",
    email: negocio?.email ?? "",
    website: negocio?.website ?? "",
    google_maps: negocio?.google_maps ?? "",
    localidade: negocio?.localidade ?? "",
    responsavel_nome: negocio?.responsavel_nome ?? "",
    encontrado_por: negocio?.encontrado_por ?? "",
    contactado_por: negocio?.contactado_por ?? "",
    estado: negocio?.estado ?? "por_contactar",
    prioridade: negocio?.prioridade ?? "media",
    notas: notasSemExtras(negocio?.notas),
    valor_estimado: negocio?.valor_estimado != null ? String(negocio.valor_estimado) : "",
    proxima_acao: negocio?.proxima_acao ?? "",
    data_seguimento: paraInputDateTime(negocio?.data_seguimento),
  };
}

export function DialogNegocio({
  aberto,
  onFechar,
  negocio,
}: {
  aberto: boolean;
  onFechar: () => void;
  negocio?: Business | null;
}) {
  const { prefs } = usePreferencias();
  const [v, setV] = useState<Valores>(() => inicial(negocio));
  const [extras, setExtras] = useState<Record<string, string>>(() => lerCamposExtra(negocio?.notas));
  const [chave, setChave] = useState(0);
  const { data: negocios = [] } = useBusinesses();
  const { data: perfis = [] } = useProfiles();
  const criar = useCriarNegocio();
  const actualizar = useActualizarNegocio();

  const campos = camposFormulario(prefs);

  // reinicia o formulário sempre que abre com outro negócio
  const assinatura = `${aberto}-${negocio?.id ?? "novo"}`;
  if (chave !== assinatura.length + (negocio?.id?.length ?? 0) && aberto) {
    setChave(assinatura.length + (negocio?.id?.length ?? 0));
    setV(inicial(negocio));
    setExtras(porChave(lerCamposExtra(negocio?.notas), campos));
  }

  const duplicados = useMemo(
    () =>
      encontrarDuplicados(
        {
          id: negocio?.id,
          nome: v.nome,
          telefone: v.telefone,
          email: v.email,
          website: v.website,
        },
        negocios,
      ),
    [v.nome, v.telefone, v.email, v.website, negocios, negocio?.id],
  );

  const set = (campo: keyof Valores) => (e: { target: { value: string } }) =>
    setV((atual) => ({ ...atual, [campo]: e.target.value }));

  const setExtra = (chaveCampo: string) => (valor: string) =>
    setExtras((atual) => ({ ...atual, [chaveCampo]: valor }));

  const valorDe = (c: CampoFormulario) =>
    c.extra ? (extras[c.chave] ?? "") : String(v[c.chave as keyof Valores] ?? "");

  const faltam = campos.filter((c) => c.obrigatorio && !valorDe(c).trim());
  const preenchidos = campos.filter((c) => valorDe(c).trim()).length;

  async function guardar() {
    if (!v.nome.trim() || faltam.length > 0) return;
    const payload = {
      nome: v.nome.trim(),
      categoria: v.categoria || null,
      telefone: v.telefone || null,
      email: v.email || null,
      website: v.website || null,
      google_maps: v.google_maps || null,
      localidade: v.localidade || null,
      responsavel_nome: v.responsavel_nome || null,
      encontrado_por: v.encontrado_por || null,
      contactado_por: v.contactado_por || null,
      estado: v.estado,
      prioridade: v.prioridade,
      notas: juntarNotasComExtras(v.notas, campos, extras) || null,
      valor_estimado: v.valor_estimado ? Number(v.valor_estimado) : null,
      proxima_acao: v.proxima_acao || null,
      data_seguimento: deInputDateTime(v.data_seguimento),
    };
    if (negocio) {
      await actualizar.mutateAsync({ id: negocio.id, valores: payload });
    } else {
      await criar.mutateAsync(payload);
    }
    onFechar();
  }

  function controloExtra(c: CampoFormulario) {
    const valor = extras[c.chave] ?? "";
    const mudar = setExtra(c.chave);
    switch (c.tipo) {
      case "texto_longo":
        return (
          <textarea
            className={textareaClass}
            value={valor}
            onChange={(e) => mudar(e.target.value)}
          />
        );
      case "numero":
        return (
          <input
            className={inputClass}
            type="number"
            value={valor}
            onChange={(e) => mudar(e.target.value)}
          />
        );
      case "data":
        return (
          <input
            className={inputClass}
            type="date"
            value={valor}
            onChange={(e) => mudar(e.target.value)}
          />
        );
      case "selecao":
        return (
          <select className={selectClass} value={valor} onChange={(e) => mudar(e.target.value)}>
            <option value="">—</option>
            {c.opcoes.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        );
      case "booleano":
        return (
          <div className="flex gap-2">
            {["Sim", "Não"].map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => mudar(valor === o ? "" : o)}
                className={cn(
                  "h-10 flex-1 rounded-lg border text-sm transition",
                  valor === o
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border/70 text-muted-foreground hover:text-foreground",
                )}
              >
                {o}
              </button>
            ))}
          </div>
        );
      default:
        return (
          <input className={inputClass} value={valor} onChange={(e) => mudar(e.target.value)} />
        );
    }
  }

  function controlo(c: CampoFormulario) {
    if (c.extra) return controloExtra(c);
    switch (c.chave) {
      case "encontrado_por":
      case "contactado_por":
        return (
          <select
            className={selectClass}
            value={v[c.chave as "encontrado_por" | "contactado_por"]}
            onChange={set(c.chave as "encontrado_por" | "contactado_por")}
          >
            <option value="">{c.chave === "contactado_por" ? "Ainda ninguém" : "—"}</option>
            {perfis.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome || p.email}
              </option>
            ))}
          </select>
        );
      case "estado":
        return (
          <select className={selectClass} value={v.estado} onChange={set("estado")}>
            {ESTADOS.map((e) => (
              <option key={e.value} value={e.value}>
                {rotuloFase(prefs, e.value)}
              </option>
            ))}
          </select>
        );
      case "prioridade":
        return (
          <select className={selectClass} value={v.prioridade} onChange={set("prioridade")}>
            {PRIORIDADES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        );
      case "notas":
        return <textarea className={textareaClass} value={v.notas} onChange={set("notas")} />;
      case "valor_estimado":
        return (
          <input
            className={inputClass}
            type="number"
            value={v.valor_estimado}
            onChange={set("valor_estimado")}
            placeholder="250"
          />
        );
      case "data_seguimento":
        return (
          <input
            className={inputClass}
            type="datetime-local"
            value={v.data_seguimento}
            onChange={set("data_seguimento")}
          />
        );
      default: {
        const k = c.chave as keyof Valores;
        return (
          <input
            className={inputClass}
            value={String(v[k] ?? "")}
            onChange={set(k)}
            placeholder={PLACEHOLDERS[c.chave] ?? ""}
          />
        );
      }
    }
  }

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      largura="max-w-3xl"
      titulo={negocio ? "Editar projeto" : "Novo projeto de site"}
      descricao="Só o essencial: preenche o que souberes agora, o resto podes editar depois."
      rodape={
        <>
          <Link
            to="/definicoes"
            onClick={onFechar}
            className="mr-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground"
          >
            <Settings2 className="size-3.5" /> Configurar campos
          </Link>
          <button className={btnSecundario} onClick={onFechar}>
            Cancelar
          </button>
          <button
            className={btnPrimario}
            onClick={guardar}
            disabled={faltam.length > 0 || criar.isPending || actualizar.isPending}
          >
            {negocio ? <Save className="size-4" /> : <Plus className="size-4" />} Guardar projeto
          </button>
        </>
      }
    >
      <div className="mb-4 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
        <span>
          {preenchidos} de {campos.length} campos preenchidos
        </span>
        {faltam.length > 0 ? (
          <span className="text-warning">
            Falta: {faltam.map((c) => c.label).join(", ")}
          </span>
        ) : (
          <span className="text-success">Pronto a guardar</span>
        )}
      </div>

      {duplicados.length > 0 && (
        <div className="mb-4 flex gap-2 rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
          <AlertTriangle className="size-4 shrink-0" />
          <div>
            <p className="font-medium">Possível duplicado</p>
            <p className="mt-1 opacity-90">
              {duplicados
                .map(
                  (d) =>
                    `${d.nome}${d.contactado_por ? " (já contactado)" : ""} — ${d.estado.replaceAll("_", " ")}`,
                )
                .join(" · ")}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {GRUPOS_CAMPOS.map((g) => {
          const doGrupo = campos.filter((c) => c.grupo === g.chave);
          if (!doGrupo.length) return null;
          return (
            <section key={g.chave}>
              <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {g.label}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {doGrupo.map((c) => (
                  <Campo
                    key={c.chave}
                    label={c.obrigatorio ? `${c.label} *` : c.label}
                    ajuda={c.ajuda || undefined}
                    className={c.largo || c.chave === "nome" ? "sm:col-span-2" : undefined}
                  >
                    {controlo(c)}
                  </Campo>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </Modal>
  );
}

/** Mantém apenas valores de campos que ainda existem, e aceita rótulos como chave. */
function porChave(valoresPorRotulo: Record<string, string>, campos: CampoFormulario[]) {
  const saida: Record<string, string> = {};
  for (const c of campos) {
    if (!c.extra) continue;
    const valor = valoresPorRotulo[c.label];
    if (valor !== undefined) saida[c.chave] = valor;
  }
  return saida;
}

const PLACEHOLDERS: Record<string, string> = {
  nome: "Ex.: Oficina Central",
  categoria: "Ex.: Carpintaria",
  localidade: "Ex.: Cascais",
  telefone: "900 000 000",
  email: "geral@exemplo.pt",
  website: "https://...",
  google_maps: "https://maps...",
  responsavel_nome: "Ex.: Sr. Silva",
  proxima_acao: "Ligar amanhã",
};
