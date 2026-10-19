/* Nova Web Studio — Formulario completo com campos do site original.
 * O envio ocorre no servidor React existente, nunca num mailto. */
(function () {
  'use strict';
  if (!document.body.classList.contains('is-contacto')) return;
  if (window.__nwsContactOriginalV2) return;
  window.__nwsContactOriginalV2 = true;

  const languages = ['pt','en','es','fr','de'];
  const query = new URLSearchParams(location.search);
  let stored = 'pt';
  try { stored = localStorage.getItem('nws-lang') || 'pt'; } catch (_) {}
  const candidate = query.get('lang') || stored;
  const locale = languages.includes(candidate) ? candidate : 'pt';
  const labels = {
    pt:{data:'01 / OS TEUS DADOS',project:'02 / SOBRE O PROJETO',name:'Nome',business:'Empresa',email:'Email',phone:'Telefone',kind:'Tipo de projeto',budget:'Orçamento previsto',site:'Website atual',time:'Prazo desejado',message:'Mensagem',meet:'Quero marcar uma reunião de apresentação',choose:'Selecionar',optional:'Opcional',send:'Enviar pedido',sending:'A enviar…',success:'Pedido registado com sucesso. Entraremos em contacto contigo.',fail:'Não foi possível registar o pedido. Tenta novamente ou envia-nos um email.',required:'Preenche o nome e um email válido.',security:'Os teus dados são usados apenas para responder ao teu pedido.',note:'O pedido é registado no nosso sistema. Não precisas de abrir o programa de email.',hp:'Não preencher',description:'Conta-nos o que queres criar, melhorar ou modernizar.',fullName:'Como te chamas?',companyName:'Nome da empresa (se aplicável)',website:'https://oteusite.pt',phoneExample:'+351 ...',types:['Solução para Restaurantes','Website institucional','Loja online','Landing page','Aplicação web','Modernização de website','Outro'],budgets:['Até 150 €','150 € – 250 €','250 € – 400 €','Mais de 400 €'],deadlines:['Sem data definida','1 semana','2 semanas','Entre 3 e 4 semanas','2 a 3 meses']},
    en:{data:'01 / YOUR DETAILS',project:'02 / ABOUT THE PROJECT',name:'Name',business:'Company',email:'Email',phone:'Phone',kind:'Project type',budget:'Estimated budget',site:'Current website',time:'Preferred timeline',message:'Message',meet:'I would like to schedule an introductory meeting',choose:'Select',optional:'Optional',send:'Send enquiry',sending:'Sending…',success:'Your request was recorded. We will get back to you.',fail:'We could not register your request. Please try again or email us.',required:'Enter your name and a valid email.',security:'Your information is only used to respond to your enquiry.',note:'Your request is registered in our system. You do not need to open an email app.',hp:'Leave blank',description:'Tell us what you want to build, improve or modernise.',fullName:'Your name',companyName:'Company name (if applicable)',website:'https://yourwebsite.com',phoneExample:'+351 ...',types:['Restaurant solution','Business website','Online store','Landing page','Web application','Website redesign','Other'],budgets:['Up to €150','€150 – €250','€250 – €400','More than €400'],deadlines:['No deadline yet','1 week','2 weeks','3 to 4 weeks','2 to 3 months']},
    es:{data:'01 / TUS DATOS',project:'02 / SOBRE EL PROYECTO',name:'Nombre',business:'Empresa',email:'Email',phone:'Teléfono',kind:'Tipo de proyecto',budget:'Presupuesto estimado',site:'Web actual',time:'Plazo deseado',message:'Mensaje',meet:'Quiero concertar una reunión de presentación',choose:'Seleccionar',optional:'Opcional',send:'Enviar solicitud',sending:'Enviando…',success:'Solicitud registrada. Nos pondremos en contacto contigo.',fail:'No se pudo registrar la solicitud. Inténtalo de nuevo o envíanos un email.',required:'Indica tu nombre y un email válido.',security:'Tus datos solo se utilizan para responder a tu solicitud.',note:'Tu solicitud se registra en nuestro sistema, sin abrir el correo.',hp:'No rellenar',description:'Cuéntanos qué quieres crear o mejorar.',fullName:'¿Cómo te llamas?',companyName:'Nombre de la empresa (si aplica)',website:'https://tusitio.com',phoneExample:'+34 ...',types:['Solución para restaurantes','Web corporativa','Tienda online','Landing page','Aplicación web','Modernización de web','Otro'],budgets:['Hasta 150 €','150 € – 250 €','250 € – 400 €','Más de 400 €'],deadlines:['Sin fecha definida','1 semana','2 semanas','Entre 3 y 4 semanas','2 a 3 meses']},
    fr:{data:'01 / VOS COORDONNÉES',project:'02 / VOTRE PROJET',name:'Nom',business:'Entreprise',email:'Email',phone:'Téléphone',kind:'Type de projet',budget:'Budget estimé',site:'Site actuel',time:'Délai souhaité',message:'Message',meet:'Je souhaite organiser une réunion de présentation',choose:'Choisir',optional:'Facultatif',send:'Envoyer la demande',sending:'Envoi en cours…',success:'Votre demande est enregistrée. Nous vous recontacterons.',fail:'Impossible d’enregistrer la demande. Réessayez ou écrivez-nous.',required:'Indiquez votre nom et un email valide.',security:'Vos données servent uniquement à répondre à votre demande.',note:'Votre demande est enregistrée dans notre système, sans ouvrir votre messagerie.',hp:'Ne pas remplir',description:'Expliquez-nous ce que vous souhaitez créer ou améliorer.',fullName:'Votre nom',companyName:'Nom de l’entreprise (facultatif)',website:'https://votresite.fr',phoneExample:'+33 ...',types:['Solution pour restaurants','Site vitrine','Boutique en ligne','Page de destination','Application web','Modernisation de site','Autre'],budgets:['Jusqu’à 150 €','150 € – 250 €','250 € – 400 €','Plus de 400 €'],deadlines:['Sans date définie','1 semaine','2 semaines','3 à 4 semaines','2 à 3 mois']},
    de:{data:'01 / IHRE KONTAKTDATEN',project:'02 / ZUM PROJEKT',name:'Name',business:'Unternehmen',email:'E-Mail',phone:'Telefon',kind:'Projektart',budget:'Geplantes Budget',site:'Aktuelle Website',time:'Gewünschter Zeitraum',message:'Nachricht',meet:'Ich möchte ein unverbindliches Gespräch vereinbaren',choose:'Auswählen',optional:'Optional',send:'Anfrage senden',sending:'Wird gesendet…',success:'Ihre Anfrage wurde gespeichert. Wir melden uns.',fail:'Die Anfrage konnte nicht gespeichert werden. Bitte erneut versuchen oder mailen.',required:'Bitte Namen und gültige E-Mail angeben.',security:'Ihre Angaben werden nur zur Bearbeitung Ihrer Anfrage genutzt.',note:'Ihre Anfrage wird in unserem System gespeichert, ohne E-Mail-Programm.',hp:'Nicht ausfüllen',description:'Beschreiben Sie, was Sie erstellen oder verbessern möchten.',fullName:'Wie heißen Sie?',companyName:'Unternehmensname (falls vorhanden)',website:'https://ihrewebsite.de',phoneExample:'+49 ...',types:['Restaurantlösung','Unternehmenswebsite','Onlineshop','Landingpage','Webanwendung','Website-Modernisierung','Sonstiges'],budgets:['Bis 150 €','150 € – 250 €','250 € – 400 €','Mehr als 400 €'],deadlines:['Noch kein Termin','1 Woche','2 Wochen','3 bis 4 Wochen','2 bis 3 Monate']}
  };
  const t = labels[locale];
  const panel = document.querySelector('.contactpage .contact-form');
  if (!panel) return;
  const escapeText = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const field = (name, label, type, placeholder, opts = {}) => `<label class="nws-c-field${opts.wide?' is-wide':''}"><span class="nws-c-label">${escapeText(label)} ${opts.required?'<b aria-hidden="true">*</b>':''}</span><input name="${name}" type="${type}" ${opts.required?'required':''} ${opts.maxlength?'maxlength="'+opts.maxlength+'"':''} autocomplete="${opts.autocomplete || 'off'}" placeholder="${escapeText(placeholder||'')}" /></label>`;
  const select = (name, label, options, defaultValue='0', wide=false) => `<div class="nws-c-field${wide?' is-wide':''}"><span class="nws-c-label" id="label-${name}">${escapeText(label)}</span><div class="nws-choice" data-select="${name}"><input type="hidden" name="${name}" value="${escapeText(defaultValue)}"><button type="button" class="nws-choice-trigger" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="label-${name} btn-${name}" id="btn-${name}"><span class="nws-choice-value">${escapeText(options.find(o=>o[0]===defaultValue)?.[1]||t.choose)}</span><span class="nws-choice-chevron" aria-hidden="true">⌄</span></button><div class="nws-choice-pop" role="listbox" aria-label="${escapeText(label)}" hidden>${options.map(([v,display])=>`<button type="button" role="option" aria-selected="${v===defaultValue?'true':'false'}" data-value="${escapeText(v)}" class="nws-choice-option"><span>${escapeText(display)}</span><span class="nws-choice-check">${v===defaultValue?'✓':''}</span></button>`).join('')}</div></div></div>`;
  const typeOptions=t.types.map((v,i)=>[String(i),v]);
  const budgetOptions=t.budgets.map((v,i)=>[String(i),v]);
  const deadlineOptions=t.deadlines.map((v,i)=>[i===0?'':v,v]);
  const typeParam=(new URLSearchParams(location.search).get('tipo')||'').toLowerCase();
  const kindMap={'restaurantes':'0','restaurante':'0','website institucional':'1','website':'1','loja online':'2','loja':'2','landing page':'3','solução web específica':'4','aplicação web':'4','modernizar o meu site':'5','modernização':'5'};
  const typeDefault=kindMap[typeParam]||'1';
  panel.querySelectorAll('form').forEach(el=>el.remove());
  panel.querySelectorAll('h2,p').forEach(el=>{ if(el.matches('p'))el.textContent=t.note; });
  const oldNotice=document.querySelector('.contactpage .note'); if(oldNotice)oldNotice.remove();
  panel.insertAdjacentHTML('beforeend', `<form id="lead-form" class="nws-c-form" novalidate>
    <div class="nws-c-hidden" aria-hidden="true"><label>${escapeText(t.hp)}<input type="text" name="honeypot" autocomplete="off" tabindex="-1"></label></div>
    <div class="nws-c-section-title">${escapeText(t.data)}</div>
    <div class="nws-c-grid">
      ${field('nome',t.name,'text',t.fullName,{required:true,maxlength:120,autocomplete:'name'})}
      ${field('empresa',t.business,'text',t.companyName,{maxlength:120,autocomplete:'organization'})}
      ${field('email',t.email,'email','email@empresa.pt',{required:true,maxlength:255,autocomplete:'email'})}
      ${field('telefone',t.phone,'tel',t.phoneExample,{maxlength:50,autocomplete:'tel'})}
    </div>
    <div class="nws-c-section-title nws-c-divider">${escapeText(t.project)}</div>
    <div class="nws-c-grid">
      ${select('tipoIndex',t.kind,typeOptions,typeDefault)}
      ${select('orcamentoIndex',t.budget,budgetOptions,'0')}
      ${field('websiteAtual',t.site,'text',t.website,{maxlength:255,autocomplete:'url'})}
      ${select('prazoTexto',t.time,deadlineOptions,'')}
      <label class="nws-c-field is-wide"><span class="nws-c-label">${escapeText(t.message)}</span><textarea name="mensagem" rows="5" maxlength="5000" placeholder="${escapeText(t.description)}"></textarea></label>
    </div>
    <label class="nws-c-meeting"><input type="checkbox" name="querReuniao" value="true"/><span>${escapeText(t.meet)}</span></label>
    <div class="nws-c-privacy">◈ ${escapeText(t.security)}</div>
    <div class="formerror" role="alert" aria-live="assertive"></div><div class="status" role="status" aria-live="polite"></div>
    <button type="submit" class="nws-c-submit">${escapeText(t.send)} <span aria-hidden="true">↗</span></button>
  </form>`);

  // Menus à medida: acessíveis por rato, toque e teclado, sem aspeto nativo do Windows.
  const choices=[...panel.querySelectorAll('.nws-choice')];
  function close(choice){const menu=choice.querySelector('.nws-choice-pop');const btn=choice.querySelector('.nws-choice-trigger');menu.hidden=true;btn.setAttribute('aria-expanded','false');choice.classList.remove('open');}
  function open(choice){for(const other of choices){if(other!==choice)close(other);}const menu=choice.querySelector('.nws-choice-pop');const btn=choice.querySelector('.nws-choice-trigger');menu.hidden=false;btn.setAttribute('aria-expanded','true');choice.classList.add('open');}
  for(const choice of choices){
    const btn=choice.querySelector('.nws-choice-trigger'), menu=choice.querySelector('.nws-choice-pop');
    btn.addEventListener('click',()=>menu.hidden?open(choice):close(choice));
    btn.addEventListener('keydown',e=>{if(['ArrowDown','Enter',' '].includes(e.key)){e.preventDefault();open(choice);menu.querySelector('[aria-selected="true"]')?.focus();}});
    menu.addEventListener('click',e=>{const opt=e.target.closest('.nws-choice-option');if(!opt)return;choice.querySelector('input[type=hidden]').value=opt.dataset.value;btn.querySelector('.nws-choice-value').textContent=opt.querySelector('span').textContent;menu.querySelectorAll('.nws-choice-option').forEach(b=>{const selected=b===opt;b.setAttribute('aria-selected',selected?'true':'false');b.querySelector('.nws-choice-check').textContent=selected?'✓':'';});close(choice);btn.focus();});
    menu.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close(choice);btn.focus();}if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();const opts=[...menu.querySelectorAll('.nws-choice-option')];const idx=opts.indexOf(document.activeElement);opts[(idx+(e.key==='ArrowDown'?1:-1)+opts.length)%opts.length].focus();}if(e.key==='Enter'||e.key===' '){e.preventDefault();document.activeElement.click();}});
  }
  document.addEventListener('pointerdown',e=>{for(const choice of choices){if(!choice.contains(e.target))close(choice);}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){for(const choice of choices)close(choice);}});

  // A ponte React existente envia para o backend real com CRM e notificações.
  // Este listener é registado antes da ponte antiga e impede o antigo mailto.
  document.addEventListener('submit',function(e){
    const form=e.target;
    if(form?.id!=='lead-form')return;
    e.preventDefault();e.stopImmediatePropagation();
    if(form.dataset.sending==='true')return;
    const data=new FormData(form);
    const record={};for(const k of ['nome','empresa','email','telefone','tipoIndex','orcamentoIndex','websiteAtual','prazoTexto','mensagem','honeypot'])record[k]=String(data.get(k)||'').trim();
    record.querReuniao=data.has('querReuniao')?'true':'false';record.locale=locale;
    const err=form.querySelector('.formerror'),status=form.querySelector('.status');
    if(record.nome.length<1 || !/^\S+@\S+\.\S+$/.test(record.email)){
      if(err)err.textContent=t.required;return;
    }
    if(err)err.textContent='';if(status){status.classList.remove('show');status.textContent='';}
    if(window.parent===window){if(err)err.textContent=t.fail;return;}
    form.dataset.sending='true';
    const submit=form.querySelector('button[type=submit]');if(submit){submit.dataset.original=submit.innerHTML;submit.disabled=true;submit.textContent=t.sending;}
    window.parent.postMessage({nwsBridge:true,type:'contact',record},window.location.origin);
  },true);
  window.addEventListener('message',function(e){
    if(e.origin!==location.origin||e.source!==window.parent||!e.data?.nwsBridge||e.data.type!=='contact-result')return;
    e.stopImmediatePropagation(); // impede que a ponte antiga volte a escrever o estado do formulario
    const form=document.getElementById('lead-form');if(!form)return;
    form.dataset.sending='false';const submit=form.querySelector('button[type=submit]');if(submit){submit.disabled=false;submit.innerHTML=submit.dataset.original||escapeText(t.send);}
    const err=form.querySelector('.formerror'),status=form.querySelector('.status');
    if(e.data.ok){if(err)err.textContent='';if(status){status.classList.add('show');status.textContent=t.success;}form.reset();for(const choice of choices){const value=choice.querySelector('input[type=hidden]');const def=value.defaultValue;const picked=[...choice.querySelectorAll('.nws-choice-option')].find(o=>o.dataset.value===def);if(!picked)continue;value.value=def;choice.querySelector('.nws-choice-trigger .nws-choice-value').textContent=picked.querySelector('span').textContent;for(const opt of choice.querySelectorAll('.nws-choice-option')){const active=opt===picked;opt.setAttribute('aria-selected',active?'true':'false');opt.querySelector('.nws-choice-check').textContent=active?'✓':'';}}}
    else{if(err)err.textContent=t.fail;if(status){status.classList.remove('show');status.textContent='';}}
  });
})();
