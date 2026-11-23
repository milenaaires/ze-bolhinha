/* Simulador de balanceamento: roda N partidas com jogadores-robô simples
   e imprime estatísticas. Uso: node tools/sim.js [partidas] */
'use strict';
const path = require('path');
globalThis.window = globalThis;
require(path.join(__dirname, '../js/data.js'));
require(path.join(__dirname, '../js/engine.js'));
const BE = globalThis.BE;
const E = BE.Engine;
const N = +process.argv[2] || 2000;
const pick = (a) => a[Math.floor(Math.random() * a.length)];

// estilos de robô para os candidatos: 'misto' | 'honesto' | 'fake'
function turnoCandidato(s, j, estilo) {
  for (let tent = 0; tent < 6 && j.turno.cartas < 2; tent++) {
    let mao = j.mao.slice();
    if (estilo === 'honesto') mao = mao.filter((m) => !['falsa', 'enganosa'].includes(BE.CARTA[m.id].veracidade) && !['disparo', 'robos', 'bocadeurna'].includes(m.id));
    if (estilo === 'fake') mao.sort((a, b) => (BE.CARTA[b.id].veracidade === 'falsa') - (BE.CARTA[a.id].veracidade === 'falsa'));
    else mao.sort(() => Math.random() - 0.5);
    let jogou = false;
    for (const c of mao) {
      if (E.podeJogar(s, j, c)) continue;
      const def = BE.CARTA[c.id];
      let alvo = null;
      const val = E.alvosValidos(s, j, c);
      if (def.tipo === 'noticia' || def.alvo === 'regiao') {
        if (!val.length) continue;
        alvo = Math.random() < 0.5 ? 'SE' : pick(val);
        if (!val.includes(alvo)) alvo = pick(val);
      } else if (def.alvo === 'post') {
        const adv = s.feed.filter((p) => !p.removido && !p.checado && p.grupo !== j.grupo);
        if (!adv.length) continue;
        alvo = pick(adv).id;
      }
      const r = E.jogarCarta(s, j.pid, c.uid, alvo);
      if (r.ok) { jogou = true; break; }
    }
    if (!jogou) break;
  }
  E.panfletar(s, j.pid, pick(BE.REGIAO_IDS));
}

function turnoAlgoritmo(s, estilo) {
  if (estilo !== 'neutro' && s.alg.mao.length && Math.random() < 0.7) {
    const c = pick(s.alg.mao);
    const alvo = { regiao: pick(BE.REGIAO_IDS), grupo: pick(['Q', 'T']), pauta: pick(Object.keys(BE.PAUTAS)), post: (pick(s.feed.filter((p) => !p.removido && !p.zap)) || {}).id };
    E.jogarCartaAlg(s, c.uid, alvo);
  }
  const posts = s.feed.filter((p) => !p.removido && !p.zap && !p.shadow);
  if (estilo === 'neutro') {
    // impulsiona alternando os grupos para manter o viés perto de zero
    const por = { Q: posts.filter((p) => p.grupo === 'Q'), T: posts.filter((p) => p.grupo === 'T') };
    let g = s.alg.vies > 0 ? 'T' : 'Q', falhas = 0;
    while (falhas < 2) {
      const p = por[g].sort((a, b) => a.alcance - b.alcance)[0];
      if (p && p.alcance < 3 && E.ajustarAlcance(s, p.id, p.alcance + 1).ok) falhas = 0; else falhas++;
      g = g === 'Q' ? 'T' : 'Q';
    }
    return;
  }
  if (estilo === 'engajamento') posts.sort((a, b) => E.viralidade(s, b) - E.viralidade(s, a));
  else posts.sort(() => Math.random() - 0.5);
  for (const p of posts) {
    for (let v = 4; v > p.alcance; v--) if (E.ajustarAlcance(s, p.id, v).ok) break;
  }
}

function partida(estilos, estiloAlg) {
  const papeis = ['q1', 'q2', 't1', 't2', 'A'];
  const s = E.novoJogo(papeis.map((p, i) => ({ nome: 'J' + i, papel: p })));
  E.iniciarRodada(s);
  while (s.fase !== 'apuracao') {
    E.escolherTrending(s, pick(s.trendingOpcoes));
    while (s.fase === 'campanha') {
      const j = E.atual(s);
      turnoCandidato(s, j, estilos[j.grupo]);
      E.encerrarTurno(s);
    }
    turnoAlgoritmo(s, estiloAlg);
    E.encerrarAlgoritmo(s);
    E.resolverTudo(s);
    E.consequencias(s);
    E.avancar(s);
  }
  return s;
}

function rodar(rotulo, estilos, estiloAlg) {
  const st = { Q: 0, T: 0, diff: 0, eng: [], pol: 0, conf: 0, missao: {}, contestada: 0, escandalos: 0 };
  for (let i = 0; i < N; i++) {
    const s = partida(estilos, estiloAlg);
    const f = s.final;
    st[f.vencedor]++;
    st.diff += Math.abs(f.nacional.pq - f.nacional.pt);
    st.eng.push(s.alg.engajamento);
    st.pol += s.ind.pol;
    st.conf += s.ind.conf;
    st.contestada += f.contestada ? 1 : 0;
    st.escandalos += s.alg.escandalos;
    f.jogadores.forEach((j) => {
      const m = (st.missao[j.missao] = st.missao[j.missao] || { n: 0, ok: 0 });
      m.n++;
      if (j.ok) m.ok++;
    });
  }
  st.eng.sort((a, b) => a - b);
  const pct = (x) => ((x / N) * 100).toFixed(1) + '%';
  console.log(`\n=== ${rotulo} (${N} partidas) ===`);
  console.log(`Vitórias Q ${pct(st.Q)} · T ${pct(st.T)} · diferença média ${(st.diff / N).toFixed(1)} pts · contestadas ${pct(st.contestada)}`);
  console.log(`Engajamento p25/p50/p75: ${st.eng[N >> 2]}/${st.eng[N >> 1]}/${st.eng[(3 * N) >> 2]} · polarização final ${(st.pol / N).toFixed(1)} · confiança final ${(st.conf / N).toFixed(1)} · escândalos/partida ${(st.escandalos / N).toFixed(2)}`);
  console.log('Missões (taxa de sucesso):');
  Object.entries(st.missao).forEach(([id, m]) => console.log(`  ${BE.MISSAO[id].nome.padEnd(26)} ${((m.ok / m.n) * 100).toFixed(0).padStart(3)}%  (n=${m.n})`));
}

rodar('Todos mistos, Algoritmo aleatório', { Q: 'misto', T: 'misto' }, 'aleatorio');
rodar('Todos mistos, Algoritmo caça-engajamento', { Q: 'misto', T: 'misto' }, 'engajamento');
rodar('Todos mistos, Algoritmo neutro', { Q: 'misto', T: 'misto' }, 'neutro');
rodar('Quadrados honestos × Triângulos fake', { Q: 'honesto', T: 'fake' }, 'engajamento');
rodar('Quadrados fake × Triângulos honestos', { Q: 'fake', T: 'honesto' }, 'engajamento');
