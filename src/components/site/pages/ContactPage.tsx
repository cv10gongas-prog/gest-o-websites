import { CheckCircle2, Clock3, Mail, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Campo, Chip, Panel } from "@/components/crm/Bits";
import {
  btnPrimario,
  inputClass,
  selectClass,
  textareaClass,
} from "@/components/crm/Modal";
import { SiteChrome } from "@/components/site/SiteChrome";
import { supabase } from "@/integrations/supabase/client";
import {
  dict,
  ORCAMENTO_VALUES,
  TIPO_VALUES,
  type Locale,
} from "@/lib/i18n";

export function ContactPage({ locale }: { locale: Locale }) {
  const t = dict[locale].contact;

  const [nome, setNome] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipoProjeto, setTipoProjeto] = useState<string>(TIPO_VALUES[0]);
  const [orcamento, setOrcamento] = useState<string>(ORCAMENTO_VALUES[0]);
  const [mensagem, setMensagem] = useState("");
  const [querReuniao, setQuerReuniao] = useState(false);
  const [aEnviar, setAEnviar] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function submeter(e: React.FormEvent) {
    e.preventDefault();

    if (!nome.trim() || !email.trim()) {
      toast.error(t.errorRequired);
      return;
    }

    setAEnviar(true);

    const origem = `Origem: Website público (${locale.toUpperCase()})`;

    const { error } = await supabase.from("website_requests").insert({
      nome: nome.trim(),
      empresa: empresa.trim() || null,
      email: email.trim(),
      telefone: telefone.trim() || null,
      tipo_projeto: tipoProjeto,
      orcamento,
      mensagem: mensagem.trim()
        ? `${mensagem.trim()}\n\n${origem}`
        : origem,
      quer_reuniao: querReuniao,
    });

    setAEnviar(false);

    if (error) {
      toast.error(t.errorSend);
      return;
    }

    setEnviado(true);

    toast.success(t.success);
  }

  return (
    <SiteChrome locale={locale} page="contact">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
        <section>
          <Chip tone="primary">{t.chip}</Chip>

          <h1 className="orbit-gradient-text mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            {t.h1}
          </h1>

          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            {t.lead}
          </p>

          <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Clock3 className="size-4" />
              {t.reply}
            </li>

            <li className="flex items-center gap-2">
              <Mail className="size-4" />
              geral@novawebstudio.pt
            </li>

            <li className="flex items-center gap-2">
              <MapPin className="size-4" />
              {t.location}
            </li>
          </ul>
        </section>

        <Panel title={t.panelTitle} subtitle={t.panelSubtitle}>
          {enviado ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle2 className="size-8 text-primary" />

              <p className="text-sm font-medium">{t.sentTitle}</p>

              <p className="text-xs text-muted-foreground">{t.sentText}</p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={submeter}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo label={t.labels.nome}>
                  <input
                    className={inputClass}
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </Campo>

                <Campo label={t.labels.empresa}>
                  <input
                    className={inputClass}
                    value={empresa}
                    onChange={(e) => setEmpresa(e.target.value)}
                  />
                </Campo>

                <Campo label={t.labels.email}>
                  <input
                    className={inputClass}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Campo>

                <Campo label={t.labels.telefone}>
                  <input
                    className={inputClass}
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                  />
                </Campo>

                <Campo label={t.labels.tipo}>
                  <select
                    className={selectClass}
                    value={tipoProjeto}
                    onChange={(e) => setTipoProjeto(e.target.value)}
                  >
                    {TIPO_VALUES.map((valor, idx) => (
                      <option key={valor} value={valor}>
                        {t.tipos[idx]}
                      </option>
                    ))}
                  </select>
                </Campo>

                <Campo label={t.labels.orcamento}>
                  <select
                    className={selectClass}
                    value={orcamento}
                    onChange={(e) => setOrcamento(e.target.value)}
                  >
                    {ORCAMENTO_VALUES.map((valor, idx) => (
                      <option key={valor} value={valor}>
                        {t.orcamentos[idx]}
                      </option>
                    ))}
                  </select>
                </Campo>
              </div>

              <Campo label={t.labels.mensagem}>
                <textarea
                  className={textareaClass}
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder={t.placeholder}
                />
              </Campo>

              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={querReuniao}
                  onChange={(e) => setQuerReuniao(e.target.checked)}
                  className="size-4 rounded border-input bg-secondary/40"
                />
                {t.meeting}
              </label>

              <button className={`${btnPrimario} w-full`} disabled={aEnviar}>
                {aEnviar ? t.submitting : t.submit}
              </button>

              <p className="rounded-lg border border-border/60 bg-secondary/40 px-3 py-2.5 text-center text-xs leading-relaxed text-muted-foreground">
                {t.note}
              </p>
            </form>
          )}
        </Panel>
      </div>
    </SiteChrome>
  );
}
