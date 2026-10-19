/* Nova Web Studio - faixa de servicos infinita, sem cortes nem espacos vazios.
   Atua APENAS na faixa da Home. Nao altera o HUB, cookies ou formularios. */
(() => {
  'use strict';
  if (window.__nwsTickerInfinito2026) return;
  window.__nwsTickerInfinito2026 = true;

  const ticker = document.querySelector('.is-index .v3-ticker');
  const track = ticker?.querySelector('.v3-ticker-track');
  if (!ticker || !track) return;

  // O HTML aprovado inclui 2 repeticoes: guardamos apenas o primeiro ciclo.
  const children = Array.from(track.children);
  if (children.length < 4 || children.length % 2 !== 0) return;
  const original = children.slice(0, children.length / 2).map(el => el.cloneNode(true));
  if (!original.length) return;

  const style = document.createElement('style');
  style.id = 'nws-ticker-infinito-style';
  style.textContent = `
    .v3-ticker.nws-ticker-ready .v3-ticker-track {
      display: flex !important;
      align-items: center;
      width: max-content;
      min-width: max-content;
      gap: 0 !important;
      animation: nws-ticker-continuo var(--nws-ticker-tempo, 38s) linear infinite !important;
      will-change: transform;
    }
    .v3-ticker.nws-ticker-ready .nws-ticker-ciclo {
      display: flex;
      flex: none;
      align-items: center;
      gap: 33px;
      padding-right: 33px;
      width: max-content;
      white-space: nowrap;
    }
    @keyframes nws-ticker-continuo {
      from { transform: translate3d(0, 0, 0); }
      to { transform: translate3d(-50%, 0, 0); }
    }
    @media(max-width: 720px) {
      .v3-ticker.nws-ticker-ready .nws-ticker-ciclo {
        gap: 22px;
        padding-right: 22px;
      }
    }
    @media(prefers-reduced-motion: reduce) {
      .v3-ticker.nws-ticker-ready .v3-ticker-track {
        animation: none !important;
        will-change: auto;
      }
    }
  `;
  document.head.appendChild(style);

  let lastWidth = 0;
  let pending = false;
  function rebuild() {
    const viewportWidth = Math.ceil(ticker.getBoundingClientRect().width);
    if (!viewportWidth) return;
    lastWidth = viewportWidth;

    // O primeiro ciclo TEM de ser maior que a largura visivel. Assim,
    // enquanto o primeiro sai, o segundo ja esta a entrar sem lacunas.
    const ciclo = document.createElement('div');
    ciclo.className = 'nws-ticker-ciclo';
    ciclo.setAttribute('aria-hidden', 'true');
    track.replaceChildren(ciclo);
    ticker.classList.remove('nws-ticker-ready');

    let repeats = 0;
    const minimum = viewportWidth + 240;
    do {
      for (const element of original) ciclo.appendChild(element.cloneNode(true));
      repeats++;
    } while (ciclo.scrollWidth < minimum && repeats < 30);

    const twin = ciclo.cloneNode(true);
    track.appendChild(twin);
    const distance = ciclo.getBoundingClientRect().width;
    // Velocidade visual constante, mesmo em monitores largos.
    const duration = Math.max(16, distance / 80);
    track.style.setProperty('--nws-ticker-tempo', duration.toFixed(2) + 's');
    ticker.classList.add('nws-ticker-ready');
  }

  function onResize() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      const width = Math.ceil(ticker.getBoundingClientRect().width);
      if (width !== lastWidth) rebuild();
    });
  }

  rebuild();
  if (document.fonts?.ready) document.fonts.ready.then(rebuild).catch(() => {});
  if ('ResizeObserver' in window) new ResizeObserver(onResize).observe(ticker);
  else window.addEventListener('resize', onResize, { passive: true });
})();
