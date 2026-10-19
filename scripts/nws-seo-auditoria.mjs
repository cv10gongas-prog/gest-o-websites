// Auditoria local de SEO da Nova Web Studio - sem acessos a contas, sem escritas.
import fs from 'node:fs';
const base = 'https://www.novawebstudio.pt';
const siteRoutes = new Map([
  ['index.html', '/'], ['trabalhos.html', '/portefolio'],
  ['servicos.html', '/servicos'], ['sobre.html', '/sobre'],
  ['contacto.html', '/contacto'], ['restaurantes.html', '/restaurantes'],
  ['projetos/vinilart.html','/projetos/vinilart'],
  ['projetos/vinilart-sport.html','/projetos/vinilart-sport'],
  ['projetos/gespool.html','/projetos/gespool'],
  ['projetos/31-janeiro.html','/projetos/31-janeiro'],
  ['projetos/radio-alcabideche.html','/projetos/radio-alcabideche'],
]);
const fail = [];
function check(ok, what) { if (!ok) fail.push(what); }
const sitemap = fs.readFileSync('public/sitemap.xml','utf8');
const canonicalUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
check(canonicalUrls.length >= 27, `O sitemap tem apenas ${canonicalUrls.length} URLs`);
check(new Set(canonicalUrls).size === canonicalUrls.length, 'Sitemap inclui URLs duplicados');
for(const [file,route] of siteRoutes) {
  const html = fs.readFileSync('public/nws-html-aprovado/'+file, 'utf8');
  const rel = [...html.matchAll(/<link\s+rel="canonical"\s+href="([^"]+)"/gi)].map(m=>m[1]);
  check(rel.length===1 && rel[0] === base + route, `${file}: canonical em falta, incorreto ou duplicado`);
  check(canonicalUrls.includes(base+route), `${route}: ausente no sitemap`);
}
const root = fs.readFileSync('src/routes/__root.tsx','utf8');
check(root.includes('<html lang={language}'), 'Idioma do documento principal nao dinamico');
const schema = fs.readFileSync('src/lib/schema.ts','utf8');
check(schema.includes('"@type": "Country", name: "Portugal"'), 'Schema sem Portugal');
const head = fs.readFileSync('src/routes/index.tsx','utf8');
check(head.includes('localBusinessSchema("pt")'), 'Faltam dados estruturados na Home portuguesa');
for (const rel of ['src/lib/contact.functions.ts','src/components/site/nws-html-aprovado/NwsHtmlAprovado.tsx']) check(fs.existsSync(rel), 'Ficheiro protegido em falta: '+rel);
if(fail.length) { console.error('AUDITORIA FALHOU:\n'+fail.map(x=>' - '+x).join('\n')); process.exitCode=1; }
else console.log(`AUDITORIA SEO OK | ${canonicalUrls.length} URLs no sitemap | ${siteRoutes.size} canonicals corretos | idioma e dados estruturados OK`);
