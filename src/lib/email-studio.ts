/** Email HTML com CSS inline e tabelas para compatibilidade com Gmail/Outlook. */
export type ModeloComercial = "website" | "restaurante" | "modernizacao";
export type CamposEmail = {
  nomeNegocio: string;
  pessoa: string;
  detalhe: string;
  remetente: string;
  tipo: ModeloComercial;
};
export function escaparHtml(texto: string) {
  return texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
export function modeloAssunto(tipo: ModeloComercial, empresa: string) {
  const nome = empresa || "a vossa empresa";
  if (tipo === "restaurante") return `Uma solução digital para ${nome} — Nova Web Studio`;
  if (tipo === "modernizacao") return `Uma ideia para modernizar o website de ${nome}`;
  return `Uma ideia para a presença digital de ${nome} — Nova Web Studio`;
}
export function gerarEmailHtml(campos: CamposEmail) {
  const nome = escaparHtml(campos.nomeNegocio.trim() || "a vossa empresa");
  const pessoa = escaparHtml(campos.pessoa.trim() || "equipa");
  const detalhe = escaparHtml(campos.detalhe.trim());
  const assinatura = escaparHtml(campos.remetente.trim() || "Gonçalo Jorge");
  const restaurante = campos.tipo === "restaurante";
  const modernizacao = campos.tipo === "modernizacao";
  const headline = restaurante ? "O vosso restaurante, ainda mais próximo dos clientes." : modernizacao
    ? "Um website mais moderno para valorizar o vosso negócio." : "O vosso trabalho merece uma presença digital à mesma altura.";
  const texto = restaurante
    ? "Na Nova Web Studio estamos a desenvolver soluções para restaurantes: menu digital, pedidos à mesa, reservas e organização do serviço num painel intuitivo."
    : modernizacao
      ? "Podemos ajudar a atualizar o design, a experiência em telemóvel e a forma como os visitantes encontram os vossos serviços e contactos."
      : "Criamos websites à medida, rápidos, modernos e adaptados a telemóveis, para apresentar melhor os vossos serviços e facilitar os contactos.";
  const itens = restaurante
    ? ["Menu digital e QR Code", "Pedidos e gestão de mesas", "Reservas e painel de gestão", "Experiência otimizada para telemóveis"]
    : ["Design à medida do negócio", "Experiência responsiva em telemóvel", "Navegação clara e intuitiva", "SEO técnico e contactos acessíveis"];
  const url = restaurante ? "https://novawebstudio.pt/restaurantes" : "https://novawebstudio.pt/portefolio";
  const botao = restaurante ? "CONHECER A SOLUÇÃO PARA RESTAURANTES" : "CONHECER O NOSSO TRABALHO";
  return `<!DOCTYPE html><html lang="pt-PT"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Nova Web Studio</title></head>
<body style="margin:0;padding:0;background:#eef0f7;font-family:Arial,Helvetica,sans-serif;color:#1b1b34">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#eef0f7;border-collapse:collapse"><tr><td align="center" style="padding:26px 12px">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;background:#fff;border-collapse:separate;border-spacing:0;border-radius:18px;overflow:hidden">
<tr><td style="padding:30px;background:#1d1a3a;border-bottom:5px solid #985bff">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td width="66" valign="middle"><img src="https://novawebstudio.pt/nws-logo-email.png" alt="Nova Web Studio" width="54" height="54" style="display:block;border:0;border-radius:12px;object-fit:contain"></td><td valign="middle" style="font-size:18px;font-weight:800;color:#fff">NOVA WEB <span style="color:#b78aff">STUDIO</span><div style="font-size:10px;letter-spacing:2px;color:#bfc0d9;margin-top:5px;font-weight:400">WEBSITES &amp; SOLUÇÕES DIGITAIS</div></td></tr></table>
<p style="font-size:11px;font-weight:bold;letter-spacing:2px;color:#c09aff;margin:32px 0 10px">UMA PROPOSTA PARA ${nome.toUpperCase()}</p>
<h1 style="font-size:29px;line-height:1.2;color:#fff;margin:0 0 12px;font-weight:800">${headline}</h1>
<p style="font-size:14px;line-height:1.7;margin:0;color:#d4d2e4">Uma solução pensada para o vosso negócio.</p></td></tr>
<tr><td style="padding:30px 32px 10px;font-size:15px;line-height:1.75;color:#283047"><p style="margin:0 0 14px">Olá, <strong>${pessoa}</strong>!</p><p style="margin:0 0 14px">Sou o <strong>${assinatura}</strong>, da <strong>Nova Web Studio</strong>, um estúdio digital em Cascais.</p>
${detalhe ? `<p style="margin:0 0 14px">Ao conhecer a <strong>${nome}</strong>, registei esta observação: ${detalhe}. Pareceu-me fazer sentido partilhar uma ideia convosco.</p>` : `<p style="margin:0 0 14px">Gostaria de vos apresentar uma ideia que pode fazer sentido para a <strong>${nome}</strong>.</p>`}
<p style="margin:0 0 16px">${texto}</p></td></tr>
<tr><td style="padding:0 32px 26px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f2ff;border:1px solid #eadfff;border-radius:12px"><tr><td style="padding:19px 21px 9px;font-size:11px;font-weight:800;letter-spacing:1.5px;color:#493176">O QUE PODEMOS PREPARAR</td></tr><tr><td style="padding:2px 21px 20px">${itens.map((i,n)=>`<p style="font-size:14px;line-height:1.6;color:#29304a;border-bottom:1px solid #e5ddf6;padding:8px 0;margin:0"><span style="color:#8c50eb;font-weight:bold">0${n+1}</span>&nbsp; ${i}</p>`).join("")}</td></tr></table></td></tr>
<tr><td align="center" style="padding:0 32px 30px"><p style="font-size:15px;line-height:1.7;color:#283047;margin:0 0 20px">Gostavam de conhecer uma proposta mais concreta, sem compromisso?</p><table role="presentation" cellspacing="0" cellpadding="0"><tr><td bgcolor="#8651ee" style="background:#8651ee;border-radius:9px"><a href="${url}" style="display:inline-block;padding:15px 22px;color:#fff;font-weight:bold;font-size:12px;text-decoration:none">${botao} &rarr;</a></td></tr></table><p style="font-size:12px;color:#74758d;margin:16px 0 0">Podem também responder diretamente a este email.</p></td></tr>
<tr><td style="padding:22px 32px;background:#faf9fd;border-top:1px solid #eceaf1"><strong style="font-size:14px;color:#23223a">${assinatura}</strong><p style="font-size:12px;margin:5px 0;color:#73758d">Nova Web Studio · Cascais, Portugal</p><a href="mailto:goncalojorge@novawebstudio.pt" style="font-size:12px;color:#7446bf;text-decoration:none">goncalojorge@novawebstudio.pt</a><p style="margin:8px 0 0"><a href="https://novawebstudio.pt" style="font-size:12px;color:#7446bf;text-decoration:none">novawebstudio.pt</a></p></td></tr></table></td></tr></table></body></html>`;
}
