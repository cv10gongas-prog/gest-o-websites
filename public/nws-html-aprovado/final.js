(()=>{
  const data={
    website:{type:'Website institucional',label:'01 / WEBSITES',title:'A tua marca merece um website com identidade.',description:'Páginas institucionais e de serviços onde a apresentação, a navegação e o contacto estão alinhados com o teu negócio.',features:['Estrutura e design personalizados','Adaptação a vários ecrãs','Conteúdo e chamadas à ação claras'],img:null,art:'website',project:'Ver portefólio',href:'trabalhos.html',cta:'Pedir website'},
    loja:{type:'Loja online',label:'02 / LOJAS ONLINE',title:'Produtos com a apresentação que merecem.',description:'Uma experiência de compra onde é fácil explorar produtos, perceber opções e avançar com confiança.',features:['Apresentação de catálogo','Experiência de produto cuidada','Percursos simples até ao pedido'],img:'assets/vinilart-sport-preview.webp',alt:'Captura real do website VinilArt Sport',project:'VinilArt Sport',href:'projetos/vinilart-sport.html',cta:'Quero uma loja'},
    webapp:{type:'Solução web específica',label:'03 / SOLUÇÕES WEB',title:'Quando um website não chega, criamos uma solução.',description:'Ferramentas que ajudam a organizar tarefas, gerir informação e simplificar a experiência dos clientes.',features:['Funcionalidades adaptadas','Interfaces claras e organizadas','Fluxos para necessidades reais'],img:null,project:'NWS Restaurantes',href:'restaurantes.html',cta:'Apresentar a minha ideia'},
    renovacao:{type:'Modernizar o meu site',label:'04 / MODERNIZAÇÃO',title:'Uma nova vida para a tua presença digital.',description:'Repensamos websites que já existem e ajustamos a apresentação, estrutura e navegação sem apagar a identidade do negócio.',features:['Revisão da experiência atual','Nova organização e visual','Melhor apresentação nos ecrãs'],img:null,art:'renovacao',project:'Ver portefólio',href:'trabalhos.html',cta:'Modernizar o meu site'}
  };
  const target=document.querySelector('#final-service-panel');
  const tabs=[...document.querySelectorAll('[data-final-tab]')];
  function render(k){
    if(!target || !data[k]) return;
    const d=data[k];
    for (const tab of tabs) {
      const active=tab.dataset.finalTab===k;
      tab.classList.toggle('active',active);
      tab.setAttribute('aria-selected',String(active));
      tab.tabIndex=active?0:-1;
    }
    const visual = d.img
      ? `<a href="${d.href}" class="final-service-photo"><img src="${d.img}" alt="${d.alt}" loading="lazy"><span>EXEMPLO REAL <strong>${d.project} ↗</strong></span></a>`
      : d.art
        ? `<a href="${d.href}" class="nws-abstract-service" aria-label="Explorar os nossos serviços e projetos"><span class="nws-art-label">NOVA WEB STUDIO / ${d.type.toUpperCase()}</span><div class="nws-art-window"><div class="nws-art-top"><i></i><i></i><i></i><span>Design com intenção</span></div><div class="nws-art-body"><b>${d.art==='website'?'A tua empresa,':'O teu website,'}<br><em>${d.art==='website'?'bem apresentada.':'com nova vida.'}</em></b><div class="nws-art-lines"><span></span><span></span><span></span></div><span class="nws-art-cta">${d.art==='website'?'SERVIÇOS · PROJETOS · CONTACTOS':'ESTRUTURA · VISUAL · NAVEGAÇÃO'}</span></div></div><span class="nws-art-foot">CONHECER O PORTFÓLIO <b>↗</b></span></a>`
        : '<a href="restaurantes.html" class="final-system-photo" aria-label="Explorar NWS Restaurantes"><span class="final-sys-mark">✳ NWS / RESTAURANTES</span><strong>Mais do que<br>um website<span>.</span></strong><div><b>MESAS</b><b>RESERVAS</b><b>MENU</b><b>COZINHA</b></div><small>VER A SOLUÇÃO DIGITAL ↗</small></a>';
    target.setAttribute('aria-label',d.label);
    target.innerHTML=`<div class="final-service-preview-visual">${visual}</div><div class="final-service-detail"><span class="v3-kicker">${d.label}</span><h3>${d.title}</h3><p>${d.description}</p><ul>${d.features.map(f=>`<li>${f}</li>`).join('')}</ul><div class="final-service-actions"><a class="final-btn final-btn-primary" href="contacto.html?tipo=${encodeURIComponent(d.type)}">${d.cta} ↗</a><a class="final-case-link" href="${d.href}">${d.project} ↗</a></div></div>`;
  }
  for(let i=0;i<tabs.length;i++){
    const tab=tabs[i];
    tab.addEventListener('click',()=>render(tab.dataset.finalTab));
    tab.addEventListener('keydown',e=>{
      if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;
      e.preventDefault();
      const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
      tabs[next].focus();render(tabs[next].dataset.finalTab);
    });
  }
  const back=document.querySelector('.final-backtotop');
  if(back){
    const update=()=>back.classList.toggle('is-shown',window.scrollY>620);
    window.addEventListener('scroll',update,{passive:true});update();
  }
  const nav=document.querySelector('[data-menu]');
  const toggle=document.querySelector('[data-menu-toggle]');
  if(nav&&toggle){
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'&&nav.classList.contains('open')){nav.classList.remove('open');document.body.classList.remove('menu-open');toggle.setAttribute('aria-expanded','false');toggle.textContent='☰';toggle.focus();}
    });
  }
})();
