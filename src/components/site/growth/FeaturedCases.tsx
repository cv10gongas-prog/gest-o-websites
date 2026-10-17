import { useState } from "react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { type Locale } from "@/lib/i18n";
import { REAL_CASES } from "./cases";

const words = {
  pt: { badge: "Casos reais em detalhe", title: "Trabalhos com contexto, não apenas fotografias.", subtitle: "Conhece a necessidade do cliente, a solução construída e o website publicado. Os conceitos aparecem identificados mais abaixo.", all: "Todos", business: "Empresas", local: "Comunidade", case: "Explorar caso", visit: "Visitar website" },
  en: { badge: "Real project stories", title: "More than a collection of pictures.", subtitle: "Explore the client need, our solution and the published website. Concept projects are clearly identified below.", all: "All", business: "Businesses", local: "Community", case: "View case study", visit: "Visit website" },
  de: { badge: "Echte Projekte", title: "Mehr als eine Bildergalerie.", subtitle: "Erfahren Sie mehr über die Herausforderung, unsere Lösung und das veröffentlichte Projekt. Konzepte sind unten gekennzeichnet.", all: "Alle", business: "Unternehmen", local: "Gemeinschaft", case: "Projekt ansehen", visit: "Website öffnen" },
  fr: { badge: "Projets réels", title: "Bien plus qu'une galerie d'images.", subtitle: "Découvrez le besoin du client, notre solution et le site publié. Les concepts sont identifiés plus bas.", all: "Tous", business: "Entreprises", local: "Communauté", case: "Voir le projet", visit: "Visiter le site" },
  es: { badge: "Proyectos reales", title: "Mucho más que una galería de imágenes.", subtitle: "Descubre las necesidades del cliente, nuestra solución y la web publicada. Los conceptos están identificados más abajo.", all: "Todos", business: "Empresas", local: "Comunidad", case: "Ver proyecto", visit: "Visitar web" },
} as const;

type Filter = "all" | "business" | "local";

export function FeaturedCases({ locale }: { locale: Locale }) {
  const [filter, setFilter] = useState<Filter>("all");
  const t = words[locale];
  const visible = REAL_CASES.filter((item) =>
    filter === "all" || (filter === "local" ? ["31-janeiro", "alcabidechefm"].includes(item.slug) : !["31-janeiro", "alcabidechefm"].includes(item.slug))
  );
  return (
    <section className="mt-16" aria-labelledby="nws-cases-title">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-primary">{t.badge}</p>
          <h2 id="nws-cases-title" className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{t.title}</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">{t.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2" aria-label={t.badge}>
          {(["all", "business", "local"] as Filter[]).map((key) => (
            <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)} className={`rounded-xl border px-4 py-2 text-xs font-semibold transition ${filter === key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
              {t[key]}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((item) => (
          <article key={item.slug} className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card/45 transition duration-300 hover:-translate-y-1 hover:border-primary/40">
            <a href={`/projetos/${item.slug}`} aria-label={`${t.case}: ${item.name}`} className={`block aspect-[16/10] overflow-hidden ${item.visualIsLogo ? "bg-white p-8" : "bg-[#07111b]"}`}>
              <img src={item.image} alt={item.imageAlt} loading="lazy" decoding="async" className={`h-full w-full ${item.visualIsLogo ? "object-contain" : "object-cover object-top transition duration-300 group-hover:scale-[1.02]"}`} />
            </a>
            <div className="flex flex-1 flex-col p-6">
              <span className="text-[10px] font-semibold uppercase tracking-[.14em] text-primary">{item.category}</span>
              <h3 className="mt-2 text-xl font-semibold">{item.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{item.context}</p>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
                <a href={`/projetos/${item.slug}`} className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline">{t.case}<ArrowRight className="size-4" /></a>
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">{t.visit}<ExternalLink className="size-3.5" /></a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
