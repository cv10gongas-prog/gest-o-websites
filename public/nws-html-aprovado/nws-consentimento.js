/* Nova Web Studio — Consentimento GA4 (opt-in real, sem tag antes da escolha).
   Partilhado pelo website HTML e pela aplicação React (Contacto).
   Esta lógica não altera as funções de Analytics do HUB. */
(() => {
  'use strict';
  if (window.__nwsConsentV1) return;
  window.__nwsConsentV1 = true;
  const CONSENT_KEY = 'analytics-consent'; // compatibilidade com consentimento React antigo
  const GA4_ID = 'G-4BM9SVN2RZ';
  const insideFrame = window.parent !== window;
  const allowedHosts = new Set(['novawebstudio.pt', 'www.novawebstudio.pt']);
  const activeOnHost = allowedHosts.has(window.location.hostname);
  const internal = /^\/(?:auth|admin|hub|painel|negocios|pipeline|tarefas|direcao|equipa|emails|pedidos|definicoes|arquivos|analisar|operacoes|controlo-ceo|descobrir|produtos|seguranca|satisfacao(?:\/|$))/i;
  let scriptLoaded = false;
  const read = () => { try { return localStorage.getItem(CONSENT_KEY); } catch { return null; } };
  const write = value => { try { localStorage.setItem(CONSENT_KEY, value); return true; } catch { return false; } };

  function loadAnalytics() {
    if (insideFrame || !activeOnHost || internal.test(location.pathname) || read() !== 'granted' || scriptLoaded) return;
    scriptLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function() { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'granted', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied'
    });
    window.gtag('js', new Date());
    window.gtag('config', GA4_ID, { send_page_view: true });
    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_ID);
    script.async = true;
    script.dataset.nwsAnalytics = 'consented';
    script.onerror = () => { console.warn('[NWS] Google Analytics indisponível (rede ou bloqueador).'); };
    document.head.appendChild(script);
  }

  function clearAnalyticsCookies() {
    const names = document.cookie.split(';').map(x => x.trim().split('=')[0]).filter(x => /^_ga(?:_|$)/.test(x));
    const domains = ['', 'domain=novawebstudio.pt; ', 'domain=.novawebstudio.pt; '];
    const paths = ['/', location.pathname];
    for (const name of names) for (const domain of domains) for (const path of paths) {
      document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; path=' + path + '; ' + domain + 'SameSite=Lax';
    }
  }

  function labels() {
    const q = new URLSearchParams(location.search).get('lang');
    const l = (q || document.documentElement.lang || 'pt').slice(0, 2);
    const dict = {
      pt: ['Cookies e estatísticas', 'Usamos cookies analíticos do Google Analytics apenas com a tua autorização, para perceber as visitas e melhorar o website. Podes aceitar, recusar ou mudar a escolha quando quiseres.', 'Aceitar analítica', 'Recusar', 'Saber mais sobre cookies', 'Preferências de cookies', 'Preferência guardada.'],
      en: ['Cookies & statistics', 'We use Google Analytics only with your permission. You can accept, refuse or change your choice at any time.', 'Accept analytics', 'Decline', 'Cookie information', 'Cookie preferences', 'Preference saved.'],
      es: ['Cookies y estadísticas', 'Usamos Google Analytics solo con tu autorización. Puedes aceptar, rechazar o cambiar tu elección.', 'Aceptar analítica', 'Rechazar', 'Información sobre cookies', 'Preferencias de cookies', 'Preferencia guardada.'],
      fr: ['Cookies et statistiques', 'Nous utilisons Google Analytics uniquement avec votre consentement. Vous pouvez accepter, refuser ou changer votre choix.', 'Accepter', 'Refuser', 'À propos des cookies', 'Préférences cookies', 'Préférence enregistrée.'],
      de: ['Cookies und Statistik', 'Wir nutzen Google Analytics nur mit deiner Einwilligung. Du kannst zustimmen, ablehnen oder deine Wahl jederzeit ändern.', 'Zustimmen', 'Ablehnen', 'Cookie-Informationen', 'Cookie-Einstellungen', 'Einstellung gespeichert.']
    };
    return dict[l] || dict.pt;
  }

  function render(show = read() === null) {
    if (insideFrame) return;
    let wrap = document.getElementById('nws-consent-wrap');
    if (!wrap) { wrap = document.createElement('div'); wrap.id = 'nws-consent-wrap'; document.body.appendChild(wrap); }
    wrap.replaceChildren();
    if (!show) return;
    const t = labels();
    const panel = document.createElement('section');
    panel.id = 'nws-cookie-banner';
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', t[0]);
    panel.innerHTML = '<div class="nws-cookie-top"><span class="nws-cookie-mark">✳</span><strong></strong></div><p></p><div class="nws-cookie-actions"><button type="button" class="nws-cookie-accept"></button><button type="button" class="nws-cookie-deny"></button></div><a class="nws-cookie-learn" href="/cookies"></a>';
    panel.querySelector('strong').textContent = t[0];
    panel.querySelector('p').textContent = t[1];
    panel.querySelector('.nws-cookie-accept').textContent = t[2];
    panel.querySelector('.nws-cookie-deny').textContent = t[3];
    panel.querySelector('.nws-cookie-learn').textContent = t[4] + ' ↗';
    const pageLang = (new URLSearchParams(location.search).get('lang') || document.documentElement.lang || 'pt').slice(0, 2);
    if (['en', 'es', 'fr', 'de'].includes(pageLang)) panel.querySelector('.nws-cookie-learn').href = '/cookies?lang=' + pageLang;
    panel.querySelector('.nws-cookie-accept').addEventListener('click', () => choose('granted'));
    panel.querySelector('.nws-cookie-deny').addEventListener('click', () => choose('denied'));
    wrap.appendChild(panel);
  }

  function choose(value) {
    const previous = read();
    if (!write(value)) { console.warn('[NWS] Não foi possível guardar a preferência neste navegador.'); return; }
    render(false);
    if (value === 'granted') { loadAnalytics(); }
    else {
      if (window.gtag) window.gtag('consent', 'update', {analytics_storage: 'denied'});
      clearAnalyticsCookies();
      // Se a tag tinha sido carregada, recarregar para garantir que não continua ativa.
      if (scriptLoaded || previous === 'granted') location.reload();
    }
  }

  function bindControls() {
    document.addEventListener('click', event => {
      const btn = event.target.closest?.('[data-nws-cookies-open]');
      if (!btn) return;
      event.preventDefault();
      if (insideFrame) {
        window.parent.postMessage({ nwsConsentOpen: true }, location.origin);
        return;
      }
      render(true);
    });
    if (!insideFrame) window.addEventListener('message', event => {
      if (event.origin !== location.origin || event.data?.nwsConsentOpen !== true) return;
      render(true);
    });
  }

  function start() {
    bindControls();
    if (!insideFrame && !internal.test(location.pathname)) { loadAnalytics(); render(); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once: true});
  else start();
})();
