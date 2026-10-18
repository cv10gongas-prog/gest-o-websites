/* Nova Web Studio — retoques visuais: ícones vetoriais, acesso à equipa e voltar ao topo.
   Não modifica os formulários nem o controlo de consentimento. */
(()=>{
 'use strict';
 if(window.__nwsPolimentoFinal2026) return;
 window.__nwsPolimentoFinal2026=true;
 const languages=['pt','en','es','fr','de'];
 let stored='pt';try{stored=localStorage.getItem('nws-lang')||'pt'}catch(_e){}
 const selected=new URLSearchParams(location.search).get('lang');
 const fromHtml=(document.documentElement.lang||'pt').slice(0,2);
 const locale=languages.includes(selected)?selected:(languages.includes(fromHtml)&&fromHtml!=='pt'?fromHtml:(languages.includes(stored)?stored:'pt'));
 const labels={
  pt:{team:'Equipa',preferences:'Preferências de cookies',privacy:'Privacidade',terms:'Termos',top:'Voltar ao topo',rights:'Todos os direitos reservados.'},
  en:{team:'Team',preferences:'Cookie preferences',privacy:'Privacy',terms:'Terms',top:'Back to top',rights:'All rights reserved.'},
  es:{team:'Equipo',preferences:'Preferencias de cookies',privacy:'Privacidad',terms:'Términos',top:'Volver arriba',rights:'Todos los derechos reservados.'},
  fr:{team:'Équipe',preferences:'Préférences de cookies',privacy:'Confidentialité',terms:'Conditions',top:'Retour en haut',rights:'Tous droits réservés.'},
  de:{team:'Team',preferences:'Cookie-Einstellungen',privacy:'Datenschutz',terms:'Bedingungen',top:'Zurück nach oben',rights:'Alle Rechte vorbehalten.'}
 };
 const l=labels[locale];
 const css=`
  .nws-team-entry{display:inline-flex;align-items:center;justify-content:center;min-height:38px;margin-left:3px;padding:2px 5px;text-decoration:none!important;font:500 10px/1.25 'DM Sans',Arial,sans-serif!important;letter-spacing:.04em;color:#8992ae!important;opacity:.58;transition:opacity .15s,color .15s}
  .nws-team-entry:hover,.nws-team-entry:focus-visible{opacity:1;color:#b6eafa!important;text-decoration:underline!important}
  .nws-ui-symbol{display:inline-block;vertical-align:-.145em;width:1em;height:1em;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex:none;overflow:visible}
  .nws-ui-symbol.nws-symbol-star{stroke-width:1.65}
  .final-backtotop .nws-ui-symbol{width:1em;height:1em}
  .hamburger .nws-ui-symbol{width:1.15em;height:1.15em;vertical-align:-.18em}
  @media(max-width:720px){.nws-team-entry{min-height:44px;padding:4px 9px}.nws-ui-symbol{vertical-align:-.13em}}
 `;
 if(!document.getElementById('nws-polimento-final-style')){const style=document.createElement('style');style.id='nws-polimento-final-style';style.textContent=css;document.head.appendChild(style)}
 // O sítio continua discreto; o link pode ser aberto normalmente com o dedo ou o teclado.
 const footer=document.querySelector('footer .copyright .nws-legal-links');
 if(footer){
   for(const [key,sel] of [['privacy','a[href^="/privacidade"]'],['terms','a[href^="/termos"]'],['preferences','[data-nws-cookies-open]']]){
     const el=footer.querySelector(sel);if(el)el.textContent=l[key];
   }
   for(const link of footer.querySelectorAll('a[href^="/privacidade"],a[href^="/cookies"],a[href^="/termos"]')){
     if(locale!=='pt'){try{const u=new URL(link.href,location.href);u.searchParams.set('lang',locale);link.href=u.pathname+u.search}catch(_e){}}
   }
   if(!footer.querySelector('.nws-team-entry')){
     const a=document.createElement('a');a.href='/hub';a.className='nws-team-entry';a.textContent=l.team;
     a.setAttribute('aria-label',l.team+' — Nova Web Studio');footer.appendChild(a);
   }
 }
 const rights=document.querySelector('footer .copyright > span:first-child');
 if(rights && locale!=='pt')rights.textContent=rights.textContent.replace('Todos os direitos reservados.',l.rights);
 const paths={
  '↗':'<path d="M7 17 17 7M8 7h9v9"/>',
  '↖':'<path d="M17 17 7 7M7 16V7h9"/>',
  '↘':'<path d="M7 7 17 17M8 17h9V8"/>',
  '↙':'<path d="M17 7 7 17M7 8v9h9"/>',
  '→':'<path d="M4 12h16m-7-7 7 7-7 7"/>',
  '←':'<path d="M20 12H4m7-7-7 7 7 7"/>',
  '↑':'<path d="M12 20V4m-7 7 7-7 7 7"/>',
  '↓':'<path d="M12 4v16m-7-7 7 7 7-7"/>',
  '☰':'<path d="M4 6h16M4 12h16M4 18h16"/>',
  '✳':'<path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07"/>',
  '✓':'<path d="m4 12 5 5L20 6"/>',
  '◎':'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>',
  '⌁':'<path d="M3 14c3-7 6 7 9 0s6 7 9 0"/>'
 };
 const matcher=/[↗↖↘↙→←↑↓☰✳✓◎⌁]/g;
 const SVG_NS='http://www.w3.org/2000/svg';
 function makeIcon(char){
   const svg=document.createElementNS(SVG_NS,'svg');
   svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('class','nws-ui-symbol'+(char==='✳'?' nws-symbol-star':''));
   svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
   svg.innerHTML=paths[char];return svg;
 }
 function processText(node){
   if(node.nodeType!==Node.TEXT_NODE||!matcher.test(node.nodeValue||'')){matcher.lastIndex=0;return;}
   matcher.lastIndex=0;
   const parent=node.parentElement;
   if(!parent||parent.closest('script,style,textarea,code,pre,[contenteditable],svg'))return;
   const src=node.nodeValue;const frag=document.createDocumentFragment();let last=0;
   for(const m of src.matchAll(matcher)){
     if(m.index>last)frag.append(document.createTextNode(src.slice(last,m.index)));
     frag.append(makeIcon(m[0]));last=m.index+m[0].length;
   }
   if(last<src.length)frag.append(document.createTextNode(src.slice(last)));
   node.replaceWith(frag);
 }
 function scan(root){
   if(root.nodeType===Node.TEXT_NODE){processText(root);return;}
   if(root.nodeType!==Node.ELEMENT_NODE&&root.nodeType!==Node.DOCUMENT_NODE)return;
   if(root.nodeType===Node.ELEMENT_NODE&&root.matches('script,style,textarea,code,pre,svg,[contenteditable]'))return;
   const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const list=[];let n;
   while(n=walker.nextNode())if(n.nodeValue&&/[↗↖↘↙→←↑↓☰✳✓◎⌁]/.test(n.nodeValue))list.push(n);
   for(const node of list)processText(node);
 }
 scan(document.body);
 const observer=new MutationObserver(changes=>{
   for(const change of changes){
     if(change.type==='characterData')scan(change.target);
     else for(const item of change.addedNodes)scan(item);
   }
 });
 observer.observe(document.body,{subtree:true,childList:true,characterData:true});
 const back=document.querySelector('a.final-backtotop');
 if(back){
   back.setAttribute('aria-label',l.top);back.setAttribute('title',l.top);
   back.addEventListener('click',event=>{
     event.preventDefault();
     const smooth=!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
     window.scrollTo({top:0,left:0,behavior:smooth?'smooth':'instant'});
     if(window.parent!==window)window.parent.postMessage({nwsBridge:true,type:'scroll-top'},location.origin);
   });
 }
})();
