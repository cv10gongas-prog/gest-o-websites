import { createFileRoute } from "@tanstack/react-router";
import { Copy, Mail, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Campo, Panel, Vazio } from "@/components/crm/Bits";
import {
  btnPequeno,
  btnPrimario,
  btnSecundario,
  inputClass,
  selectClass,
  textareaClass,
} from "@/components/crm/Modal";
import { preencherModelo } from "@/lib/crm";
import { useBusinesses, useEmailTemplates, useGuardarModelo, useProfiles } from "@/lib/queries";
import { useUtilizador } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/emails")({
  head: () => ({
    meta: [
      { title: "Modelos de email — Orbit CRM" },
      { name: "description", content: "Modelos de email prontos a personalizar para cada projeto." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Emails,
});

function Emails() {
  const { data: modelos = [] } = useEmailTemplates();
  const { data: negocios = [] } = useBusinesses();
  const { perfil } = useUtilizador();
  const guardar = useGuardarModelo();

  const [modeloId, setModeloId] = useState("");
  const [negocioId, setNegocioId] = useState("");
  const [nome, setNome] = useState("");
  const [assunto, setAssunto] = useState("");
  const [corpo, setCorpo] = useState("");

  const modelo = modelos.find((m) => m.id === modeloId);
  const negocio = negocios.find((n) => n.id === negocioId);

  useEffect(() => {
    if (!modeloId && modelos[0]) setModeloId(modelos[0].id);
  }, [modelos, modeloId]);

  useEffect(() => {
    if (modelo) {
      setNome(modelo.nome);
      setAssunto(modelo.assunto);
      setCorpo(modelo.corpo);
    }
  }, [modelo?.id]);

  const variaveis = {
    nome_negocio: negocio?.nome ?? "{{nome_negocio}}",
    categoria: negocio?.categoria ?? "{{categoria}}",
    localidade: negocio?.localidade ?? "{{localidade}}",
    pessoa: negocio?.pessoa_contacto ?? "{{pessoa}}",
    remetente: perfil?.nome ?? "{{remetente}}",
    website: negocio?.website_dominio ?? "{{website}}",
  };

  const assuntoFinal = preencherModelo(assunto, variaveis);
  const corpoFinal = preencherModelo(corpo, variaveis);

  async function copiar(texto: string, rotulo: string) {
    await navigator.clipboard.writeText(texto);
    toast.success(`${rotulo} copiado.`);
  }

  function abrirNoEmail() {
    const destino = negocio?.email ?? "";
    window.location.href = `mailto:${destino}?subject=${encodeURIComponent(assuntoFinal)}&body=${encodeURIComponent(corpoFinal)}`;
  }

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Modelos de email</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Escolhe um modelo, associa um projeto e as variáveis são preenchidas automaticamente.
        </p>
      </div>

      {modelos.length === 0 ? (
        <Vazio texto="Ainda não há modelos." />
      ) : (
        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          <Panel title="Editar modelo">
            <div className="grid gap-4">
              <Campo label="Modelo">
                <select
                  className={selectClass}
                  value={modeloId}
                  onChange={(e) => setModeloId(e.target.value)}
                >
                  {modelos.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="Nome do modelo">
                <input className={inputClass} value={nome} onChange={(e) => setNome(e.target.value)} />
              </Campo>
              <Campo label="Assunto">
                <input
                  className={inputClass}
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value)}
                />
              </Campo>
              <Campo label="Corpo">
                <textarea
                  className={`${textareaClass} min-h-[240px]`}
                  value={corpo}
                  onChange={(e) => setCorpo(e.target.value)}
                />
              </Campo>
              <p className="text-[11px] text-muted-foreground">
                Variáveis disponíveis: {"{{nome_negocio}}"}, {"{{categoria}}"}, {"{{localidade}}"},{" "}
                {"{{pessoa}}"}, {"{{website}}"}, {"{{remetente}}"}
              </p>
              <button
                className={btnPrimario}
                disabled={!modeloId || guardar.isPending}
                onClick={() => guardar.mutate({ id: modeloId, nome, assunto, corpo })}
              >
                <Save className="size-4" /> Guardar modelo
              </button>
            </div>
          </Panel>

          <Panel
            title="Pré-visualização"
            subtitle="Com os dados do projeto selecionado"
            actions={
              <button className={btnPequeno} onClick={() => copiar(corpoFinal, "Corpo")}>
                <Copy className="size-3.5" /> Copiar
              </button>
            }
          >
            <Campo label="Projeto">
              <select
                className={selectClass}
                value={negocioId}
                onChange={(e) => setNegocioId(e.target.value)}
              >
                <option value="">Sem projeto (mostra as variáveis)</option>
                {negocios.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.nome}
                  </option>
                ))}
              </select>
            </Campo>

            <div className="mt-4 rounded-xl border border-border/60 bg-secondary/25 p-4">
              <p className="text-[10px] uppercase tracking-[.15em] text-muted-foreground">Assunto</p>
              <p className="mt-1 text-sm font-medium">{assuntoFinal}</p>
              <hr className="my-3 border-border/60" />
              <p className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
                {corpoFinal}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button className={btnPrimario} onClick={abrirNoEmail}>
                <Mail className="size-4" /> Abrir no email
              </button>
              <button className={btnSecundario} onClick={() => copiar(assuntoFinal, "Assunto")}>
                <Copy className="size-4" /> Copiar assunto
              </button>
            </div>
          </Panel>
        </div>
      )}
    </>
  );
}
