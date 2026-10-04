import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  AlertTriangle,
  Building2,
  Check,
  Globe,
  ImagePlus,
  Palette,
  RotateCcw,
  Save,
  Sliders,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  Field,
  PanelHeader,
  RestaurantCard,
  fieldClass,
} from "@/components/restaurant/RestaurantBits";
import type { Settings } from "@/lib/restaurant/demo-data";
import { adminActions, uploadImage, useAdmin } from "@/lib/restaurant/store";

export const Route = createFileRoute("/_authenticated/produtos/restaurantes/definicoes")({
  component: RestaurantSettingsPage,
});

const featureLabels: [keyof Settings["features"], string, string][] = [
  [
    "qrOrders",
    "Pedidos Diretos por QR Code",
    "Permite aos clientes enviar pedidos diretamente para a cozinha pelo telemóvel.",
  ],
  [
    "callWaiter",
    "Chamar Empregado",
    "Adiciona o botão para solicitar assistência do empregado à mesa.",
  ],
  [
    "requestBill",
    "Pedir Conta",
    "Permite ao cliente notificar a sala de que pretende efetuar o pagamento.",
  ],
  [
    "reservations",
    "Módulo de Reservas Online",
    "Disponibiliza o formulário de marcação de mesas no website público.",
  ],
];

