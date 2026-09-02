import { Download, FileArchive, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Panel, Vazio } from "@/components/crm/Bits";
import { btnPequeno, btnPrimario, inputClass } from "@/components/crm/Modal";
import { formatarData } from "@/lib/crm";
import {
  LIMITE_FICHEIRO,
  urlDescarregarFicheiro,
  useApagarFicheiro,
  useBusinessFiles,
  useCarregarFicheiro,
  type BusinessFile,
} from "@/lib/queries";

function tamanho(bytes?: number | null) {
  if (!bytes) return "—";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

export function PainelArquivos({ businessId }: { businessId: string }) {
  const { data: ficheiros = [], isLoading } = useBusinessFiles(businessId);
  const carregar = useCarregarFicheiro();
  const apagar = useApagarFicheiro();
  const inputRef = useRef<HTMLInputElement>(null);
  const [versao, setVersao] = useState("");

  function escolher(lista: FileList | null) {
    const ficheiro = lista?.[0];
    if (!ficheiro) return;
    if (ficheiro.size > LIMITE_FICHEIRO) {
      toast.error("O ficheiro excede os 300 MB.");
      return;
    }
    carregar.mutate(
      { businessId, ficheiro, versao: versao.trim() || null },
      {
        onSuccess: () => {
          setVersao("");
          if (inputRef.current) inputRef.current.value = "";
        },
      },
    );
  }

  async function descarregar(f: BusinessFile) {
    try {
      const url = await urlDescarregarFicheiro(f.caminho);
      window.open(url, "_blank");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <Panel title="Arquivos do projeto" subtitle="Ficheiros .rar/.zip até 300 MB">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          className={inputClass}
          placeholder="Versão (ex.: v2)"
          value={versao}
          onChange={(e) => setVersao(e.target.value)}
        />
        <input
          ref={inputRef}
          type="file"
          accept=".rar,.zip,.7z"
          className="hidden"
          onChange={(e) => escolher(e.target.files)}
        />
        <button
          className={btnPrimario}
          disabled={carregar.isPending}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-4" /> {carregar.isPending ? "A carregar…" : "Carregar arquivo"}
        </button>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <Vazio texto="A carregar arquivos…" />
        ) : ficheiros.length === 0 ? (
          <Vazio texto="Sem arquivos para este projeto." icon={FileArchive} />
        ) : (
          <ul className="space-y-2 text-xs">
            {ficheiros.map((f) => (
              <li
                key={f.id}
                className="flex items-center gap-3 rounded-xl border border-border/60 p-3"
              >
                <FileArchive className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{f.nome}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {tamanho(f.tamanho)}
                    {f.versao ? ` · ${f.versao}` : ""} · {formatarData(f.created_at, true)}
                  </span>
                </span>
                <button className={btnPequeno} onClick={() => descarregar(f)} aria-label="Descarregar">
                  <Download className="size-3.5" />
                </button>
                <button
                  className={btnPequeno}
                  onClick={() => apagar.mutate(f)}
                  aria-label="Remover"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Panel>
  );
}
