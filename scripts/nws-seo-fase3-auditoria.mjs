/** Audita se a fase 3 ficou estruturalmente completa sem tocar no CRM. */
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const pages={
  "index.html": "/",
  "trabalhos.html": "/portefolio",
  "servicos.html": "/servicos",
  "restaurantes.html": "/restaurantes",
  "sobre.html": "/sobre",
  "projetos/vinilart.html": "/projetos/vinilart",
  "projetos/vinilart-sport.html": "/projetos/vinilart-sport",
  "projetos/gespool.html": "/projetos/gespool",
  "projetos/31-janeiro.html": "/projetos/31-janeiro",
  "projetos/radio-alcabideche.html": "/projetos/radio-alcabideche"
};
const site="https://www.novawebstudio.pt";
const routes=JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8')).rewrites;
if(routes.length!==Object.keys(pages).length)throw new Error('Numero inesperado de rewrites');
for(const [f,p] of Object.entries(pages)){
 const r=routes.find(x=>x.source===p);
 if(!r||r.destination!='/nws-html-aprovado/'+f)throw new Error('Rewrite incorreto: '+p);
 const s=fs.readFileSync(path.join(root,'public/nws-html-aprovado',f),'utf8');
 if(!s.includes('<base href="/nws-html-aprovado/')||!s.includes('/nws-html-aprovado/rotas-publicas.js'))throw new Error('Base ou navegacao ausente: '+f);
 if(!s.includes('rel="canonical"')||!s.includes('href="'+site+p+'"'))throw new Error('Canonical incorreto: '+f);
 if(!/<body[^>]*class=["'][^"']*nws-v3/i.test(s))throw new Error('Body aprovado em falta: '+f);
 if(!/<main(?:\s|>)/i.test(s))throw new Error('Main visivel em falta: '+f);
}
if(routes.some(x=>x.source==='/contacto'))throw new Error('Contacto nao pode ser reescrito');
const contact=fs.readFileSync(path.join(root,'public/nws-html-aprovado/contacto.html'),'utf8');
if(contact.includes('rotas-publicas.js')||/<base\s/i.test(contact))throw new Error('Formulario alterado indevidamente');
console.log('SEO FASE 3 OK | '+routes.length+' paginas HTML nativas | contacto no React | design original preservado');
