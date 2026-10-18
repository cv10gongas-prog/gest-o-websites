import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

// GA4 é carregado apenas após consentimento pelo script partilhado.

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>

        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>

        <p className="mt-2 text-sm text-muted-foreground">
          A página que procuras não existe ou foi movida.
        </p>

        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  console.error(error);

  const router = useRouter();

  useEffect(() => {
    reportLovableError(error, {
      boundary: "tanstack_root_error_component",
    });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Esta página não carregou
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Algo correu mal. Podes tentar novamente ou voltar ao início.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            Tentar novamente
          </button>

          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },

      // Nome base
      {
        title: "Nova Web Studio | Criação de Websites Profissionais em Portugal",
      },

      {
        name: "description",
        content:
          "Criamos websites profissionais, lojas online e soluções web à medida em Portugal. Design moderno, SEO e desenvolvimento focado no teu negócio.",
      },

      // Cor do browser / Android
      {
        name: "theme-color",
        content: "#07101c",
      },

      // Nome da aplicação
      {
        name: "application-name",
        content: "Nova Web Studio",
      },

      // Android / Chrome
      {
        name: "mobile-web-app-capable",
        content: "yes",
      },

      // iPhone / iPad
      {
        name: "apple-mobile-web-app-capable",
        content: "yes",
      },
      {
        name: "apple-mobile-web-app-status-bar-style",
        content: "black-translucent",
      },
      {
        name: "apple-mobile-web-app-title",
        content: "Nova Web Studio",
      },

      // Open Graph
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:site_name",
        content: "Nova Web Studio",
      },
      {
        property: "og:image",
        content: "https://www.novawebstudio.pt/logo.png",
      },

      // Twitter / partilhas
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:image",
        content: "https://www.novawebstudio.pt/logo.png",
      },

      // Microsoft
      {
        name: "msapplication-TileColor",
        content: "#07101c",
      },
      {
        name: "msapplication-TileImage",
        content: "/mstile-150x150.png",
      },
    ],

    links: [
      // CSS
      {
        rel: "stylesheet",
        href: appCss,
      },

      // Favicon clássico
      {
        rel: "icon",
        href: "/favicon.ico",
        type: "image/x-icon",
      },

      // PNG pequenos para browsers
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "48x48",
        href: "/favicon-48x48.png",
      },

      // iPhone / iPad
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },

      // Android / Chrome
      {
        rel: "icon",
        type: "image/png",
        sizes: "192x192",
        href: "/android-chrome-192x192.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "512x512",
        href: "/android-chrome-512x512.png",
      },

      // Manifest
      {
        rel: "manifest",
        href: "/site.webmanifest",
      },

      // Safari antigo / pinned tab
      {
        rel: "mask-icon",
        href: "/safari-pinned-tab.svg",
        color: "#39d9e6",
      },

      // Fontes
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap",
      },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: state => state.location.pathname });
  const language = pathname.startsWith('/en/') || pathname === '/en' ? 'en'
    : pathname.startsWith('/es/') || pathname === '/es' ? 'es'
    : pathname.startsWith('/fr/') || pathname === '/fr' ? 'fr'
    : pathname.startsWith('/de/') || pathname === '/de' ? 'de'
    : 'pt-PT';
  return (
    <html lang={language} className="dark">
      <head>
        <HeadContent />

        <link rel="stylesheet" href="/nws-html-aprovado/nws-consentimento.css" />
        <script defer src="/nws-html-aprovado/nws-consentimento.js" />
      </head>

      <body>
        {children}

        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />

      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
