(()=>{
  'use strict';
  const prefix='/nws-html-aprovado/';
  const routeMap={
    'index.html':'/', 'trabalhos.html':'/portefolio', 'servicos.html':'/servicos',
    'restaurantes.html':'/restaurantes','sobre.html':'/sobre','contacto.html':'/contacto',
    'projetos/vinilart.html':'/projetos/vinilart',
    'projetos/vinilart-sport.html':'/projetos/vinilart-sport',
    'projetos/gespool.html':'/projetos/gespool',
    'projetos/31-janeiro.html':'/projetos/31-janeiro',
    'projetos/radio-alcabideche.html':'/projetos/radio-alcabideche'
  };
  // O HTML conserva os estilos e scripts originais: esta ponte só comunica com a rota React.
  if(window.parent===window) return;
  const send=(data)=>window.parent.postMessage(Object.assign({nwsBridge:true},data),window.location.origin);
  document.addEventListener('click',(event)=>{
    const anchor=event.target.closest?.('a[href]');
    if(!anchor || event.defaultPrevented || event.button!==0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const raw=anchor.getAttribute('href')||'';
    if(!raw||raw.startsWith('#')||raw.startsWith('mailto:')||raw.startsWith('tel:')) return;
    let url;try{url=new URL(raw,location.href);}catch{return;}
    if(url.origin!==location.origin){anchor.target='_blank';anchor.rel='noopener noreferrer';return;}
    if(!url.pathname.startsWith(prefix))return;
    const file=decodeURIComponent(url.pathname.slice(prefix.length));
    const to=routeMap[file];if(!to)return;
    event.preventDefault();
    send({type:'navigate',path:to+url.search+url.hash});
  },true);
  // O formulário original era apenas demonstrativo (mailto); no localhost usa o serviço real da NWS.
  document.addEventListener('submit',event=>{
    const form=event.target;
    if(!form||form.id!=='lead-form')return;
    event.preventDefault();event.stopImmediatePropagation();
    if(form.dataset.sending==='true')return;
    const data=new FormData(form);
    const record={};for(const key of ['nome','email','empresa','tipo','prazo','objetivo','mensagem'])record[key]=String(data.get(key)||'').trim();
    const err=form.querySelector('.formerror');
    if(record.nome.length<2 || !/^\S+@\S+\.\S+$/.test(record.email) || record.mensagem.length<10){
      if(err)err.textContent='Preenche o nome, um email válido e uma mensagem com pelo menos 10 caracteres.';
      return;
    }
    if(err)err.textContent='';
    form.dataset.sending='true';
    const button=form.querySelector('button[type="submit"]');
    if(button){button.dataset.original=button.innerHTML;button.disabled=true;button.textContent='A enviar…';}
    send({type:'contact',record});
  },true);
  window.addEventListener('message',(e)=>{
    if(e.origin!==window.location.origin||e.source!==window.parent||!e.data?.nwsBridge||e.data.type!=='contact-result')return;
    const form=document.getElementById('lead-form');if(!form)return;
    form.dataset.sending='false';
    const button=form.querySelector('button[type="submit"]');
    if(button){button.disabled=false;button.innerHTML=button.dataset.original||button.innerHTML;}
    const err=form.querySelector('.formerror');const status=form.querySelector('.status');
    if(e.data.ok){if(err)err.textContent='';if(status){status.classList.add('show');status.textContent='Pedido enviado com sucesso. Vamos entrar em contacto contigo.';}form.reset();}
    else {if(err)err.textContent='O pedido não foi enviado. Tenta novamente ou escreve para geral@novawebstudio.pt.';if(status){status.classList.remove('show');status.textContent='';}}
  });
  // Mantém o parâmetro do serviço escolhido nos pedidos de proposta.
  const tipo=new URLSearchParams(location.search).get('tipo');
  if(tipo){const select=document.querySelector('#lead-form select[name="tipo"]');if(select){const option=[...select.options].find(x=>x.value===tipo || x.textContent.trim()===tipo);if(option)select.value=option.value;}}
})();
