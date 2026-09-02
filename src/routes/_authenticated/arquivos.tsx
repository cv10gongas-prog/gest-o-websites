import { createFileRoute } from "@tanstack/react-router";
import { Download, FileArchive, Trash2, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Chip, Panel, Vazio } from "@/components/crm/Bits";
import { btnPequeno, btnPrimario, inputClass, selectClass } from "@/components/crm/Modal";
import { formatarData } from "@/lib/crm";
import {
  LIMITE_FICHEIRO,
  urlDescarregarFicheiro,
  useApagarFicheiro,
  useBusinessFiles,
  useBusinesses,
  useCarregarFicheiro,
  type BusinessFile,
} from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/arquivos")({
  head: () => ({
    meta: [
      { title: "Arquivos de projetos — Orbit CRM" },
      {
        name: "description",
        content: "Arquivos .rar com os projetos atualizados de cada negócio, até 300 MB por ficheiro.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Arquivos,
});

function tamanho(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function Arquivos() {
  const { data: negocios = [] } = useBusinesses();
  const { data: ficheiros = [], isLoading } = useBusinessFiles();
  const carregar = useCarregarFicheiro();
  const apagar = useApagarFicheiro();

  const [negocio, setNegocio] = useState("");
  const [versao, setVersao] = useState("");
  const [notas, setNotas] = useState("");
  const [ficheiro, setFicheiro] = useState<File | null>(null);
  const [filtro, setFiltro] = useState("");

  const nomeNegocio = (id: string) => negocios.find((n) => n.id === id)?.nome ?? "Negócio removido";

  const lista = useMemo(
    () => (filtro ? ficheiros.filter((f) => f.business_id === filtro) : ficheiros),
    [ficheiros, filtro],
  );

  async function submeter() {
    if (!negocio) return toast.error("Escolhe o negócio.");
    if (!ficheiro) return toast.error("Escolhe o ficheiro .rar.");
    if (ficheiro.size > LIMITE_FICHEIRO) return toast.error("O ficheiro excede os 300 MB.");
    await carregar.mutateAsync({
      businessId: negocio,
      ficheiro,
      versao: versao || null,
      notas: notas || null,
    });
    setFicheiro(null);
    setVersao("");
    setNotas("");
  }

  async function descarregar(f: BusinessFile) {
    try {
      const url = await urlDescarregarFicheiro(f.caminho);
      window.open(url, "_blank", "noopener");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Arquivos de projetos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Guarda o .rar com o projeto atualizado de cada negócio (até 300 MB por ficheiro).
        </p>
      </div>

      <Panel className="mt-6" title="Carregar arquivo">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <select className={selectClass} value={negocio} onChange={(e) => setNegocio(e.target.value)}>
            <option value="">Escolher negócio…</option>
            {negocios.map((n) => (
              <option key={n.id} value={n.id}>
                {n.nome}
              </option>
            ))}
          </select>
          <input
            className={inputClass}
            type="file"
            accept=".rar,.zip,.7z,application/x-rar-compressed,application/vnd.rar"
            onChange={(e) => setFicheiro(e.target.files?.[0] ?? null)}
          />
          <input
            className={inputClass}
            placeholder="Versão (ex.: v3)"
            value={versao}
            onChange={(e) => setVersao(e.target.value)}
          />
          <input
            className={inputClass}
            placeholder="Notas"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button className={btnPrimario} onClick={submeter} disabled={carregar.isPending}>
            <Upload className="size-4" /> {carregar.isPending ? "A carregar…" : "Carregar"}
          </button>
          {ficheiro && (
            <span className="text-xs text-muted-foreground">
              {ficheiro.name} · {tamanho(ficheiro.size)}
            </span>
          )}
        </div>
      </Panel>

      <Panel
        className="mt-5"
        title="Arquivos guardados"
        actions={
          <select className={selectClass} value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="">Todos os negócios</option>
            {negocios.map((n) => (
              <option key={n.id} value={n.id}>
                {n.nome}
              </option>
            ))}
          </select>
        }
        bodyClassName=""
      >
        {isLoading ? (
          <Vazio texto="A carregar arquivos..." />
        ) : lista.length === 0 ? (
          <Vazio texto="Ainda não há arquivos carregados." icon={FileArchive} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-xs">
              <thead className="border-b border-border/50 text-[10px] uppercase tracking-[.13em] text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Ficheiro</th>
                  <th className="px-3 py-3 font-medium">Negócio</th>
                  <th className="px-3 py-3 font-medium">Versão</th>
                  <th className="px-3 py-3 font-medium">Tamanho</th>
                  <th className="px-3 py-3 font-medium">Data</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {lista.map((f) => (
                  <tr key={f.id} className="border-b border-border/40 transition hover:bg-accent/40">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 font-medium">
                        <FileArchive className="size-4 text-muted-foreground" /> {f.nome}
                      </div>
                      {f.notas && <div className="mt-0.5 text-[10px] text-muted-foreground">{f.notas}</div>}
                    </td>
                    <td className="px-3 py-3.5 text-muted-foreground">{nomeNegocio(f.business_id)}</td>
                    <td className="px-3 py-3.5">{f.versao ? <Chip tone="info">{f.versao}</Chip> : "—"}</td>
                    <td className="px-3 py-3.5 text-muted-foreground">{tamanho(Number(f.tamanho))}</td>
                    <td className="px-3 py-3.5 text-muted-foreground">{formatarData(f.created_at, true)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex justify-end gap-2">
                        <button className={btnPequeno} onClick={() => descarregar(f)}>
                          <Download className="size-3.5" /> Descarregar
                        </button>
                        <button
                          className={btnPequeno}
                          onClick={() => {
                            if (confirm(`Remover "${f.nome}"?`)) apagar.mutate(f);
                          }}
                        >
                          <Trash2 className="size-3.5" /> Remover
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
