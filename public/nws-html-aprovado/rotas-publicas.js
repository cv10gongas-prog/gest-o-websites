/* Nova Web Studio: navegacao para URLs publicas nas paginas HTML nativas.
 * Nao interfere com a ponte React/CRM do formulario (iframe). */
(()=>{
 'use strict';
 if(window.parent!==window)return;
 const prefix='/nws-html-aprovado/';
 const paths={"index.html":"/","trabalhos.html":"/portefolio","servicos.html":"/servicos","restaurantes.html":"/restaurantes","sobre.html":"/sobre","projetos/vinilart.html":"/projetos/vinilart","projetos/vinilart-sport.html":"/projetos/vinilart-sport","projetos/gespool.html":"/projetos/gespool","projetos/31-janeiro.html":"/projetos/31-janeiro","projetos/radio-alcabideche.html":"/projetos/radio-alcabideche","contacto.html":"/contacto"};
 document.addEventListener('click',event=>{
   const a=event.target?.closest?.('a[href]');
   if(!a||event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||a.hasAttribute('download')||a.target==='_blank')return;
   if(a.classList.contains('final-backtotop'))return;
   const href=a.getAttribute('href')||'';
   if(!href||href.startsWith('mailto:')||href.startsWith('tel:'))return;
   if(href.startsWith('#')){const id=decodeURIComponent(href.slice(1));const el=document.getElementById(id);if(el){event.preventDefault();location.hash=id;el.scrollIntoView();}return;}
   let resolved;try{resolved=new URL(href,document.baseURI)}catch{return;}
   if(resolved.origin!==location.origin||!resolved.pathname.startsWith(prefix))return;
   const slug=decodeURIComponent(resolved.pathname.slice(prefix.length));
   const target=paths[slug];if(!target)return;
   event.preventDefault();
   location.assign(target+resolved.search+resolved.hash);
 },true);
})();
