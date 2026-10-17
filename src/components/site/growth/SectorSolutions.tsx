import { ArrowRight, Building2, Hammer, ShoppingBag, Waves, type LucideIcon } from "lucide-react";
import { type Locale } from "@/lib/i18n";

const copy = {
  pt: {
    eyebrow: "Soluções para negócios reais",
    title: "Cada setor tem desafios diferentes. O website também deve ter.",
    intro: "Nada de pacotes iguais para toda a gente. Escolhe o teu setor e fala-nos do projeto que tens em mente.",
    cta: "Pedir proposta",
    items: [
      ["Piscinas e serviços técnicos", "Mostra obras, serviços e áreas de intervenção com fotografias reais e pedidos de orçamento simples.", "piscinas"],
      ["Lojas e marcas", "Catálogos claros, lojas online e informação de produtos adaptada ao negócio.", "loja"],
      ["Coletividades e associações", "Notícias, atividades, contactos e informação da comunidade organizados num só espaço.", "coletividades"],
      ["Oficinas e negócios locais", "Explica os teus serviços, destaca trabalhos e facilita contactos por telemóvel.", "institucional"],
    ],
  },
  en: {
    eyebrow: "Built for real businesses", title: "Different sectors need different websites.",
    intro: "No one-size-fits-all packages. Pick your industry and tell us what your project needs.", cta: "Request a quote",
    items: [
      ["Pools & technical services", "Showcase real work, services and service areas, with easy quote requests.", "piscinas"],
      ["Shops & brands", "Clear catalogues, e-commerce and product information tailored to the business.", "loja"],
      ["Clubs & associations", "News, activities, contact details and community information in one place.", "coletividades"],
      ["Workshops & local businesses", "Explain services, highlight projects and make mobile contact easy.", "institucional"],
    ],
  },
  de: {
    eyebrow: "Für echte Unternehmen", title: "Jede Branche braucht eine passende Website.",
    intro: "Keine Einheitslösung. Wählen Sie Ihre Branche und erzählen Sie uns von Ihrem Projekt.", cta: "Angebot anfragen",
    items: [
      ["Poolbau & Technik", "Projekte und Leistungen mit echten Bildern und einfachen Anfragen präsentieren.", "piscinas"],
      ["Geschäfte & Marken", "Übersichtliche Kataloge, Onlineshops und relevante Produktinformationen.", "loja"],
      ["Vereine & Verbände", "Neuigkeiten, Aktivitäten und Kontakte übersichtlich an einem Ort.", "coletividades"],
      ["Werkstätten & lokale Betriebe", "Leistungen erklären, Projekte zeigen und Kontakt erleichtern.", "institucional"],
    ],
  },
  fr: {
    eyebrow: "Pour de vraies entreprises", title: "Chaque secteur mérite un site adapté.",
    intro: "Pas de formule unique. Choisissez votre secteur et parlons de votre projet.", cta: "Demander un devis",
    items: [
      ["Piscines & services techniques", "Présentez vos réalisations et services avec de vraies photos et des demandes simples.", "piscinas"],
      ["Boutiques & marques", "Catalogues clairs, e-commerce et informations produits pertinentes.", "loja"],
      ["Associations", "Actualités, activités et contacts réunis dans un même espace.", "coletividades"],
      ["Ateliers & commerces locaux", "Expliquez vos services, montrez votre travail et facilitez le contact.", "institucional"],
    ],
  },
  es: {
    eyebrow: "Para negocios reales", title: "Cada sector necesita una web diferente.",
    intro: "Sin fórmulas genéricas. Elige tu sector y cuéntanos qué necesitas.", cta: "Pedir presupuesto",
    items: [
      ["Piscinas y servicios técnicos", "Muestra trabajos reales, servicios y zonas de atención, con presupuestos sencillos.", "piscinas"],
      ["Tiendas y marcas", "Catálogos claros, comercio electrónico e información útil del producto.", "loja"],
      ["Asociaciones", "Noticias, actividades y contactos de la comunidad en un solo lugar.", "coletividades"],
      ["Talleres y negocios locales", "Explica tus servicios, enseña tus trabajos y facilita el contacto.", "institucional"],
    ],
  },
} as const;

const icons: LucideIcon[] = [Waves, ShoppingBag, Building2, Hammer];

export function SectorSolutions({ locale, contactPath }: { locale: Locale; contactPath: string }) {
  const t = copy[locale];
  return (
    <section className="mt-24" aria-labelledby="nws-sectors-title">
      <div className="max-w-3xl">
        <span className="text-[10px] font-semibold uppercase tracking-[.2em] text-primary">{t.eyebrow}</span>
        <h2 id="nws-sectors-title" className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">{t.title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">{t.intro}</p>
      </div>
      <div className="mt-7 grid gap-4 md:grid-cols-2">
        {t.items.map(([title, description, slug], idx) => {
          const Icon = icons[idx] || Building2;
          return (
            <article key={slug} className="group flex flex-col rounded-3xl border border-border/70 bg-card/40 p-6 transition duration-300 hover:border-primary/40 hover:bg-card/70">
              <div className="flex size-11 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10"><Icon className="size-5 text-primary" /></div>
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-2 flex-1 text-sm leading-7 text-muted-foreground">{description}</p>
              <a className="mt-5 inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline" href={`${contactPath}?tipo=${slug}`}>
                {t.cta} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}