function RestaurantSettingsPage() {
  const {
    data: { settings },
    restaurantId,
  } = useAdmin();

  const [logo, setLogo] = useState(settings.logo);
  const [color, setColor] = useState(settings.primaryColor);
  const [features, setFeatures] = useState(settings.features);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function pickLogo(file: File) {
    setUploading(true);
    try {
      const url = await uploadImage(restaurantId, file, 320);
      setLogo(url);
      toast.success("Logótipo carregado com sucesso. Guarde as alterações para aplicar.");
    } catch (e) {
      toast.error(`Erro ao carregar logótipo: ${(e as Error).message}`);
    }
    setUploading(false);
  }

  async function submitSettings(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const getVal = (k: string, max = 300) =>
      String(f.get(k) ?? "")
        .trim()
        .slice(0, max);

    if (!getVal("name")) {
      toast.error("Indique o nome do estabelecimento.");
      return;
    }

    setSaving(true);
    try {
      await adminActions.saveSettings(restaurantId, {
        ...settings,
        name: getVal("name", 60),
        tagline: getVal("tagline", 80),
        introduction: getVal("introduction", 300),
        phone: getVal("phone", 30),
        email: getVal("email", 200),
        address: getVal("address", 200),
        hours: getVal("hours", 600)
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean),
        logo,
        primaryColor: color,
        features,
      });
      toast.success(
        "Configurações guardadas. O website público e a ementa digital foram atualizados.",
      );
    } catch (err) {
      toast.error(`Erro ao guardar: ${(err as Error).message}`);
    }
    setSaving(false);
  }

  async function resetDemoData() {
    const confirmText = prompt(
      'Atenção: Esta ação vai repor os dados de demonstração (pedidos, reservas, mesas e produtos voltarão ao estado de fábrica inicial).\n\nPara confirmar, escreva "REPOR" na caixa abaixo:',
    );
    if (confirmText !== "REPOR") {
      toast.info("Reposição cancelada.");
      return;
    }

    try {
      await adminActions.reset(restaurantId);
      toast.success("Dados de demonstração repostos com sucesso.");
    } catch (e) {
      toast.error(`Erro ao repor: ${(e as Error).message}`);
    }
  }

  return (
    <form onSubmit={submitSettings} className="space-y-6 max-w-[900px]">
      {/* CABEÇALHO */}
      <PanelHeader
        title="Configurações do Restaurante"
        subtitle="Personalize a identidade da marca, contactos, horários de funcionamento e módulos ativos no menu e nos QR Codes."
        action={
          <button
            type="submit"
            disabled={saving || uploading}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-50"
          >
            <Save className="size-4" />
            <span>{saving ? "A guardar..." : "Guardar Alterações"}</span>
          </button>
        }
      />

      {/* BLOCO 1: IDENTIDADE E MARCA */}
      <RestaurantCard className="p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-border/40 pb-3">
          <Building2 className="size-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Identidade & Apresentação
          </h2>
        </div>

        <Field label="Nome do Restaurante">
          <input
            name="name"
            required
            maxLength={60}
            defaultValue={settings.name}
            className={fieldClass}
          />
        </Field>

        <Field label="Slogan / Frase Principal">
          <input
            name="tagline"
            maxLength={80}
            defaultValue={settings.tagline}
            placeholder="Ex.: Cozinha portuguesa de produto, servida sem pressa."
            className={fieldClass}
          />
        </Field>

        <Field label="Apresentação Curta do Espaço">
          <textarea
            name="introduction"
            rows={2}
            maxLength={300}
            defaultValue={settings.introduction}
            placeholder="Apresentação exibida aos clientes na página inicial da ementa..."
            className={`${fieldClass} h-auto py-2`}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-border/30">
          {/* Upload de Logótipo */}
          <div className="space-y-1.5">
            <span className="block text-xs font-semibold text-foreground">Logótipo</span>
            <div className="flex items-center gap-3">
              {logo ? (
                <img
                  src={logo}
                  alt=""
                  className="size-14 rounded-xl border border-border/70 object-contain p-1 bg-surface-strong"
                />
              ) : (
                <span className="grid size-14 place-items-center rounded-xl border border-dashed border-border/80 bg-surface text-xs text-muted-foreground">
                  —
                </span>
              )}

              <div className="space-y-1">
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border/80 bg-surface px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-strong transition">
                  <ImagePlus className="size-3.5 text-primary" />
                  <span>{uploading ? "A carregar..." : "Carregar Logo"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) pickLogo(file);
                    }}
                  />
                </label>
                {logo && (
                  <button
                    type="button"
                    onClick={() => setLogo("")}
                    className="block text-[10px] text-danger hover:underline"
                  >
                    Remover logótipo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Cor Principal */}
          <div className="space-y-1.5">
            <span className="block text-xs font-semibold text-foreground">
              Cor Principal da Marca
            </span>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="size-10 cursor-pointer rounded-xl border border-border bg-surface p-1"
                aria-label="Cor principal"
              />
              <span className="font-mono text-xs font-bold text-foreground">{color}</span>
            </div>
          </div>
        </div>
      </RestaurantCard>

      {/* BLOCO 2: CONTACTOS E HORÁRIO */}
      <RestaurantCard className="p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-border/40 pb-3">
          <Globe className="size-4 text-info" />
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Contactos & Horário de Funcionamento
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Telefone para Reservas">
            <input
              name="phone"
              maxLength={30}
              defaultValue={settings.phone}
              placeholder="912 000 000"
              className={fieldClass}
            />
          </Field>

          <Field label="Email de Contacto">
            <input
              name="email"
              type="email"
              maxLength={200}
              defaultValue={settings.email}
              placeholder="reservas@restaurante.pt"
              className={fieldClass}
            />
          </Field>
        </div>

        <Field label="Morada / Localização">
          <input
            name="address"
            maxLength={200}
            defaultValue={settings.address}
            placeholder="Rua das Oliveiras 12, Lisboa"
            className={fieldClass}
          />
        </Field>

        <Field label="Horário Semanal" hint="Escreva uma linha por cada período de funcionamento.">
          <textarea
            name="hours"
            rows={4}
            defaultValue={settings.hours.join("\n")}
            placeholder="Terça a sexta: 12:00 - 15:00 e 19:00 - 23:00&#10;Sábado: 12:30 - 16:00 e 19:00 - 23:30&#10;Domingo: 12:30 - 16:00&#10;Segunda: encerrado"
            className={`${fieldClass} h-auto py-2`}
          />
        </Field>
      </RestaurantCard>

      {/* BLOCO 3: MÓDULOS ATIVOS */}
      <RestaurantCard className="p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-border/40 pb-3">
          <Sliders className="size-4 text-warning" />
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Módulos & Funcionalidades Ativas
          </h2>
        </div>

        <div className="divide-y divide-border/30">
          {featureLabels.map(([key, label, desc]) => (
            <label
              key={key}
              className="flex items-center justify-between py-3 cursor-pointer first:pt-0 last:pb-0"
            >
              <div className="space-y-0.5 pr-4">
                <span className="text-xs font-bold text-foreground block">{label}</span>
                <span className="text-[11px] text-muted-foreground block leading-relaxed">
                  {desc}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                  {features[key] ? "Ativo" : "Desativado"}
                </span>
                <Switch
                  checked={features[key]}
                  onCheckedChange={(v) => setFeatures((prev) => ({ ...prev, [key]: v }))}
                />
              </div>
            </label>
          ))}
        </div>
      </RestaurantCard>

      {/* BLOCO 4: ZONA DE MANUTENÇÃO & REPOSIÇÃO */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/40">
        <button
          type="button"
          onClick={resetDemoData}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-danger transition"
        >
          <RotateCcw className="size-3.5" />
          <span>Repor Dados de Demonstração</span>
        </button>

        <button
          type="submit"
          disabled={saving || uploading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-50"
        >
          <Save className="size-4" />
          <span>{saving ? "A guardar..." : "Guardar Todas as Alterações"}</span>
        </button>
      </div>
    </form>
  );
}
