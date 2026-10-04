import { useState } from "react";
import { Trophy, X, Sparkles, Check, Users } from "lucide-react";
import { toast } from "sonner";
import type { MatchModality } from "@/lib/match/types";
import { MODALITY_CONFIGS } from "@/lib/match/types";
import { matchStore } from "@/lib/match/store";

export function NewMatchModal({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const [modalidade, setModalidade] = useState<MatchModality>("futsal");
  const [titulo, setTitulo] = useState("Liga Principal • Jornada 1");
  const [competicao, setCompeticao] = useState("Liga NWS");
  const [local, setLocal] = useState("Pavilhão Municipal");
  const [equipaCasa, setEquipaCasa] = useState("Nova Web FC");
  const [equipaFora, setEquipaFora] = useState("Sporting Clube de Cascais");
  const [duracao, setDuracao] = useState<number>(20);

  if (!aberto) return null;

  function handleModalityChange(m: MatchModality) {
    setModalidade(m);
    setDuracao(MODALITY_CONFIGS[m].defaultPeriodMinutes);
  }

  function criarJogo() {
    if (!equipaCasa.trim() || !equipaFora.trim()) {
      toast.error("Indique o nome das duas equipas.");
      return;
    }

    matchStore.startNewMatch({
      title: titulo,
      competition: competicao,
      location: local,
      modality: modalidade,
      homeTeamName: equipaCasa,
      awayTeamName: equipaFora,
      periodMinutes: duracao,
    });

    toast.success(`Novo jogo de ${MODALITY_CONFIGS[modalidade].name} criado com sucesso!`);
    onFechar();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-xl rounded-3xl border border-emerald-500/30 bg-surface p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-400">
              <Trophy className="size-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                Configurar Novo Jogo
              </h3>
              <p className="text-xs text-muted-foreground">
                Escolha a modalidade regulamentar e os parâmetros da partida.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onFechar}
            className="text-muted-foreground hover:text-foreground p-1"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* ESCOLHA DA MODALIDADE (4 MODALIDADES) */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Modalidade Regulamentar:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(MODALITY_CONFIGS) as MatchModality[]).map((key) => {
              const cfg = MODALITY_CONFIGS[key];
              const selecionado = modalidade === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleModalityChange(key)}
                  className={`flex flex-col items-center justify-center gap-1 rounded-2xl border p-3 text-center transition ${
                    selecionado
                      ? "border-emerald-500 bg-emerald-500/15 text-emerald-400 font-bold shadow-sm"
                      : "border-border/70 bg-surface/60 text-muted-foreground hover:bg-surface-strong hover:text-foreground"
                  }`}
                >
                  <span className="text-sm font-mono">
                    {cfg.playersOnPitch}v{cfg.playersOnPitch}
                  </span>
                  <span className="text-xs">{cfg.name}</span>
                  <span className="text-[9px] opacity-70">2x {cfg.defaultPeriodMinutes}m</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* DETALHES DO JOGO */}
        <div className="grid gap-4 sm:grid-cols-2 text-xs">
          <div>
            <label className="block font-semibold text-muted-foreground mb-1">
              Título do Jogo / Jornada:
            </label>
            <input
              className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:outline-none focus:border-emerald-500"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Campeonato • Jornada 3"
            />
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">
              Competição / Torneio:
            </label>
            <input
              className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:outline-none focus:border-emerald-500"
              value={competicao}
              onChange={(e) => setCompeticao(e.target.value)}
              placeholder="Ex: Taça Distrital"
            />
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">
              Equipa da Casa (Visitada):
            </label>
            <input
              className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:outline-none focus:border-emerald-500"
              value={equipaCasa}
              onChange={(e) => setEquipaCasa(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">
              Equipa Visitante:
            </label>
            <input
              className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:outline-none focus:border-emerald-500"
              value={equipaFora}
              onChange={(e) => setEquipaFora(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">
              Local / Estádio / Pavilhão:
            </label>
            <input
              className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:outline-none focus:border-emerald-500"
              value={local}
              onChange={(e) => setLocal(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">
              Duração de Cada Parte (Minutos):
            </label>
            <input
              type="number"
              min={10}
              max={60}
              className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:outline-none focus:border-emerald-500"
              value={duracao}
              onChange={(e) => setDuracao(Number(e.target.value))}
            />
          </div>
        </div>

        {/* RODAPÉ DO MODAL */}
        <div className="pt-4 border-t border-border/60 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onFechar}
            className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-surface-strong"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={criarJogo}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20"
          >
            <Check className="size-4" />
            <span>Iniciar Partida</span>
          </button>
        </div>
      </div>
    </div>
  );
}
