import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Flame,
  Layers,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { PanelHeader, RestaurantCard } from "@/components/restaurant/RestaurantBits";

export const Route = createFileRoute("/_authenticated/produtos/match")({
  head: () => ({
    meta: [
      { title: "NWS Match — Futebol & Futsal — Nova Web Studio" },
      {
        name: "description",
        content:
          "Plataforma desportiva avançada para Futebol (11, 7, 9) e Futsal: cronómetro, minutos em campo, golos, faltas e relatórios estatísticos.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProdutosMatch,
});

function ProdutosMatch() {
  return (
    <div className="space-y-8 max-w-[1300px]">
      {/* CABEÇALHO */}
      <PanelHeader
        title="NWS Match"
        subtitle="Plataforma de alta performance para análise desportiva, controlo de jogos em direto e estatísticas de Futebol e Futsal."
        action={
          <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock3 className="size-3.5" />
            <span>Fase de Arquitetura & Modelação</span>
          </span>
        }
      />

      {/* MODALIDADES SUPORTADAS */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="size-4 text-emerald-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Modalidades Regulamentares Suportadas
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* MODALIDADE 1: FUTSAL */}
          <div className="rounded-3xl border border-emerald-500/30 bg-surface/50 p-6 backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-400 font-bold">
                5v5
              </span>
              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-400">
                Futsal
              </span>
            </div>
            <h3 className="text-base font-bold text-foreground">Futsal Oficial</h3>
            <ul className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
              <li>• <strong>Tempo Útil:</strong> 2 partes de 20 minutos com paragem de cronómetro.</li>
              <li>• <strong>Substituições:</strong> Volantes e ilimitadas sem paragem de jogo.</li>
              <li>• <strong>Faltas Acumuladas:</strong> Tiro livre direto de 10m a partir da 6ª falta.</li>
              <li>• <strong>Cartões:</strong> 2 min em inferioridade numérica ou até sofrer golo.</li>
            </ul>
          </div>

          {/* MODALIDADE 2: FUTEBOL 11 */}
          <div className="rounded-3xl border border-primary/30 bg-surface/50 p-6 backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary font-bold">
                11v11
              </span>
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                Futebol 11
              </span>
            </div>
            <h3 className="text-base font-bold text-foreground">Futebol de 11</h3>
            <ul className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
              <li>• <strong>Duração:</strong> 2 partes de 45 minutos (tempo corrido com descontos).</li>
              <li>• <strong>Substituições:</strong> 5 substituições em 3 paragens (ou regulamento específico).</li>
              <li>• <strong>Métricas:</strong> Golos, remates à baliza, foras de jogo, cartões e faltas.</li>
              <li>• <strong>Minutos em Campo:</strong> Registo automático por titular e suplente utilizado.</li>
            </ul>
          </div>

          {/* MODALIDADE 3: FUTEBOL DE FORMAÇÃO (7 / 9) */}
          <div className="rounded-3xl border border-info/30 bg-surface/50 p-6 backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-2xl bg-info/10 text-info font-bold">
                7 / 9
              </span>
              <span className="rounded-md bg-info/10 px-2 py-0.5 text-[10px] font-bold uppercase text-info">
                Formação
              </span>
            </div>
            <h3 className="text-base font-bold text-foreground">Futebol 7 & Futebol 9</h3>
            <ul className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
              <li>• <strong>Escalões Jovens:</strong> Petizes, Traquinas, Benjamins, Infantis, Iniciados.</li>
              <li>• <strong>Durações Adaptadas:</strong> 2x 25 min, 2x 30 min ou 2x 35 min configuráveis.</li>
              <li>• <strong>Substituições Livres:</strong> Apoio a regras de rotação de todos os atletas.</li>
              <li>• <strong>Relatórios de Evolução:</strong> Minutos jogados e indicadores formativos.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES EM DESENVOLVIMENTO */}
      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-border/70 bg-surface/50 p-6 backdrop-blur-md space-y-3">
          <div className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Users className="size-5" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Clubes, Equipas & Plantéis</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Gestão de escalões, números de camisola, posições, fichas individuais de atletas e histórico de épocas desportivas.
          </p>
        </div>

        <div className="rounded-3xl border border-border/70 bg-surface/50 p-6 backdrop-blur-md space-y-3">
          <div className="grid size-10 place-items-center rounded-2xl bg-warning/10 text-warning">
            <Activity className="size-5" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Live Match Engine</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Interface para tablet/portátil durante os jogos: cronómetro com 1 clique, substituições rápidas, remates, golos e faltas em tempo real.
          </p>
        </div>

        <div className="rounded-3xl border border-border/70 bg-surface/50 p-6 backdrop-blur-md space-y-3">
          <div className="grid size-10 place-items-center rounded-2xl bg-info/10 text-info">
            <Layers className="size-5" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Relatórios & Estatísticas</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Relatórios completos por jogo com cronologia minuto a minuto, minutos jogados por atleta e mapas de eficácia para treinadores.
          </p>
        </div>
      </section>
    </div>
  );
}
