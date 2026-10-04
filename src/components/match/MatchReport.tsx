import { useMemo } from "react";
import {
  Trophy,
  BarChart3,
  Award,
  Clock,
  Shield,
  ArrowRight,
  TrendingUp,
  Percent,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import type { ActiveMatch, MatchPlayer } from "@/lib/match/types";
import { MODALITY_CONFIGS } from "@/lib/match/types";
import { cn } from "@/lib/utils";

export function MatchReport({ match }: { match: ActiveMatch }) {
  const config = MODALITY_CONFIGS[match.modality];
  const home = match.homeTeam;
  const away = match.awayTeam;

  // Estatísticas Coletivas
  const teamStats = useMemo(() => {
    const calcStats = (players: MatchPlayer[]) => {
      const goals = players.reduce((acc, p) => acc + p.stats.goals, 0);
      const assists = players.reduce((acc, p) => acc + p.stats.assists, 0);
      const shotsOn = players.reduce((acc, p) => acc + p.stats.shotsOnTarget, 0);
      const shotsOff = players.reduce((acc, p) => acc + p.stats.shotsOffTarget, 0);
      const fouls = players.reduce((acc, p) => acc + p.stats.foulsCommitted, 0);
      const yellows = players.reduce((acc, p) => acc + p.stats.yellowCards, 0);
      const reds = players.reduce((acc, p) => acc + p.stats.redCards, 0);
      const totalShots = shotsOn + shotsOff;
      const efficiency = totalShots > 0 ? Math.round((goals / totalShots) * 100) : 0;

      return {
        goals,
        assists,
        shotsOn,
        shotsOff,
        totalShots,
        efficiency,
        fouls,
        yellows,
        reds,
      };
    };

    return {
      home: calcStats(home.players),
      away: calcStats(away.players),
    };
  }, [home, away]);

  // Melhores em Campo (Jogadores com mais golos/assistências)
  const destaques = useMemo(() => {
    const all = [...home.players, ...away.players].filter(
      (p) => p.stats.goals > 0 || p.stats.assists > 0 || p.stats.shotsOnTarget > 0,
    );
    return all.sort(
      (a, b) => b.stats.goals * 3 + b.stats.assists * 2 - (a.stats.goals * 3 + a.stats.assists * 2),
    );
  }, [home, away]);

  return (
    <div className="space-y-8">
      {/* CABEÇALHO DO RELATÓRIO */}
      <div className="rounded-3xl border border-emerald-500/30 bg-surface/50 p-6 sm:p-8 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              Relatório Oficial de Estatísticas • {config.name}
            </span>
            <h2 className="text-2xl font-black text-foreground mt-1">{match.title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {match.competition} • {match.location} • Duração total:{" "}
              {Math.floor(match.totalElapsedSeconds / 60)} minutos
            </p>
          </div>

          <div className="flex items-center gap-4 bg-surface-strong px-5 py-3 rounded-2xl border border-border/80">
            <div className="text-right">
              <div className="font-bold text-xs text-foreground truncate max-w-[120px]">
                {home.name}
              </div>
              <div className="text-[10px] text-muted-foreground">{home.shortName}</div>
            </div>
            <div className="font-mono text-2xl font-black text-emerald-400">
              {match.homeScore} - {match.awayScore}
            </div>
            <div className="text-left">
              <div className="font-bold text-xs text-foreground truncate max-w-[120px]">
                {away.name}
              </div>
              <div className="text-[10px] text-muted-foreground">{away.shortName}</div>
            </div>
          </div>
        </div>

        {/* COMPARATIVO DE EQUIPAS */}
        <div className="mt-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Indicadores Coletivos do Jogo
          </h3>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatComparison
              title="Remates Totais (Baliza)"
              homeVal={`${teamStats.home.totalShots} (${teamStats.home.shotsOn})`}
              awayVal={`${teamStats.away.totalShots} (${teamStats.away.shotsOn})`}
              homeNum={teamStats.home.totalShots}
              awayNum={teamStats.away.totalShots}
            />

            <StatComparison
              title="Eficácia de Remate"
              homeVal={`${teamStats.home.efficiency}%`}
              awayVal={`${teamStats.away.efficiency}%`}
              homeNum={teamStats.home.efficiency}
              awayNum={teamStats.away.efficiency}
            />

            <StatComparison
              title="Faltas Cometidas"
              homeVal={teamStats.home.fouls}
              awayVal={teamStats.away.fouls}
              homeNum={teamStats.home.fouls}
              awayNum={teamStats.away.fouls}
              invertWinner
            />

            <StatComparison
              title="Disciplina (🟨 / 🟥)"
              homeVal={`${teamStats.home.yellows} / ${teamStats.home.reds}`}
              awayVal={`${teamStats.away.yellows} / ${teamStats.away.reds}`}
              homeNum={teamStats.home.yellows + teamStats.home.reds * 2}
              awayNum={teamStats.away.yellows + teamStats.away.reds * 2}
              invertWinner
            />
          </div>
        </div>
      </div>

      {/* DESTAQUES INDIVIDUAIS */}
      {destaques.length > 0 && (
        <div className="rounded-3xl border border-border/70 bg-surface/40 p-6 backdrop-blur-md space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Award className="size-4 text-emerald-400" />
            Destaques Individuais da Partida
          </h3>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {destaques.slice(0, 6).map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-2xl border border-border/60 bg-surface/70 p-3.5"
              >
                <div>
                  <div className="font-bold text-xs text-foreground">
                    #{p.number} {p.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {p.position} • {p.stats.minutesPlayed}' jogados
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono font-bold">
                  {p.stats.goals > 0 && (
                    <span className="text-emerald-400">⚽ {p.stats.goals}</span>
                  )}
                  {p.stats.assists > 0 && (
                    <span className="text-sky-400">👟 {p.stats.assists}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TABELA DETALHADA DE JOGADORES (HOME TEAM) */}
      <div className="rounded-3xl border border-border/70 bg-surface/40 backdrop-blur-md overflow-hidden">
        <div className="border-b border-border/60 bg-surface/30 px-6 py-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">
            Ficha Estatística Individual: {home.name}
          </h3>
          <span className="text-xs font-mono text-emerald-400 font-bold">{home.shortName}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/40 bg-surface/60 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-3">Nº</th>
                <th className="px-3 py-3">Nome do Atleta</th>
                <th className="px-3 py-3">Posição</th>
                <th className="px-3 py-3">Minutos</th>
                <th className="px-3 py-3 text-center">Golos</th>
                <th className="px-3 py-3 text-center">Assists</th>
                <th className="px-3 py-3 text-center">Remates (Baliza)</th>
                <th className="px-3 py-3 text-center">Faltas</th>
                <th className="px-3 py-3 text-center">Cartões</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {home.players.map((p) => (
                <tr key={p.id} className="hover:bg-surface-strong/50 transition">
                  <td className="px-6 py-3 font-mono font-bold text-foreground">#{p.number}</td>
                  <td className="px-3 py-3 font-semibold text-foreground">
                    <span>{p.name}</span>
                    {p.isStarter && (
                      <span className="ml-2 rounded bg-primary/10 px-1 py-0.2 text-[9px] text-primary">
                        Titular
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{p.position}</td>
                  <td className="px-3 py-3 font-mono text-muted-foreground">
                    {p.stats.minutesPlayed}'
                  </td>
                  <td className="px-3 py-3 text-center font-mono font-bold text-emerald-400">
                    {p.stats.goals || "-"}
                  </td>
                  <td className="px-3 py-3 text-center font-mono font-bold text-sky-400">
                    {p.stats.assists || "-"}
                  </td>
                  <td className="px-3 py-3 text-center font-mono text-foreground">
                    {p.stats.shotsOnTarget + p.stats.shotsOffTarget > 0
                      ? `${p.stats.shotsOnTarget + p.stats.shotsOffTarget} (${p.stats.shotsOnTarget})`
                      : "-"}
                  </td>
                  <td className="px-3 py-3 text-center font-mono text-muted-foreground">
                    {p.stats.foulsCommitted || "-"}
                  </td>
                  <td className="px-3 py-3 text-center font-mono">
                    {p.stats.yellowCards > 0 && (
                      <span className="text-yellow-400">🟨{p.stats.yellowCards} </span>
                    )}
                    {p.stats.redCards > 0 && (
                      <span className="text-danger">🟥{p.stats.redCards}</span>
                    )}
                    {!p.stats.yellowCards && !p.stats.redCards && (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatComparison({
  title,
  homeVal,
  awayVal,
  homeNum,
  awayNum,
  invertWinner = false,
}: {
  title: string;
  homeVal: string | number;
  awayVal: string | number;
  homeNum: number;
  awayNum: number;
  invertWinner?: boolean;
}) {
  const homeWins = invertWinner ? homeNum < awayNum : homeNum > awayNum;
  const awayWins = invertWinner ? awayNum < homeNum : awayNum > homeNum;

  return (
    <div className="rounded-2xl border border-border/60 bg-surface/70 p-4 space-y-2">
      <div className="text-[11px] font-bold text-muted-foreground uppercase">{title}</div>
      <div className="flex items-center justify-between font-mono text-base font-bold">
        <span className={cn(homeWins ? "text-emerald-400 font-black" : "text-foreground")}>
          {homeVal}
        </span>
        <span className="text-muted-foreground/40 text-xs">vs</span>
        <span className={cn(awayWins ? "text-sky-400 font-black" : "text-foreground")}>
          {awayVal}
        </span>
      </div>
    </div>
  );
}
