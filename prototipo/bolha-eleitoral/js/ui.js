/* =========================================================================
   BOLHA ELEITORAL — interface (telas, mesa, painéis, modais).
   Redesenha a partir do estado a cada ação. Delegação de eventos por
   atributo data-acao.
   ========================================================================= */
(function () {
  'use strict';
  const BE = window.BE, E = BE.Engine, C = BE.CONFIG, RIDS = BE.REGIAO_IDS;
  const app = document.getElementById('app');
  const camada = document.getElementById('camada');
  const SAVE = 'bolha-eleitoral-save-v1';

  let S = null; // estado do jogo
  const U = {
    tela: 'inicio', setup: null, sel: null, modo: null, privado: false, missao: false,
    modal: null, reacao: null, cons: null, algEscolha: null, toastT: null,
  };

  /* ------------------------------ utilidades ---------------------------- */
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const forma = (g, cls) => `<span class="forma forma-${g} ${cls || ''}" title="${BE.GRUPOS[g].nome}">${BE.GRUPOS[g].forma}</span>`;
  const nomeR = (id) => BE.REGIOES[id].nome;
  const pautaTag = (p) => (p ? `<span class="tag-pauta" title="${BE.PAUTAS[p].nome}">${BE.PAUTAS[p].icone} ${BE.PAUTAS[p].nome}</span>` : '<span class="tag-pauta tag-livre">✳️ Qualquer pauta</span>');

  function salvar() {
    try {
      // sem partida carregada (tela inicial/setup), não mexe no save existente
      if (S) localStorage.setItem(SAVE, JSON.stringify({ S, tela: U.tela, reacaoLista: U.reacao ? U.reacao.lista : null, cons: U.cons }));
    } catch (e) { /* armazenamento indisponível: segue sem salvar */ }
  }
  function carregarSave() {
    try {
      const raw = localStorage.getItem(SAVE);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function toast(msg, tipo) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = 'toast mostrar ' + (tipo || '');
    clearTimeout(U.toastT);
    U.toastT = setTimeout(() => (el.className = 'toast'), 2600);
  }

  const atualJ = () => (S ? E.atual(S) : null);

  /* =============================== TELAS =============================== */
  function render() {
    if (U.tela === 'inicio') app.innerHTML = telaInicio();
    else if (U.tela === 'setup') app.innerHTML = telaSetup();
    else if (U.tela === 'jogo') app.innerHTML = telaJogo();
    else if (U.tela === 'final') app.innerHTML = telaFinal();
    renderCamada();
    salvar();
  }

  /* ------------------------------- início ------------------------------- */
  function telaInicio() {
    const save = carregarSave();
    const podeContinuar = save && save.S && save.tela !== 'final';
    const flutuantes = ['URGENTE!!!', 'Bom dia, grupo 🌷', 'REPASSEM', '#publi', 'Vota ■', 'Vota ▲', 'Áudio de 7 min', 'FAKE?', 'Santinho', '87%?!', 'Fonte: confia'];
    return `
    <div class="tela-inicio">
      <div class="flutuantes" aria-hidden="true">${flutuantes.map((f, i) => `<span style="left:${i % 2 ? 78 + ((i * 7) % 12) : 3 + ((i * 7) % 12)}%;top:${6 + ((i * 41) % 82)}%;transform:rotate(${((i * 13) % 24) - 12}deg);animation-delay:${-i * 0.7}s">${esc(f)}</span>`).join('')}</div>
      <div class="inicio-conteudo">
        <div class="logo-formas" aria-hidden="true"><span class="lf lf-q">■</span><span class="lf lf-bolha"></span><span class="lf lf-t">▲</span></div>
        <h1 class="titulo">Bolha<br>Eleitoral</h1>
        <p class="subtitulo">Quadrados <b>×</b> Triângulos <b>×</b> o Algoritmo</p>
        <p class="chamada">Um jogo de cartas e território sobre eleições, fake news e o feed que decide o que o Brasil vê. Para exatamente <b>5 pessoas</b> no mesmo computador.</p>
        <div class="botoes">
          ${podeContinuar ? `<button class="btn btn-grande" data-acao="continuar">▶ Continuar partida (semana ${save.S.rodada})</button>` : ''}
          <button class="btn ${podeContinuar ? 'btn-sec' : 'btn-grande'}" data-acao="ir-setup">Nova partida</button>
          <button class="btn btn-sec" data-acao="regras">Como jogar</button>
        </div>
        <p class="rodape-inicio">Protótipo do projeto Zé Bolhinha. Grupos, candidatos e notícias são fictícios, exceto os fatos históricos, que trazem a fonte.</p>
      </div>
    </div>`;
  }

  /* -------------------------------- setup ------------------------------- */
  const PAPEIS = ['q1', 'q2', 't1', 't2', 'A'];
  function novoSetup() {
    U.setup = { nomes: ['', '', '', '', ''], papeis: PAPEIS.slice() };
  }
  function papelInfo(p) {
    if (p === 'A') return { nome: 'O Algoritmo', titulo: 'Sistema de recomendação', g: null, desc: 'Decide o que viraliza. Não disputa a eleição: tem missão própria.' };
    const d = BE.CANDIDATOS[p];
    return { nome: d.nome, titulo: d.titulo, g: d.grupo, desc: `${BE.ARQUETIPOS[d.arquetipo].nome}: ${BE.ARQUETIPOS[d.arquetipo].desc}`, bordao: d.bordao };
  }
  function telaSetup() {
    const st = U.setup;
    const linhas = st.nomes.map((n, i) => {
      const p = st.papeis[i];
      const info = papelInfo(p);
      const cls = p === 'A' ? 'papel-A' : 'papel-' + info.g;
      return `
      <div class="setup-linha ${cls}">
        <div class="setup-num">${i + 1}</div>
        <label class="setup-nome"><span>Jogador(a)</span>
          <input type="text" maxlength="18" value="${esc(n)}" data-campo="nome" data-i="${i}" placeholder="Nome de quem joga"></label>
        <label class="setup-papel"><span>Papel</span>
          <select data-campo="papel" data-i="${i}">
            ${PAPEIS.map((pp) => `<option value="${pp}" ${pp === p ? 'selected' : ''}>${pp === 'A' ? '🤖 Algoritmo' : (BE.CANDIDATOS[pp].grupo === 'Q' ? '■ ' : '▲ ') + BE.CANDIDATOS[pp].nome}</option>`).join('')}
          </select></label>
        <div class="setup-info">
          <div class="setup-avatar">${p === 'A' ? '<span class="av-alg">🤖</span>' : forma(info.g, 'grande')}</div>
          <div><b>${esc(info.nome)}</b> <i>${esc(info.titulo)}</i><br><small>${esc(info.desc)}</small></div>
        </div>
      </div>`;
    }).join('');
    const cont = {};
    st.papeis.forEach((p) => (cont[p] = (cont[p] || 0) + 1));
    const ok = PAPEIS.every((p) => cont[p] === 1);
    return `
    <div class="tela-setup">
      <header class="setup-topo">
        <button class="btn btn-sec btn-peq" data-acao="voltar-inicio">← Voltar</button>
        <h2>Quem joga?</h2>
        <p>A mesa é fixa: <b>2 Quadrados ■</b>, <b>2 Triângulos ▲</b> e <b>1 Algoritmo 🤖</b>. Cada papel aparece uma vez.</p>
      </header>
      <div class="setup-lista">${linhas}</div>
      <div class="setup-rodape">
        <button class="btn btn-sec" data-acao="sortear">🎲 Sortear papéis</button>
        ${ok ? '' : '<span class="aviso">Cada papel precisa aparecer exatamente uma vez.</span>'}
        <button class="btn btn-grande" data-acao="comecar" ${ok ? '' : 'disabled'}>Começar a campanha ▶</button>
      </div>
      <p class="setup-dica">🔒 As missões secretas são sorteadas ao começar. Cada pessoa só vê a sua, no próprio turno, depois de “passar o computador”.</p>
    </div>`;
  }

  /* ------------------------------ mesa de jogo -------------------------- */
  const FASES = {
    evento: 'Evento da semana', trending: 'Assunto do momento', campanha: 'Campanha eleitoral',
    algoritmo: 'Distribuição algorítmica', reacao: 'Reação da população', consequencias: 'Consequências', apuracao: 'Apuração',
  };

  function medidor(rot, ico, v, cls, dica) {
    const seg = Array.from({ length: 10 }, (_, i) => `<i class="${i < v ? 'on' : ''}"></i>`).join('');
    return `<div class="medidor ${cls}" title="${esc(dica)}"><span class="med-rot">${ico} ${rot}</span><span class="med-seg">${seg}</span><b>${v}</b></div>`;
  }

  function telaJogo() {
    const j = atualJ();
    const n = E.nacional(S);
    const fase = FASES[S.fase] || '';
    const ordemIdx = S.fase === 'campanha' ? S.turnoIdx : -1;
    const alvosMapa = alvosDoModo();
    return `
    <div class="jogo fase-${S.fase}">
      <header class="topo">
        <div class="topo-logo"><span class="forma-Q">■</span><span class="mini-bolha"></span><span class="forma-T">▲</span> <b>Bolha Eleitoral</b></div>
        <div class="topo-semana"><span class="semana">Semana ${S.rodada}/${C.RODADAS}</span><span class="fase">${fase}</span></div>
        <div class="indicadores">
          ${medidor('Polarização', '⚡', S.ind.pol, 'med-pol', 'Quanto maior, menos gente muda de lado, mais o sensacionalismo engaja e mais difícil fica dialogar. 6+: ninguém converte adversários. 7+: radicalização. 8+: apelos ao diálogo perdem força.')}
          ${medidor('Confiança', '🤝', S.ind.conf, 'med-conf', 'Confiança pública nas informações. 3 ou menos: verdades perdem força e o Algoritmo sofre CPI. 7+: a população checa mais. 0 no fim: eleição contestada.')}
          ${medidor('Desinformação', '🦠', S.ind.desinfo, 'med-des', 'Volume de conteúdo falso circulando. 4+: aumenta a polarização a cada semana. 5+: corrói a confiança.')}
          <div class="medidor med-eng" title="Engajamento acumulado pelo Algoritmo"><span class="med-rot">📈 Engajamento</span><b class="grande">${S.alg.engajamento}</b></div>
        </div>
        <div class="topo-btns">
          <button class="btn-icone" data-acao="historico" title="Histórico completo">📜</button>
          <button class="btn-icone" data-acao="regras" title="Como jogar">?</button>
          <button class="btn-icone" data-acao="sair" title="Sair para o início">⏏</button>
        </div>
      </header>

      <div class="mesa">
        <aside class="col-esq">
          ${placar(n)}
          ${semanaBox()}
          <div class="lista-cand">
            ${S.ordem.map((pid, i) => cartaoCandidato(E.jogador(S, pid), i, ordemIdx)).join('')}
          </div>
          ${cartaoAlgoritmo()}
        </aside>

        <main class="col-mapa">
          ${bannerModo()}
          <div class="mapa-wrap ${alvosMapa.length ? 'mirando' : ''}">${BE.Mapa.svg(S, { alvos: alvosMapa })}</div>
          <div class="legenda">
            <span><i class="lg lg-q"></i>■ controlado por Quadrados</span>
            <span><i class="lg lg-t"></i>▲ controlado por Triângulos</span>
            <span><i class="lg lg-d"></i>em disputa (vantagem &lt; ${C.LIMIAR_CONTROLE})</span>
            <span>🛡 resistência à desinformação · 🫧 bolha · ? indecisos</span>
          </div>
        </main>

        <aside class="col-dir">
          <section class="feed">
            <h3>📲 Feed da semana <small>${S.feed.filter((p) => !p.removido).length} posts</small></h3>
            <div class="feed-lista">${S.feed.length ? S.feed.slice().reverse().map(postPublico).join('') : '<p class="vazio">Nada publicado ainda.</p>'}</div>
          </section>
          <section class="log">
            <h3>📜 Acontecimentos</h3>
            <div class="log-lista">${S.log.slice(0, 40).map((l) => `<p class="log-${l.tipo}"><span>S${l.r}</span>${esc(l.texto)}</p>`).join('')}</div>
          </section>
        </aside>
      </div>
      ${doca(j)}
    </div>`;
  }

  function placar(n) {
    const u = n.u;
    const tot = n.q + n.t + u;
    return `
    <section class="placar">
      <h3>🗳️ Projeção nacional <small>votos válidos</small></h3>
      <div class="placar-bar">
        <div class="pb-q" style="width:${(n.q / tot) * 100}%"></div>
        <div class="pb-u" style="width:${(u / tot) * 100}%"></div>
        <div class="pb-t" style="width:${(n.t / tot) * 100}%"></div>
      </div>
      <div class="placar-num">
        <span class="forma-Q">■ ${n.pq.toFixed(1)}%</span>
        <small>${u.toFixed(0)}% indecisos</small>
        <span class="forma-T">${n.pt.toFixed(1)}% ▲</span>
      </div>
      <div class="placar-ctrl">Regiões: ■ ${E.controladas(S, 'Q').length} · ▲ ${E.controladas(S, 'T').length} · em disputa ${5 - E.controladas(S, 'Q').length - E.controladas(S, 'T').length}</div>
    </section>`;
  }

  function semanaBox() {
    const ev = S.evento;
    return `
    <section class="semana-box">
      ${ev ? `<div class="ev-mini"><span class="ev-ico">${ev.icone}</span><div><b>${esc(ev.nome)}</b><small>${esc(ev.texto)}</small></div></div>` : ''}
      ${S.trending ? `<div class="trend-mini">🔥 Assunto do momento: <b>${BE.PAUTAS[S.trending].icone} ${BE.PAUTAS[S.trending].nome}</b><small>+1 viralidade e +1 efeito para notícias dessa pauta</small></div>` : ''}
    </section>`;
  }

  function cartaoCandidato(j, i, ordemIdx) {
    const vez = i === ordemIdx;
    const jaFoi = ordemIdx > i;
    return `
    <div class="cand cand-${j.grupo} ${vez ? 'vez' : ''} ${jaFoi ? 'ja-foi' : ''}">
      <div class="cand-ordem">${i + 1}º</div>
      <div class="cand-av">${forma(j.grupo, 'grande')}</div>
      <div class="cand-info">
        <b>${esc(j.def.nome)}</b>
        <small>${esc(j.def.titulo)} · ${BE.ARQUETIPOS[j.def.arquetipo].nome} · <i>${esc(j.nome)}</i></small>
        <div class="cand-stats">
          <span title="Reputação (0–10). Abaixo de 3, suas ações perdem força.">⭐ ${j.rep}</span>
          <span title="Popularidade: apoio que você gerou na campanha">👥 ${j.pop}</span>
          <span title="Verba de campanha">💰 ${j.verba}</span>
          <span title="Cartas na mão">🃏 ${j.mao.length}</span>
        </div>
      </div>
      ${vez ? '<div class="cand-vez">NA VEZ</div>' : ''}
    </div>`;
  }

  function viesBar(v) {
    const pct = 50 + Math.max(-1, Math.min(1, v / C.LIMIAR_VIES)) * 50;
    return `<div class="vies" title="Viés acumulado: alcance extra dado a um grupo em relação ao outro. Em ±${C.LIMIAR_VIES}, estoura escândalo.">
      <span class="forma-Q">■</span><div class="vies-trilho"><i class="vies-zona"></i><b style="left:${pct}%"></b></div><span class="forma-T">▲</span>
      <small>viés ${v > 0 ? '+' + v + ' ■' : v < 0 ? Math.abs(v) + ' ▲' : '0'}</small></div>`;
  }

  function cartaoAlgoritmo() {
    const a = S.alg;
    const algJ = S.jogadores.find((x) => x.tipo === 'algoritmo');
    return `
    <div class="cand cand-A ${S.fase === 'algoritmo' ? 'vez' : ''}">
      <div class="cand-av"><span class="av-alg">🤖</span></div>
      <div class="cand-info">
        <b>O Algoritmo</b>
        <small>Sistema de recomendação · <i>${esc(algJ.nome)}</i></small>
        <div class="cand-stats"><span>📈 ${a.engajamento}</span><span>🃏 ${a.mao.length}</span>${a.escandalos ? `<span>🚨 ${a.escandalos}</span>` : ''}${a.penalidade ? `<span class="alerta">⚖️ −${a.penalidade} alcance</span>` : ''}</div>
        ${viesBar(a.vies)}
      </div>
      ${S.fase === 'algoritmo' ? '<div class="cand-vez">NA VEZ</div>' : ''}
    </div>`;
  }

  function postPublico(p) {
    const c = BE.CARTA[p.cartaId];
    const autor = p.autor ? E.jogador(S, p.autor) : null;
    const alvoPost = U.modo === 'carta' && U.sel && BE.CARTA[selCarta().id].alvo === 'post' && !p.removido && !p.checado;
    const rev = p.revelado || p.removido;
    let status = '';
    if (p.removido) status = `<span class="post-status st-rem">❌ Removido · ${BE.VERACIDADE[c.veracidade].rotulo}</span>`;
    else if (p.checado) status = `<span class="post-status st-ok">✔ Checado · ${BE.VERACIDADE[c.veracidade].rotulo}</span>`;
    return `
    <div class="post post-${p.grupo} ${p.removido ? 'removido' : ''} ${alvoPost ? 'alvo' : ''}" ${alvoPost ? `data-acao="alvo-post" data-post="${p.id}" tabindex="0" role="button"` : ''}>
      <div class="post-topo">${forma(p.grupo)} <b>${autor ? esc(autor.def.nome) : 'Simpatizantes'}</b> <span class="chip">📍 ${nomeR(p.regiao)}</span>${p.zap ? '<span class="chip chip-zap">📱 Zap</span>' : ''}</div>
      <div class="post-manchete">${esc(c.manchete)}</div>
      <div class="post-rodape">${c.pauta ? BE.PAUTAS[c.pauta].icone : '✳️'} ${status || (rev ? '' : '<span class="post-status st-q">veracidade: ?</span>')}</div>
    </div>`;
  }

  /* ---------------------------- doca (mão privada) ----------------------- */
  function selCarta() {
    const j = atualJ();
    return j && j.mao.find((m) => m.uid === U.sel);
  }

  function alvosDoModo() {
    if (!S || !U.privado) return [];
    const j = atualJ();
    if (!j) return [];
    if (U.modo === 'panfletar') return RIDS.slice();
    if (U.modo === 'carta' && U.sel) {
      const c = selCarta();
      if (!c) return [];
      const d = BE.CARTA[c.id];
      if (d.tipo === 'noticia' || d.alvo === 'regiao') return E.alvosValidos(S, j, c);
    }
    return [];
  }

  function bannerModo() {
    if (!U.privado || !atualJ()) return '';
    if (U.modo === 'panfletar') return `<div class="banner-modo">🧾 Clique na região onde vai panfletar (+1). <button class="btn btn-peq btn-sec" data-acao="cancelar">Cancelar</button></div>`;
    if (U.modo === 'trocar') return `<div class="banner-modo">♻️ Clique na carta da sua mão que quer trocar (R$ 1). <button class="btn btn-peq btn-sec" data-acao="cancelar">Cancelar</button></div>`;
    if (U.modo === 'carta' && U.sel) {
      const d = BE.CARTA[selCarta().id];
      if (d.tipo === 'noticia') return `<div class="banner-modo">📰 Clique na região que a notícia vai mirar. <button class="btn btn-peq btn-sec" data-acao="cancelar">Cancelar</button></div>`;
      if (d.alvo === 'regiao') return `<div class="banner-modo">${BE.TIPOS_CARTA[d.tipo].icone} Clique na região para jogar <b>${esc(d.nome)}</b>. <button class="btn btn-peq btn-sec" data-acao="cancelar">Cancelar</button></div>`;
      if (d.alvo === 'post') return `<div class="banner-modo">🔎 Clique num post do Feed (à direita) para checar. <button class="btn btn-peq btn-sec" data-acao="cancelar">Cancelar</button></div>`;
    }
    return '';
  }

  function doca(j) {
    if (S.fase === 'campanha' && j && U.privado) return docaCandidato(j);
    let txt = '';
    if (S.fase === 'campanha' && j) txt = `Vez de <b>${esc(j.def.nome)}</b> ${forma(j.grupo)} (${esc(j.nome)}).`;
    else if (S.fase === 'algoritmo') txt = 'O Algoritmo está decidindo o que você vai ver… 🤖';
    else if (S.fase === 'reacao') txt = 'A população está reagindo ao Feed.';
    else txt = FASES[S.fase] || '';
    return `<section class="doca doca-publica"><p>${txt}</p></section>`;
  }

  function docaCandidato(j) {
    const missao = BE.MISSAO[j.missao];
    const prog = E.checarMissao(S, j);
    const sel = selCarta();
    return `
    <section class="doca doca-${j.grupo}">
      <div class="doca-topo">
        <div class="doca-quem">${forma(j.grupo, 'grande')}<div><b>${esc(j.def.nome)}</b><small>${BE.GRUPOS[j.grupo].nome} · ${BE.ARQUETIPOS[j.def.arquetipo].nome} · ${esc(j.nome)}</small></div></div>
        <div class="doca-rec">
          <span title="Verba">💰 <b>R$ ${j.verba}</b> <small>(+${j.turno.renda} nesta semana)</small></span>
          <span title="Cartas jogadas neste turno">🃏 <b>${j.turno.cartas}/${C.CARTAS_POR_TURNO}</b> jogadas</span>
          <span title="Reputação">⭐ <b>${j.rep}</b></span>
          ${j.turno.zap ? '<span class="chip chip-zap">📱 Próxima notícia vai pelo Zap</span>' : ''}
        </div>
        <div class="doca-acoes">
          <button class="btn btn-peq btn-sec ${U.missao ? 'ativo' : ''}" data-acao="ver-missao">🕵️ Missão secreta</button>
          <button class="btn btn-peq btn-sec" data-acao="panfletar" ${j.turno.panfletou ? 'disabled' : ''} title="Ação gratuita: +1 de apoio em uma região, uma vez por turno">🧾 Panfletar +1</button>
          <button class="btn btn-peq btn-sec" data-acao="trocar" ${j.turno.trocou || j.verba < 1 ? 'disabled' : ''} title="Descarte 1 carta e compre outra por R$ 1, uma vez por turno">♻️ Trocar carta</button>
          <button class="btn btn-peq" data-acao="encerrar-turno">Encerrar turno ✓</button>
        </div>
      </div>
      ${U.missao ? `<div class="missao-box"><b>🕵️ ${esc(missao.nome)}</b> ${esc(missao.desc)}<div class="missao-prog">${prog.ok ? '✅ Cumprindo agora' : '⏳ Ainda não'} · ${esc(prog.prog)}</div><small>Sua equipe ganha a eleição junta, mas a missão é só sua. Não mostre para ninguém!</small></div>` : ''}
      ${sel ? detalheCarta(j, sel) : ''}
      <div class="mao">${j.mao.map((m) => cartaHTML(m, j)).join('')}</div>
    </section>`;
  }

  function cartaHTML(m, j, extra) {
    const d = BE.CARTA[m.id];
    const erro = j ? E.podeJogar(S, j, m) : null;
    const sel = U.sel === m.uid;
    const tipo = BE.TIPOS_CARTA[d.tipo];
    const custo = S ? E.custo(S, d) : d.custo;
    let corpo;
    if (d.tipo === 'noticia') {
      const v = BE.VERACIDADE[d.veracidade];
      const modo = d.modo === 'promo' ? '⬆ promove seu grupo' : d.modo === 'ataque' ? '⬇ ataca o adversário' : '✖ voto de protesto';
      corpo = `
        <div class="carimbo ${v.cls}">${v.rotulo}</div>
        <div class="carta-manchete">${esc(d.manchete)}</div>
        <div class="carta-stats"><span title="Efeito base">💪 ${d.efeito}</span><span title="Viralidade">🔥 ${d.viral}</span><span class="carta-modo">${modo}</span></div>
        <div class="carta-pe">${pautaTag(d.pauta)} <span class="selo-${d.selo}">${d.selo === 'fato' ? '📚 Fato histórico' : '🎭 Ficção do jogo'}</span></div>`;
    } else {
      corpo = `
        <div class="carta-nome">${esc(d.nome)}</div>
        <div class="carta-desc">${esc(d.desc)}</div>`;
    }
    const acao = U.modo === 'trocar' ? 'trocar-carta' : 'sel-carta';
    return `
    <button class="carta carta-${d.tipo} ${sel ? 'sel' : ''} ${erro && U.modo !== 'trocar' ? 'indisponivel' : ''} ${extra || ''}" data-acao="${acao}" data-uid="${m.uid}" title="${erro ? esc(erro) : ''}">
      <div class="carta-topo"><span>${tipo.icone} ${tipo.curto}</span><span class="moeda" title="Custo">R$${custo}</span></div>
      ${corpo}
    </button>`;
  }

  function detalheCarta(j, m) {
    const d = BE.CARTA[m.id];
    const erro = E.podeJogar(S, j, m);
    const precisaAlvo = d.tipo === 'noticia' || d.alvo === 'regiao' || d.alvo === 'post';
    let instr = '';
    if (erro) instr = `<span class="aviso">⚠ ${esc(erro)}</span>`;
    else if (precisaAlvo) instr = d.alvo === 'post' ? '👉 Clique num post do Feed.' : '👉 Clique numa região destacada no mapa.';
    else instr = `<button class="btn" data-acao="jogar-sel">Jogar ${esc(d.nome)} (R$ ${E.custo(S, d)})</button>`;
    let texto;
    if (d.tipo === 'noticia') {
      texto = `<b>${BE.VERACIDADE[d.veracidade].rotulo}</b>: ${esc(d.explicacao)}${d.fonte ? ` <i>Fonte: ${esc(d.fonte)}.</i>` : ''}
        <br><small>Vai para o Feed com a manchete visível e a veracidade escondida. O Algoritmo decide o alcance. ${d.veracidade === 'falsa' || d.veracidade === 'enganosa' ? 'Pode ser desmascarada pela população (dado + resistência da região) ou por checagem: aí o tiro sai pela culatra.' : ''}</small>`;
    } else texto = esc(d.desc);
    return `<div class="detalhe"><div class="detalhe-txt">${texto}</div><div class="detalhe-acao">${instr} <button class="btn btn-peq btn-sec" data-acao="cancelar">✕</button></div></div>`;
  }

  /* ============================ CAMADA (modais) ========================= */
  function renderCamada() {
    let html = '';
    if (U.modal === 'regras') html = modalRegras();
    else if (U.modal === 'historico') html = modalHistorico();
    else if (U.modal === 'sair') html = modalSair();
    else if (U.tela === 'jogo' && S) {
      if (S.fase === 'evento') html = modalEvento();
      else if (S.fase === 'trending') html = modalTrending();
      else if ((S.fase === 'campanha' || S.fase === 'algoritmo') && !U.privado) html = cortina();
      else if (S.fase === 'algoritmo') html = painelAlgoritmo();
      else if (S.fase === 'reacao') html = painelReacao();
      else if (S.fase === 'consequencias') html = modalConsequencias();
    }
    if (U.algEscolha && S && S.fase === 'algoritmo' && U.privado) html += modalEscolhaAlg();
    camada.innerHTML = html;
    camada.className = html ? 'ativa' : '';
  }

  function modalEvento() {
    const ev = S.evento;
    return `
    <div class="fundo"><div class="modal modal-evento">
      <div class="ev-semana">Semana ${S.rodada} de ${C.RODADAS}</div>
      <div class="ev-carta">
        <div class="ev-ico-g">${ev.icone}</div>
        <div class="ev-tipo">EVENTO</div>
        <h2>${esc(ev.nome)}</h2>
        <p>${esc(ev.texto)}</p>
        <div class="ev-edu">📚 ${esc(ev.edu)}</div>
      </div>
      <p class="ev-seq">Nesta semana: <b>1.</b> Algoritmo escolhe o assunto → <b>2.</b> cada candidato faz campanha → <b>3.</b> Algoritmo distribui o Feed → <b>4.</b> a população reage → <b>5.</b> consequências.</p>
      <button class="btn btn-grande" data-acao="evento-ok">Continuar ▶</button>
    </div></div>`;
  }

  function modalTrending() {
    const algJ = S.jogadores.find((x) => x.tipo === 'algoritmo');
    return `
    <div class="fundo"><div class="modal modal-trending tema-alg">
      <h2>🤖 ${esc(algJ.nome)}, escolha o assunto do momento</h2>
      <p>Esta escolha é pública. Notícias dessa pauta ganham <b>+1 de viralidade</b> e <b>+1 de efeito</b> nesta semana. Os candidatos vão ajustar a campanha ao que está em alta.</p>
      <div class="trend-opcoes">
        ${S.trendingOpcoes.map((p) => `<button class="trend-btn" data-acao="escolher-trending" data-pauta="${p}"><span>${BE.PAUTAS[p].icone}</span>${BE.PAUTAS[p].nome}<small>${RIDS.filter((r) => S.regioes[r].pauta === p).map(nomeR).join(', ') || '—'} valoriza esta pauta</small></button>`).join('')}
      </div>
    </div></div>`;
  }

  function cortina() {
    const alg = S.fase === 'algoritmo';
    const j = alg ? S.jogadores.find((x) => x.tipo === 'algoritmo') : atualJ();
    const quem = alg ? 'O Algoritmo' : j.def.nome;
    const g = alg ? 'A' : j.grupo;
    return `
    <div class="cortina cortina-${g}">
      <div class="cortina-conteudo">
        <div class="cortina-forma">${alg ? '🤖' : BE.GRUPOS[g].forma}</div>
        <p class="cortina-passe">Passe o computador para</p>
        <h2>${esc(j.nome)}</h2>
        <p class="cortina-papel">${esc(quem)}${alg ? '' : ` · ${BE.GRUPOS[g].nome}`}</p>
        <p class="cortina-aviso">🔒 O que vem a seguir é privado: mão de cartas e missão secreta. Os outros jogadores devem desviar o olhar.</p>
        <button class="btn btn-grande" data-acao="revelar">Sou eu, pode mostrar 👀</button>
      </div>
    </div>`;
  }

  /* ---------------------------- painel do Algoritmo --------------------- */
  const NIVEIS = ['Enterrar', 'Normal', 'Impulsionar', 'Viralizar', 'Explodir'];

  function painelAlgoritmo() {
    const a = S.alg;
    const algJ = S.jogadores.find((x) => x.tipo === 'algoritmo');
    const livres = E.pontosLivres(S);
    let dq = 0, dt = 0, prev = 0;
    S.feed.forEach((p) => {
      if (p.zap || p.removido) return;
      if (p.grupo === 'Q') dq += p.alcance - 1; else dt += p.alcance - 1;
      prev += p.alcance * E.viralidade(S, p);
    });
    const viesNovo = a.vies + dq - dt;
    const missao = BE.MISSAO[algJ.missao];
    const prog = E.checarMissao(S, algJ);
    const posts = S.feed.map((p) => postAlg(p)).join('') || '<p class="vazio">Nenhum post nesta semana.</p>';
    return `
    <div class="alg-painel">
      <header class="alg-topo">
        <div class="alg-marca">🤖 <b>PAINEL DO ALGORITMO</b><small>Semana ${S.rodada} · ${esc(algJ.nome)}</small></div>
        <div class="alg-kpis">
          <div class="kpi ${livres === 0 ? 'zerado' : ''}"><small>Pontos de alcance</small><b>${livres}<span>/${a.pontos}</span></b></div>
          <div class="kpi"><small>Engajamento previsto</small><b>+${prev}</b></div>
          <div class="kpi ${Math.abs(viesNovo) >= C.LIMIAR_VIES ? 'perigo' : Math.abs(viesNovo) >= C.LIMIAR_VIES - 2 ? 'atencao' : ''}"><small>Viés após esta semana</small><b>${viesNovo > 0 ? '+' + viesNovo + ' ■' : viesNovo < 0 ? Math.abs(viesNovo) + ' ▲' : '0'}</b></div>
          <div class="kpi"><small>Engajamento total</small><b>${a.engajamento}</b></div>
        </div>
        <button class="btn btn-grande btn-alg" data-acao="alg-confirmar">Distribuir Feed ▶</button>
      </header>
      <div class="alg-corpo">
        <section class="alg-feed">
          <h3>Fila de recomendação <small>Você vê a manchete e o quanto engaja. A veracidade, não.</small></h3>
          ${posts}
        </section>
        <aside class="alg-lado">
          <div class="alg-bloco">
            <h4>🕵️ Missão secreta: ${esc(missao.nome)}</h4>
            <p>${esc(missao.desc)}</p>
            <p class="missao-prog">${prog.ok ? '✅ Cumprindo agora' : '⏳ Ainda não'} · ${esc(prog.prog)}</p>
          </div>
          <div class="alg-bloco">
            <h4>🃏 Suas cartas <small>${a.cartaJogada ? 'já jogou nesta semana' : '1 por semana'}</small></h4>
            <div class="alg-cartas">${a.mao.map((m) => { const d = BE.CARTA_ALG[m.id]; return `<button class="carta-alg" data-acao="alg-carta" data-uid="${m.uid}" ${a.cartaJogada ? 'disabled' : ''}><b>${esc(d.nome)}</b><small>${esc(d.desc)}</small></button>`; }).join('') || '<p class="vazio">Sem cartas.</p>'}</div>
          </div>
          <div class="alg-bloco">
            <h4>🗺️ Regiões</h4>
            <table class="alg-reg"><thead><tr><th></th><th>■</th><th>▲</th><th>🫧</th><th>🛡</th><th title="Alcance acumulado">📡</th></tr></thead><tbody>
            ${RIDS.map((id) => { const r = S.regioes[id]; return `<tr><td>${nomeR(id)} <small>${BE.REGIOES[id].votos}%</small></td><td>${r.q}</td><td>${r.t}</td><td>${r.bolha.nivel ? r.bolha.nivel + BE.GRUPOS[r.bolha.lado].forma : '—'}</td><td>${r.resist}</td><td>${r.alcanceTotal}</td></tr>`; }).join('')}
            </tbody></table>
          </div>
          <div class="alg-bloco alg-regras">
            <h4>⚙️ Como funciona</h4>
            <ul>
              <li>Todo post começa com alcance 1. Subir cada nível custa 1 ponto; enterrar (0) custa 1.</li>
              <li><b>Engajamento = alcance × viralidade.</b> Mais alcance também multiplica o efeito no mapa.</li>
              <li>Impulsionar (2+) um grupo numa região faz a bolha crescer para esse lado.</li>
              <li>Dar mais alcance a um grupo que ao outro acumula <b>viés</b>. Em ±${C.LIMIAR_VIES}: escândalo.</li>
              <li>Confiança ≤ 3 abre CPI das plataformas: −2 de alcance na semana seguinte.</li>
              <li>Mensagens 📱 do Zap estão fora do seu controle (e não geram engajamento para você).</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>`;
  }

  function postAlg(p) {
    const c = BE.CARTA[p.cartaId];
    const autor = p.autor ? E.jogador(S, p.autor) : null;
    const v = E.viralidade(S, p);
    const conhecido = p.moderado || p.checado || p.removido;
    const ver = conhecido ? `<span class="carimbo-mini ${BE.VERACIDADE[c.veracidade].cls}">${BE.VERACIDADE[c.veracidade].rotulo}</span>` : '<span class="carimbo-mini v-desc">? veracidade desconhecida</span>';
    let ctrl;
    if (p.removido) ctrl = '<div class="alg-bloq">❌ Removido pela checagem</div>';
    else if (p.zap) ctrl = '<div class="alg-bloq">📱 Circula no WhatsApp: fora do seu controle</div>';
    else if (p.shadow) ctrl = '<div class="alg-bloq">🔇 Shadowban aplicado</div>';
    else {
      ctrl = `<div class="alcance">${NIVEIS.map((n, i) => `<button class="nv ${p.alcance === i ? 'on' : ''} nv-${i}" data-acao="alg-alc" data-post="${p.id}" data-v="${i}" title="${n}">${i}<small>${n}</small></button>`).join('')}</div>`;
    }
    const eng = p.removido || p.zap ? 0 : p.alcance * v;
    return `
    <div class="alg-post post-${p.grupo} ${p.removido ? 'removido' : ''}">
      <div class="alg-post-info">
        <div class="post-topo">${forma(p.grupo)} <b>${autor ? esc(autor.def.nome) : 'Simpatizantes'}</b> <span class="chip">📍 ${nomeR(p.regiao)}</span> ${c.pauta ? `<span class="chip">${BE.PAUTAS[c.pauta].icone} ${BE.PAUTAS[c.pauta].nome}</span>` : ''} ${ver}</div>
        <div class="post-manchete">${esc(c.manchete)}</div>
      </div>
      <div class="alg-post-num"><span title="Viralidade">🔥 ${v}</span><span title="Engajamento previsto">📈 ${eng}</span></div>
      ${ctrl}
    </div>`;
  }

  function modalEscolhaAlg() {
    const m = S.alg.mao.find((x) => x.uid === U.algEscolha.uid);
    if (!m) return '';
    const d = BE.CARTA_ALG[m.id];
    const e = U.algEscolha;
    let corpo = '';
    const btn = (acao, attrs, txt, on) => `<button class="opc ${on ? 'on' : ''}" data-acao="${acao}" ${attrs}>${txt}</button>`;
    if (d.alvo === 'nenhum') corpo = '';
    if (d.alvo === 'regiao' || d.alvo === 'regiao+grupo') corpo += `<h4>Região</h4><div class="opcs">${RIDS.map((id) => btn('alg-opc', `data-k="regiao" data-v="${id}"`, nomeR(id), e.regiao === id)).join('')}</div>`;
    if (d.alvo === 'regiao+grupo') corpo += `<h4>Grupo</h4><div class="opcs">${['Q', 'T'].map((g) => btn('alg-opc', `data-k="grupo" data-v="${g}"`, `${BE.GRUPOS[g].forma} ${BE.GRUPOS[g].nome}`, e.grupo === g)).join('')}</div>`;
    if (d.alvo === 'pauta') corpo += `<h4>Pauta</h4><div class="opcs">${Object.keys(BE.PAUTAS).map((p) => btn('alg-opc', `data-k="pauta" data-v="${p}"`, `${BE.PAUTAS[p].icone} ${BE.PAUTAS[p].nome}`, e.pauta === p)).join('')}</div>`;
    if (d.alvo === 'post') corpo += `<h4>Post</h4><div class="opcs opcs-col">${S.feed.filter((p) => !p.removido && !(d.id === 'shadowban' && p.zap)).map((p) => btn('alg-opc', `data-k="post" data-v="${p.id}"`, `${BE.GRUPOS[p.grupo].forma} ${esc(BE.CARTA[p.cartaId].manchete)} <small>(${nomeR(p.regiao)})</small>`, e.post === p.id)).join('')}</div>`;
    return `
    <div class="fundo fundo-top"><div class="modal tema-alg">
      <h2>🃏 ${esc(d.nome)}</h2><p>${esc(d.desc)}</p>
      ${corpo}
      <div class="modal-botoes"><button class="btn btn-sec" data-acao="alg-cancelar">Cancelar</button><button class="btn btn-alg" data-acao="alg-usar">Usar carta</button></div>
    </div></div>`;
  }

  /* ---------------------------- reação da população --------------------- */
  function painelReacao() {
    const R = U.reacao || (U.reacao = { lista: [], atual: null, fim: false });
    const total = R.lista.length + S.fila.length;
    let corpo;
    if (!R.atual && !R.fim) {
      corpo = `<div class="reac-intro"><p>${total} post(s) vão chegar às pessoas. Para cada um: revelamos a veracidade, rolamos o dado da checagem popular (para conteúdos falsos) e aplicamos o efeito no mapa.</p></div>`;
    } else if (R.fim) {
      const circ = R.lista.filter((r) => r.status === 'circulou').length;
      const desm = R.lista.filter((r) => r.status === 'desmascarado' || r.status === 'removido').length;
      corpo = `<div class="reac-fim"><h3>Fim do Feed da semana</h3><p>${circ} post(s) circularam, ${desm} foram desmentidos ou removidos.</p>
        <ul class="reac-resumo">${R.lista.map((r) => `<li class="rs-${r.status}">${forma(r.grupo)} <span>${esc(r.carta.manchete)}</span> <b>${resumoStatus(r)}</b></li>`).join('')}</ul></div>`;
    } else corpo = cartaReacao(R.atual);
    const botoes = R.fim
      ? '<button class="btn btn-grande" data-acao="ver-consequencias">Ver consequências ▶</button>'
      : `<button class="btn btn-sec" data-acao="reacao-tudo">Revelar tudo ⏭</button><button class="btn btn-grande" data-acao="reacao-proximo">${R.atual || R.lista.length ? 'Próximo post' : 'Revelar primeiro post'} ▶</button>`;
    return `
    <div class="reacao-painel">
      <header><h2>👥 Reação da população</h2><span>${R.lista.length}/${total}</span></header>
      <div class="reac-corpo">${corpo}</div>
      <footer>${botoes}</footer>
    </div>`;
  }

  function resumoStatus(r) {
    if (r.status === 'removido') return '❌ removido';
    if (r.status === 'invisivel') return '🔇 ninguém viu';
    if (r.status === 'desmascarado') return '🎲 desmascarado';
    const c = r.carta;
    return c.modo === 'ataque' ? `−${r.efeito} ${BE.GRUPOS[r.grupo === 'Q' ? 'T' : 'Q'].forma}` : c.modo === 'protesto' ? `−${r.efeito} (protesto)` : `+${r.efeito} ${BE.GRUPOS[r.grupo].forma}`;
  }

  function cartaReacao(r) {
    const c = r.carta;
    const v = BE.VERACIDADE[c.veracidade];
    let grande;
    if (r.status === 'removido') grande = '<div class="reac-big neutro">Removido</div>';
    else if (r.status === 'invisivel') grande = '<div class="reac-big neutro">0 alcance</div>';
    else if (r.status === 'desmascarado') grande = `<div class="reac-big neg">Tiro pela culatra: ${BE.GRUPOS[r.grupo].forma} ${r.efeito}</div>`;
    else grande = `<div class="reac-big ${c.modo === 'ataque' ? 'neg' : 'pos'}">${resumoStatus(r)}</div>`;
    const dado = r.dado ? `<div class="dado-box"><div class="dado">${r.dado.valor}</div><div>+ ${r.dado.mod} <small>(resistência e bônus)</small><br>precisa de ${r.dado.limiar} para desmascarar</div></div>` : '';
    return `
    <div class="reac-carta post-${r.grupo}">
      <div class="post-topo">${forma(r.grupo)} <b>${esc(r.autorNome)}</b> <span class="chip">📍 ${nomeR(r.regiao)}</span>${r.post.zap ? '<span class="chip chip-zap">📱 Zap</span>' : ''}${r.alcance != null ? `<span class="chip">📡 alcance ${r.alcance}</span><span class="chip">🔥 ${r.viral}</span>` : ''}</div>
      <div class="reac-manchete">${esc(c.manchete)}</div>
      <div class="carimbo grande ${v.cls} revelar">${v.rotulo}</div>
      ${dado}
      ${grande}
      <ul class="reac-linhas">${r.linhas.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
      ${r.engaj ? `<div class="reac-eng">📈 +${r.engaj} de engajamento para o Algoritmo</div>` : ''}
      <div class="reac-edu"><b>📚 Por que é ${v.curto.toLowerCase()}?</b> ${esc(c.explicacao)}${c.fonte ? ` <i>Fonte: ${esc(c.fonte)}.</i>` : ''} ${c.selo === 'ficcao' ? '<small>(Notícia fictícia criada para o jogo.)</small>' : ''}</div>
    </div>`;
  }

  function modalConsequencias() {
    const msgs = U.cons || [{ t: 'Consequências aplicadas.', tipo: 'info' }];
    const ultima = S.rodada >= C.RODADAS;
    return `
    <div class="fundo"><div class="modal modal-cons">
      <h2>⚖️ Consequências da semana ${S.rodada}</h2>
      <ul class="cons-lista">${msgs.map((m) => `<li class="cons-${m.tipo}">${esc(m.t)}</li>`).join('')}</ul>
      <div class="cons-ind">
        ${medidor('Polarização', '⚡', S.ind.pol, 'med-pol', '')}
        ${medidor('Confiança', '🤝', S.ind.conf, 'med-conf', '')}
        ${medidor('Desinformação', '🦠', S.ind.desinfo, 'med-des', '')}
      </div>
      <button class="btn btn-grande" data-acao="proxima-semana">${ultima ? '🗳️ Abrir as urnas!' : `Semana ${S.rodada + 1} ▶`}</button>
    </div></div>`;
  }

  function modalHistorico() {
    return `
    <div class="fundo" data-acao="fechar-modal"><div class="modal modal-hist" data-parar>
      <h2>📜 Histórico da partida</h2>
      <div class="hist-lista">${S ? S.log.map((l) => `<p class="log-${l.tipo}"><span>S${l.r}</span>${esc(l.texto)}</p>`).join('') : ''}</div>
      <button class="btn" data-acao="fechar-modal">Fechar</button>
    </div></div>`;
  }

  function modalSair() {
    return `
    <div class="fundo"><div class="modal">
      <h2>Sair da partida?</h2><p>A partida fica salva neste navegador e pode ser retomada pela tela inicial.</p>
      <div class="modal-botoes"><button class="btn btn-sec" data-acao="fechar-modal">Voltar ao jogo</button><button class="btn" data-acao="voltar-inicio">Ir para o início</button></div>
    </div></div>`;
  }

  /* -------------------------------- regras ------------------------------ */
  function modalRegras() {
    return `
    <div class="fundo" data-acao="fechar-modal"><div class="modal modal-regras" data-parar>
      <button class="fechar" data-acao="fechar-modal" aria-label="Fechar">✕</button>
      <h2>Como jogar Bolha Eleitoral</h2>
      <div class="regras-grid">
        <section><h3>🎯 Objetivos</h3>
          <p><b>Quadrados ■</b> e <b>Triângulos ▲</b> (2 candidatos cada) querem vencer a eleição: ganha o grupo com mais votos válidos no país depois de ${C.RODADAS} semanas. A vitória eleitoral é coletiva.</p>
          <p>Cada candidato tem também uma <b>missão secreta</b> individual, que vale pontos mesmo se o grupo perder.</p>
          <p>O <b>Algoritmo 🤖</b> não disputa a eleição: vence se cumprir a própria missão secreta.</p></section>
        <section><h3>🗺️ O mapa</h3>
          <p>Cada região mostra o apoio de ■, de ▲ e os indecisos (?). Quem tiver ${C.LIMIAR_CONTROLE}+ pontos de vantagem <b>controla</b> a região. Controlar 2+ regiões dá +R$1 por turno (4+: +R$2), e a Caravana só avança para regiões vizinhas do seu território.</p>
          <p>O peso de cada região segue a distribuição aproximada do eleitorado. A <b>pauta</b> que a região valoriza e a <b>resistência à desinformação 🛡</b> são sorteadas a cada partida.</p></section>
        <section><h3>📅 Uma semana</h3>
          <ol><li><b>Evento</b>: algo muda o cenário.</li>
          <li><b>Assunto do momento</b>: o Algoritmo escolhe a pauta em alta.</li>
          <li><b>Campanha</b>: cada candidato, na sua vez e em privado, recebe verba, joga até ${C.CARTAS_POR_TURNO} cartas, pode panfletar (+1 grátis) e trocar 1 carta.</li>
          <li><b>Distribuição</b>: o Algoritmo decide o alcance de cada post do Feed.</li>
          <li><b>Reação</b>: os posts chegam às regiões; fakes podem ser desmascaradas.</li>
          <li><b>Consequências</b>: polarização, confiança, viés, regulação.</li></ol></section>
        <section><h3>🃏 Cartas</h3>
          <p><b>📰 Notícias</b> vão para o Feed (todos veem a manchete, ninguém vê a veracidade) e dependem do Algoritmo. Falsas são baratas e fortes, mas podem ser desmascaradas (rolagem de dado + resistência da região) e custar reputação.</p>
          <p><b>📣 Rua</b> age na hora, sem algoritmo. <b>📱 Zap</b> manda notícias por fora do Feed. <b>🔎 Conscientização</b> checa posts, fura bolhas e reduz a polarização.</p></section>
        <section><h3>⚡ Polarização</h3>
          <p>Sobe com sensacionalismo, ataques virais, desinformação e bolhas fechadas. Com 6+, ninguém muda de lado (só os indecisos se movem). Com 7+, os indecisos se radicalizam para quem já domina a região. Com 8+, o diálogo perde força e a mentira engaja ainda mais. Ela não favorece nenhum grupo: favorece quem já está na frente.</p></section>
        <section><h3>🫧 Bolhas e viés</h3>
          <p>Quando o Algoritmo impulsiona um grupo numa região, a bolha cresce para esse lado: conteúdo do mesmo lado ganha força e o do outro lado perde. Dar mais alcance a um grupo acumula <b>viés</b>; em ±${C.LIMIAR_VIES}, estoura um escândalo que pune o Algoritmo.</p></section>
        <section><h3>🔒 Privacidade</h3>
          <p>Todos usam o mesmo computador. Antes de cada turno privado aparece uma tela de “passe o computador”. Só quem joga clica para revelar a própria mão e missão.</p></section>
        <section><h3>🏁 Fim de jogo</h3>
          <p>Depois da semana ${C.RODADAS}, as urnas abrem. Pontos: grupo vencedor +6, missão +5, metade da reputação. Algoritmo: missão +9, +1 a cada 40 de engajamento. Se a confiança pública chegar a 0, a eleição é <b>contestada</b> e todos perdem 2 pontos: ninguém ganha quando a verdade perde.</p></section>
      </div>
    </div></div>`;
  }

  /* --------------------------------- final ------------------------------ */
  function grafico(hist) {
    if (!hist.length) return '';
    const W = 320, H = 120, n = hist.length;
    const x = (i) => (n === 1 ? W / 2 : 20 + (i * (W - 40)) / (n - 1));
    const y10 = (v) => H - 14 - (v / 10) * (H - 28);
    const y100 = (v) => H - 14 - ((v - 30) / 40) * (H - 28);
    const linha = (f, cls) => `<polyline class="${cls}" points="${hist.map((h, i) => `${x(i)},${f(h)}`).join(' ')}"/>`;
    return `<svg class="grafico" viewBox="0 0 ${W} ${H}">
      <line x1="20" x2="${W - 20}" y1="${y100(50)}" y2="${y100(50)}" class="g-meio"/>
      ${linha((h) => y100(h.pq), 'g-q')}${linha((h) => y100(h.pt), 'g-t')}
      ${linha((h) => y10(h.pol), 'g-pol')}${linha((h) => y10(h.conf), 'g-conf')}
      ${hist.map((h, i) => `<text x="${x(i)}" y="${H - 2}" class="g-rot">S${h.r}</text>`).join('')}
    </svg>
    <div class="g-leg"><span class="gl-q">■ % Quadrados</span><span class="gl-t">▲ % Triângulos</span><span class="gl-pol">⚡ polarização</span><span class="gl-conf">🤝 confiança</span></div>`;
  }

  function telaFinal() {
    const f = S.final;
    const g = f.vencedor;
    const st = S.stats;
    const pctDes = st.pontosTotal ? Math.round((st.pontosDesinfo / st.pontosTotal) * 100) : 0;
    const bolhas = RIDS.filter((id) => S.regioes[id].bolha.nivel >= 2).length;
    const ranking = f.jogadores.slice().sort((a, b) => b.pontos - a.pontos);
    const algR = f.jogadores.find((x) => x.tipo === 'algoritmo');
    return `
    <div class="tela-final">
      <section class="final-banner banner-${g}">
        <div class="final-forma">${BE.GRUPOS[g].forma}</div>
        <div>
          <p class="final-sobre">Apuração encerrada · 100% das urnas</p>
          <h1>Os ${BE.GRUPOS[g].nome} vencem a eleição!</h1>
          <p class="final-placar">■ ${f.nacional.pq.toFixed(1)}% × ${f.nacional.pt.toFixed(1)}% ▲ <small>dos votos válidos</small></p>
          ${f.desempate ? `<p><small>${esc(f.desempate)}</small></p>` : ''}
          ${f.contestada ? '<p class="contestada">⚠️ ELEIÇÃO CONTESTADA: a confiança pública chegou a zero. Metade do país não aceita o resultado. Todos perdem 2 pontos.</p>' : ''}
        </div>
      </section>

      <div class="final-grid">
        <section class="final-bloco">
          <h2>🗺️ Resultado por região</h2>
          <div class="final-mapa">${BE.Mapa.svg(S, {})}</div>
        </section>

        <section class="final-bloco">
          <h2>🕵️ Missões reveladas e placar</h2>
          <ol class="ranking">
          ${ranking.map((r) => {
            const j = E.jogador(S, r.pid);
            const m = BE.MISSAO[r.missao];
            const quem = j.tipo === 'algoritmo' ? '<span class="av-alg">🤖</span>' : forma(j.grupo, 'grande');
            const papel = j.tipo === 'algoritmo' ? 'O Algoritmo' : j.def.nome;
            return `<li class="rk ${r.ok ? 'rk-ok' : 'rk-falhou'}">${quem}<div><b>${esc(r.nome)}</b> <small>${esc(papel)}</small><br>
              ${r.ok ? '✅' : '❌'} <b>${esc(m.nome)}</b>: ${esc(m.desc)}<br><small>${esc(r.prog)}</small></div><span class="rk-pts">${r.pontos} pts</span></li>`;
          }).join('')}
          </ol>
          <p class="final-alg">${algR.ok ? '🤖 O Algoritmo cumpriu a missão e também vence.' : '🤖 O Algoritmo não cumpriu a missão.'}</p>
        </section>

        <section class="final-bloco raiox">
          <h2>🩻 Raio-X da desinformação</h2>
          <div class="raiox-grid">
            <div><b>${st.posts}</b><small>posts no Feed e no Zap</small></div>
            <div><b>${st.falsas + st.enganosas}</b><small>eram falsos ou enganosos</small></div>
            <div><b>${st.circularam}</b><small>falsos/enganosos circularam sem ser pegos</small></div>
            <div><b>${st.desmascaradas}</b><small>foram desmascarados</small></div>
            <div><b>${pctDes}%</b><small>do apoio vindo do Feed foi conquistado com desinformação</small></div>
            <div><b>${st.polMax}</b><small>pico de polarização</small></div>
            <div><b>${S.ind.conf}</b><small>confiança pública final</small></div>
            <div><b>${bolhas}</b><small>regiões terminaram dentro de bolhas</small></div>
          </div>
          ${grafico(S.historico)}
        </section>

        <section class="final-bloco reflexao">
          <h2>💬 Para conversar depois da partida</h2>
          ${E.controladas(S, g).length < E.controladas(S, g === 'Q' ? 'T' : 'Q').length ? `<p class="voto-popular">🗳️ Os ${BE.GRUPOS[g].nome} venceram controlando <b>menos regiões</b> que o adversário. No Brasil, a presidência é decidida pelo <b>voto popular</b>: cada voto vale igual, venha de onde vier. Por isso o Sudeste, com 43% do eleitorado, pesa tanto.</p>` : ''}
          <ul>
            <li>Que notícia você teria acreditado se não soubesse a veracidade? Por quê?</li>
            <li>Algoritmo: você impulsionou posts sem saber se eram verdadeiros. O que te guiou: engajamento, missão ou justiça?</li>
            <li>${pctDes >= 30 ? `Quase um terço ou mais do apoio veio de desinformação (${pctDes}%). O vencedor ganhou “de verdade”?` : `Só ${pctDes}% do apoio veio de desinformação. O que segurou as fakes nesta partida?`}</li>
            <li>A polarização ajudou quem já estava na frente. Em que momento ficou impossível convencer o outro lado?</li>
            <li>Os dois grupos tinham as mesmas cartas. Quem usou mais desinformação, e por quê?</li>
          </ul>
        </section>
      </div>
      <div class="final-botoes">
        <button class="btn btn-sec" data-acao="historico">📜 Histórico completo</button>
        <button class="btn btn-grande" data-acao="nova-partida">Nova partida</button>
      </div>
    </div>`;
  }

  /* =============================== AÇÕES =============================== */
  function iniciarPartida() {
    const st = U.setup;
    const cad = st.nomes.map((n, i) => ({ nome: n.trim() || `Jogador(a) ${i + 1}`, papel: st.papeis[i] }));
    S = E.novoJogo(cad);
    E.iniciarRodada(S);
    U.tela = 'jogo';
    U.privado = false;
    U.reacao = null;
    U.cons = null;
    limparSelecao();
  }
  function limparSelecao() {
    U.sel = null;
    U.modo = null;
    U.missao = false;
  }

  function resultado(r) {
    if (!r) return;
    if (r.msg) toast(r.msg, r.ok ? 'ok' : 'erro');
  }

  const ACOES = {
    'ir-setup': () => { novoSetup(); U.tela = 'setup'; },
    'voltar-inicio': () => { U.tela = 'inicio'; U.modal = null; },
    'continuar': () => {
      const sv = carregarSave();
      if (!sv) return;
      S = sv.S;
      U.tela = sv.tela === 'final' ? 'final' : 'jogo';
      U.privado = false;
      U.reacao = sv.reacaoLista ? { lista: sv.reacaoLista, atual: null, fim: !S.fila.length && sv.reacaoLista.length > 0 } : null;
      U.cons = sv.cons;
      limparSelecao();
    },
    'regras': () => { U.modal = 'regras'; },
    'historico': () => { U.modal = 'historico'; },
    'sair': () => { U.modal = 'sair'; },
    'fechar-modal': () => { U.modal = null; },
    'sortear': () => {
      const p = PAPEIS.slice();
      for (let i = p.length - 1; i > 0; i--) { const k = Math.floor(Math.random() * (i + 1)); [p[i], p[k]] = [p[k], p[i]]; }
      U.setup.papeis = p;
    },
    'comecar': iniciarPartida,
    'nova-partida': () => { S = null; novoSetup(); U.tela = 'setup'; U.modal = null; },

    'evento-ok': () => { S.fase = 'trending'; },
    'escolher-trending': (el) => { E.escolherTrending(S, el.dataset.pauta); U.privado = false; },
    'revelar': () => { U.privado = true; limparSelecao(); },

    'sel-carta': (el) => {
      const uid = el.dataset.uid;
      if (U.sel === uid) { limparSelecao(); return; }
      U.sel = uid;
      U.modo = 'carta';
      const j = atualJ();
      const m = selCarta();
      const d = BE.CARTA[m.id];
      if (E.podeJogar(S, j, m)) return;
      if (d.alvo === 'post') { /* aguarda clique no feed */ }
    },
    'jogar-sel': () => {
      const j = atualJ();
      const r = E.jogarCarta(S, j.pid, U.sel, null);
      resultado(r);
      if (r.ok) { U.sel = null; U.modo = null; }
    },
    'cancelar': () => { U.sel = null; U.modo = null; },
    'panfletar': () => { U.sel = null; U.modo = U.modo === 'panfletar' ? null : 'panfletar'; },
    'trocar': () => { U.sel = null; U.modo = U.modo === 'trocar' ? null : 'trocar'; },
    'trocar-carta': (el) => { const j = atualJ(); resultado(E.trocarCarta(S, j.pid, el.dataset.uid)); U.modo = null; },
    'ver-missao': () => { U.missao = !U.missao; },
    'encerrar-turno': () => {
      E.encerrarTurno(S);
      U.privado = false;
      limparSelecao();
    },
    'alvo-regiao': (el) => {
      const id = el.dataset.regiao;
      const j = atualJ();
      if (!U.privado || !j) return;
      if (U.modo === 'panfletar') { resultado(E.panfletar(S, j.pid, id)); U.modo = null; return; }
      if (U.modo === 'carta' && U.sel) {
        const r = E.jogarCarta(S, j.pid, U.sel, id);
        resultado(r);
        if (r.ok) { U.sel = null; U.modo = null; }
      }
    },
    'alvo-post': (el) => {
      const j = atualJ();
      if (!U.sel) return;
      const r = E.jogarCarta(S, j.pid, U.sel, el.dataset.post);
      resultado(r);
      if (r.ok) { U.sel = null; U.modo = null; }
    },

    'alg-alc': (el) => { const r = E.ajustarAlcance(S, el.dataset.post, +el.dataset.v); if (!r.ok && r.msg) toast(r.msg, 'erro'); },
    'alg-carta': (el) => { U.algEscolha = { uid: el.dataset.uid }; },
    'alg-opc': (el) => { U.algEscolha[el.dataset.k] = el.dataset.v; },
    'alg-cancelar': () => { U.algEscolha = null; },
    'alg-usar': () => {
      const e = U.algEscolha;
      const r = E.jogarCartaAlg(S, e.uid, { regiao: e.regiao, grupo: e.grupo, pauta: e.pauta, post: e.post });
      resultado(r);
      if (r.ok) U.algEscolha = null;
    },
    'alg-confirmar': () => {
      E.encerrarAlgoritmo(S);
      U.privado = false;
      U.algEscolha = null;
      U.reacao = { lista: [], atual: null, fim: false };
    },

    'reacao-proximo': () => {
      const R = U.reacao;
      const r = E.resolverProximo(S);
      if (r) { R.lista.push(r); R.atual = r; } else { R.atual = null; R.fim = true; }
      if (!S.fila.length && r === null) R.fim = true;
    },
    'reacao-tudo': () => {
      const R = U.reacao;
      E.resolverTudo(S).forEach((r) => R.lista.push(r));
      R.atual = null;
      R.fim = true;
    },
    'ver-consequencias': () => { U.cons = E.consequencias(S); U.reacao = null; },
    'proxima-semana': () => {
      E.avancar(S);
      U.cons = null;
      U.privado = false;
      limparSelecao();
      if (S.fase === 'apuracao') U.tela = 'final';
    },
  };

  document.addEventListener('click', (ev) => {
    // cliques no mapa
    const reg = ev.target.closest('[data-regiao]');
    if (reg && reg.classList.contains('m-alvo')) {
      ACOES['alvo-regiao'](reg);
      render();
      return;
    }
    const el = ev.target.closest('[data-acao]');
    if (!el) return;
    // fundo do modal fecha só se clicar fora do conteúdo
    if (el.classList.contains('fundo') && ev.target.closest('[data-parar]')) return;
    if (el.disabled) return;
    const fn = ACOES[el.dataset.acao];
    if (!fn) return;
    fn(el);
    render();
  });

  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      if (U.modal) { U.modal = null; render(); }
      else if (U.algEscolha) { U.algEscolha = null; render(); }
      else if (U.sel || U.modo) { U.sel = null; U.modo = null; render(); }
    }
    if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches('[data-regiao].m-alvo, .post.alvo')) {
      ev.preventDefault();
      ev.target.click();
    }
  });

  document.addEventListener('input', (ev) => {
    const el = ev.target;
    if (!U.setup || !el.dataset.campo) return;
    const i = +el.dataset.i;
    if (el.dataset.campo === 'nome') U.setup.nomes[i] = el.value; // sem redesenhar: mantém o foco
  });
  document.addEventListener('change', (ev) => {
    const el = ev.target;
    if (!U.setup || el.dataset.campo !== 'papel') return;
    const i = +el.dataset.i;
    const novo = el.value;
    const j = U.setup.papeis.indexOf(novo);
    // troca de papel com quem estava com ele, para manter a mesa válida
    if (j >= 0 && j !== i) U.setup.papeis[j] = U.setup.papeis[i];
    U.setup.papeis[i] = novo;
    render();
  });

  BE.UI = { render };
  render();
})();
