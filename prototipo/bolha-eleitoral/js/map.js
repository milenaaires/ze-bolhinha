/* =========================================================================
   BOLHA ELEITORAL — mapa do Brasil (SVG) com as 5 regiões.
   Contornos simplificados a partir de coordenadas aproximadas (lon/lat).
   ========================================================================= */
(function () {
  'use strict';
  const BE = window.BE;
  const K = 12.5;
  const P = (lon, lat) => [((lon + 75) * K).toFixed(1), ((6 - lat) * K).toFixed(1)];

  const FORMAS = {
    N: [[-60.1,-13.5],[-62,-13],[-65.3,-10.8],[-67,-10.5],[-69.6,-11],[-70.5,-9.5],[-72.5,-9.5],[-73.9,-7.5],[-72.9,-5.1],[-69.9,-4.2],[-69.5,-1],[-69.8,1],[-67,2],[-64,4],[-60.5,5.2],[-59.8,4],[-60,2.5],[-58,1.5],[-56,2],[-54,2.2],[-51.6,4.4],[-50.5,1.8],[-50,0],[-48.5,-1],[-46.2,-1.1],[-46.6,-3.5],[-47.6,-5.2],[-47.2,-6.6],[-46,-7.5],[-45.8,-9.5],[-46.3,-11],[-46.3,-13],[-50.3,-13],[-50.2,-9.8],[-56.5,-9.4],[-58.5,-8],[-61.5,-10]],
    NE: [[-46.2,-1.1],[-44.3,-2.5],[-41.5,-2.9],[-38.5,-3.7],[-35.2,-5.8],[-34.8,-7.1],[-34.9,-8.1],[-35.7,-9.7],[-37,-11],[-38.5,-13],[-39,-14.8],[-39,-16.5],[-39.6,-18.3],[-40.3,-16],[-42,-15.2],[-44,-14.3],[-46,-15],[-46.3,-13],[-46.3,-11],[-45.8,-9.5],[-46,-7.5],[-47.2,-6.6],[-47.6,-5.2],[-46.6,-3.5]],
    SE: [[-39.6,-18.3],[-39.7,-19.5],[-40.3,-20.3],[-41,-21.5],[-42,-23],[-43.2,-23],[-44.6,-23.3],[-46.3,-24],[-48.1,-25.2],[-48.4,-24.6],[-49.5,-23.2],[-51,-22.7],[-53.1,-22.6],[-52,-22],[-50.9,-19.9],[-48.3,-18.4],[-47.3,-16.2],[-46,-15],[-44,-14.3],[-42,-15.2],[-40.3,-16]],
    S: [[-48.1,-25.2],[-48.6,-26.5],[-48.5,-27.6],[-48.8,-28.6],[-50.2,-30.2],[-51.2,-31.5],[-52.2,-32.3],[-53.4,-33.7],[-53.5,-32.5],[-55.5,-31],[-57.6,-30.2],[-56,-28.2],[-54,-27.2],[-54.6,-25.5],[-54.3,-24],[-53.1,-22.6],[-51,-22.7],[-49.5,-23.2],[-48.4,-24.6]],
    CO: [[-54.3,-24],[-55.7,-22.6],[-57.9,-22.1],[-58.2,-19.8],[-57.6,-19],[-58.4,-17.3],[-60.2,-16.3],[-60.1,-13.5],[-61.5,-10],[-58.5,-8],[-56.5,-9.4],[-50.2,-9.8],[-50.3,-13],[-46.3,-13],[-46,-15],[-47.3,-16.2],[-48.3,-18.4],[-50.9,-19.9],[-52,-22],[-53.1,-22.6]],
  };
  // centro do rótulo de cada região (lon, lat)
  const ROTULO = { N: [-61, -3.2], NE: [-41.4, -8.2], CO: [-57.2, -15], SE: [-44.2, -20.2], S: [-52.6, -27.8] };

  const pts = (arr) => arr.map((c) => P(c[0], c[1]).join(',')).join(' ');

  const defs = `
    <defs>
      <pattern id="pat-Q" width="16" height="16" patternUnits="userSpaceOnUse">
        <rect x="4" y="4" width="7" height="7" fill="var(--q)" opacity=".35"/>
      </pattern>
      <pattern id="pat-T" width="16" height="16" patternUnits="userSpaceOnUse">
        <path d="M8 3 L13 12 L3 12 Z" fill="var(--t)" opacity=".38"/>
      </pattern>
      <pattern id="pat-D" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="5" height="10" fill="var(--ink)" opacity=".06"/>
      </pattern>
      <pattern id="pat-mar" width="40" height="20" patternUnits="userSpaceOnUse">
        <path d="M0 10 Q10 4 20 10 T40 10" fill="none" stroke="var(--mar-onda)" stroke-width="1.4"/>
      </pattern>
      <filter id="sombra" x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#000" flood-opacity=".25"/>
      </filter>
    </defs>`;

  function fichas(n, forma) {
    return forma.repeat(n);
  }

  function rotulo(s, id, opts) {
    const r = s.regioes[id];
    const meta = BE.REGIOES[id];
    const [x, y] = P(ROTULO[id][0], ROTULO[id][1]).map(Number);
    const und = 100 - r.q - r.t;
    const W = 148, bx = x - W / 2;
    const ctrl = BE.Engine.controle(r);
    const pauta = BE.PAUTAS[r.pauta];
    const bolha = r.bolha.nivel
      ? `<g class="m-bolha-selo" transform="translate(${bx - 4},${y - 44})"><circle r="${11 + r.bolha.nivel * 2}"/><text y="4">${r.bolha.nivel}${BE.GRUPOS[r.bolha.lado].forma}</text></g>`
      : '';
    const wq = (W - 12) * r.q / 100, wu = (W - 12) * und / 100, wt = (W - 12) * r.t / 100;
    const selo = ctrl ? `<g class="m-selo m-selo-${ctrl}" transform="translate(${bx + W - 6},${y - 42})">
        ${ctrl === 'Q' ? '<rect x="-11" y="-11" width="22" height="22" rx="3"/>' : '<path d="M0 -13 L13 10 L-13 10 Z"/>'}</g>` : '';
    return `
      <g class="m-rotulo" pointer-events="none">
        <rect x="${bx}" y="${y - 40}" width="${W}" height="84" rx="10" class="m-placa" filter="url(#sombra)"/>
        <text x="${x}" y="${y - 22}" class="m-nome">${meta.nome.toUpperCase()}</text>
        <text x="${x}" y="${y - 7}" class="m-info">${meta.votos}% dos votos · ${pauta.icone} · 🛡${r.resist}</text>
        <g transform="translate(${bx + 6},${y})">
          <rect width="${wq}" height="12" class="m-bar-q" rx="2"/>
          <rect x="${wq}" width="${wu}" height="12" class="m-bar-u"/>
          <rect x="${wq + wu}" width="${wt}" height="12" class="m-bar-t" rx="2"/>
        </g>
        <text x="${bx + 8}" y="${y + 28}" class="m-num m-num-q">■${r.q}</text>
        <text x="${x}" y="${y + 27}" class="m-num m-num-u">?${und}</text>
        <text x="${bx + W - 8}" y="${y + 28}" class="m-num m-num-t" text-anchor="end">▲${r.t}</text>
        <text x="${x}" y="${y + 40}" class="m-fichas"><tspan class="f-q">${fichas(Math.round(r.q / 10), '■')}</tspan> <tspan class="f-t">${fichas(Math.round(r.t / 10), '▲')}</tspan></text>
        ${selo}
        ${bolha}
      </g>`;
  }

  function svg(s, opts) {
    opts = opts || {};
    const alvos = opts.alvos || [];
    const polys = BE.REGIAO_IDS.map((id) => {
      const r = s.regioes[id];
      const ctrl = BE.Engine.controle(r);
      const cls = ['m-reg', ctrl ? 'm-ctrl-' + ctrl : 'm-disputa'];
      if (alvos.includes(id)) cls.push('m-alvo');
      if (opts.destaque === id) cls.push('m-destaque');
      const p = pts(FORMAS[id]);
      return `<g class="${cls.join(' ')}" data-regiao="${id}" tabindex="${alvos.includes(id) ? 0 : -1}" role="button" aria-label="${BE.REGIOES[id].nome}">
          <polygon points="${p}" class="m-base"/>
          <polygon points="${p}" class="m-pat" fill="url(#pat-${ctrl || 'D'})"/>
        </g>`;
    }).join('');
    const rotulos = BE.REGIAO_IDS.map((id) => rotulo(s, id, opts)).join('');
    return `<svg class="mapa-svg" viewBox="0 0 520 510" xmlns="http://www.w3.org/2000/svg" aria-label="Mapa do Brasil">
      ${defs}
      <rect x="-40" y="-40" width="600" height="600" fill="url(#pat-mar)" class="m-mar"/>
      <g class="m-regioes">${polys}</g>
      ${rotulos}
      <text x="470" y="470" class="m-rosa">N↑</text>
    </svg>`;
  }

  BE.Mapa = { svg };
})();
