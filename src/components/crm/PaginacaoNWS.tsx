import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";

/** Paginação sem recarregar a página. O resultado é sempre limitado entre 1 e total. */
export function PaginacaoNWS({ pagina, total, irPara }: { pagina: number; total: number; irPara: (pagina: number) => void }) {
  const max = Math.max(1, total);
  const atual = Math.max(1, Math.min(max, pagina));
  const [destino, setDestino] = useState(String(atual));
  useEffect(() => setDestino(String(atual)), [atual]);
  const links = useMemo(() => {
    const paginas = new Set([1, max]);
    for (let i = Math.max(1, atual - 2); i <= Math.min(max, atual + 2); i++) paginas.add(i);
    if (atual < 5) for (let i = 1; i <= Math.min(max, 5); i++) paginas.add(i);
    if (atual > max - 4) for (let i = Math.max(1, max - 4); i <= max; i++) paginas.add(i);
    const ordenadas = [...paginas].sort((a, b) => a - b);
    return ordenadas.flatMap((n, i) => i > 0 && n - ordenadas[i - 1]! > 1 ? [null, n] : [n]);
  }, [atual, max]);
  function escolher(evento: FormEvent) {
    evento.preventDefault();
    const numero = Number(destino);
    if (Number.isSafeInteger(numero) && numero >= 1 && numero <= max) irPara(numero);
  }
  const base = "grid size-10 place-items-center rounded-xl border border-border/70 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-30";
  return <nav aria-label="Paginação" className="flex flex-wrap items-center justify-end gap-1.5">
    <button type="button" title="Primeira página" aria-label="Primeira página" disabled={atual === 1} onClick={() => irPara(1)} className={base}><ChevronsLeft className="size-4"/></button>
    <button type="button" title="Página anterior" aria-label="Página anterior" disabled={atual === 1} onClick={() => irPara(atual - 1)} className={base}><ChevronLeft className="size-4"/></button>
    <div className="flex items-center gap-1" aria-label={`Página ${atual} de ${max}`}>
      {links.map((n, idx) => n === null
        ? <span key={`ellipsis-${idx}`} aria-hidden="true" className="px-1 text-xs text-muted-foreground">…</span>
        : <button key={n} type="button" aria-label={`Ir para página ${n}`} aria-current={n === atual ? "page" : undefined} onClick={() => irPara(n)} className={`${base} ${n === atual ? "border-violet-500 bg-violet-600 text-white" : "text-muted-foreground hover:border-violet-400/50 hover:text-foreground"}`}>{n}</button>
      )}
    </div>
    <button type="button" title="Página seguinte" aria-label="Página seguinte" disabled={atual === max} onClick={() => irPara(atual + 1)} className={base}><ChevronRight className="size-4"/></button>
    <button type="button" title="Última página" aria-label="Última página" disabled={atual === max} onClick={() => irPara(max)} className={base}><ChevronsRight className="size-4"/></button>
    <form onSubmit={escolher} className="ml-1 flex items-center gap-1.5">
      <label htmlFor="nws-pagina-destino" className="sr-only">Número da página</label>
      <input id="nws-pagina-destino" type="number" inputMode="numeric" min={1} max={max} value={destino} onChange={e => setDestino(e.target.value)} className="h-10 w-16 rounded-xl border border-border/70 bg-background/70 px-2 text-center text-xs tabular-nums outline-none focus:border-violet-400" />
      <button type="submit" disabled={!Number.isSafeInteger(Number(destino)) || Number(destino) < 1 || Number(destino) > max} className="h-10 rounded-xl border border-violet-400/35 px-3 text-xs font-bold text-violet-200 hover:bg-violet-500/10 disabled:opacity-40">Ir</button>
    </form>
  </nav>;
}
