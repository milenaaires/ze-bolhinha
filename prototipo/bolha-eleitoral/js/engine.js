/* =========================================================================
   BOLHA ELEITORAL — motor de regras.
   Não toca no DOM: recebe e devolve estado. A interface (ui.js) chama
   estas funções e redesenha a tela a partir do estado.
   ========================================================================= */
(function () {
  'use strict';
  const BE = (typeof window !== 'undefined' ? window : globalThis).BE;
  const C = BE.CONFIG;
  const RIDS = BE.REGIAO_IDS;
  const MULT = [0, 1, 1.5, 2, 2.5]; // multiplicador de efeito por nível de alcance
  const ORDEM_BASE = ['q1', 't1', 'q2', 't2'];

  let seq = 1;
  const rnd = (n) => Math.floor(Math.random() * n);
  const d6 = () => 1 + rnd(6);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const outro = (g) => (g === 'Q' ? 'T' : 'Q');
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = rnd(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function montar(defs) {
    const out = [];
    defs.forEach((d) => {
      for (let i = 0; i < (d.copias || 1); i++) out.push({ uid: 'c' + seq++, id: d.id });
    });
    return shuffle(out);
  }

  /* ----------------------------- consultas ----------------------------- */
  const und = (r) => 100 - r.q - r.t;
  function controle(r) {
    const d = r.q - r.t;
    if (d >= C.LIMIAR_CONTROLE) return 'Q';
    if (-d >= C.LIMIAR_CONTROLE) return 'T';
    return null;
  }
  const controladas = (s, g) => RIDS.filter((id) => controle(s.regioes[id]) === g);
  const jogador = (s, pid) => s.jogadores.find((j) => j.pid === pid);
  const candidatos = (s) => s.jogadores.filter((j) => j.tipo === 'candidato');
  const atual = (s) => (s.fase === 'campanha' ? jogador(s, s.ordem[s.turnoIdx]) : null);

  function nacional(s) {
    let q = 0, t = 0, u = 0;
    RIDS.forEach((id) => {
      const r = s.regioes[id], w = BE.REGIOES[id].votos;
      q += (r.q * w) / 100;
      t += (r.t * w) / 100;
      u += (und(r) * w) / 100;
    });
    const v = q + t;
    return { q, t, u, pq: v ? (q / v) * 100 : 50, pt: v ? (t / v) * 100 : 50 };
  }

  function log(s, texto, tipo) {
    s.log.unshift({ r: s.rodada, texto, tipo: tipo || 'info' });
    if (s.log.length > 400) s.log.length = 400;
  }

  /* -------------------------- indicadores ----------------------------- */
  function pol(s, d, motivo) {
    if (!d) return;
    const antes = s.ind.pol;
    s.ind.pol = clamp(s.ind.pol + d, 0, 10);
    s.stats.polMax = Math.max(s.stats.polMax, s.ind.pol);
    if (s.ind.pol !== antes && motivo) log(s, `⚡ Polarização ${d > 0 ? '+' : ''}${s.ind.pol - antes} (${motivo})`, 'ind');
  }
  // Com polarização muito alta, ninguém escuta: reduções valem 1 a menos.
  function reduzPol(s, n, motivo) {
    const eff = s.ind.pol >= 8 ? Math.max(0, n - 1) : n;
    if (eff < n) log(s, '🙉 Com a polarização tão alta, o apelo ao diálogo teve menos efeito.', 'ind');
    pol(s, -eff, motivo);
  }
  function conf(s, d, motivo) {
    if (!d) return;
    const antes = s.ind.conf;
    s.ind.conf = clamp(s.ind.conf + d, 0, 10);
    if (s.ind.conf !== antes && motivo) log(s, `🤝 Confiança pública ${d > 0 ? '+' : ''}${s.ind.conf - antes} (${motivo})`, 'ind');
  }
  function desinfo(s, d) {
    s.ind.desinfo = clamp(s.ind.desinfo + d, 0, 10);
  }
  function rep(s, j, d, motivo) {
    if (!j || !d) return;
    const antes = j.rep;
    j.rep = clamp(j.rep + d, 0, 10);
    if (j.rep !== antes && motivo) log(s, `${d > 0 ? '⭐' : '💢'} ${j.def.nome}: reputação ${d > 0 ? '+' : ''}${j.rep - antes} (${motivo})`, 'rep');
  }

  function moverBolha(s, r, g, n) {
    const b = r.bolha;
    for (let i = 0; i < n; i++) {
      if (!b.lado || b.nivel === 0) {
        b.lado = g;
        b.nivel = 1;
      } else if (b.lado === g) {
        if (b.nivel < 3) {
          b.nivel++;
          if (b.nivel === 3) pol(s, 1, `bolha fechada no ${BE.REGIOES[r.id].nome}`);
        }
      } else {
        b.nivel--;
        if (b.nivel === 0) b.lado = null;
      }
    }
  }
  function furarBolha(r, n) {
    r.bolha.nivel = Math.max(0, r.bolha.nivel - n);
    if (r.bolha.nivel === 0) r.bolha.lado = null;
  }

  /* --------------------------- apoio eleitoral ------------------------- */
  // Ganha primeiro dos indecisos; o que sobrar converte metade do adversário,
  // mas só se a polarização estiver abaixo de 6 (com polarização alta, ninguém
  // muda de lado).
  function ganhar(s, r, g, n, autor) {
    if (n <= 0) return 0;
    const k = g === 'Q' ? 'q' : 't', ok = g === 'Q' ? 't' : 'q';
    const de = Math.min(n, und(r));
    r[k] += de;
    let conv = 0;
    const resto = n - de;
    if (resto > 0 && s.ind.pol < 6) {
      conv = Math.min(r[ok], Math.floor(resto / 2));
      r[ok] -= conv;
      r[k] += conv;
    }
    if (autor) autor.pop += de + conv;
    return de + conv;
  }
  function perder(s, r, g, n, autor) {
    if (n <= 0) return 0;
    const k = g === 'Q' ? 'q' : 't';
    const p = Math.min(n, r[k]);
    r[k] -= p;
    if (autor) autor.pop += Math.ceil(p / 2);
    return p;
  }

  /* ------------------------------ partida ------------------------------ */
  function novoJogo(cadastro) {
    // cadastro: [{nome, papel: 'q1'|'q2'|'t1'|'t2'|'A'}] × 5
    seq = 1;
    const pautas = shuffle(Object.keys(BE.PAUTAS));
    const resist = shuffle([1, 2, 2, 3, 3]);
    const regioes = {};
    RIDS.forEach((id, i) => {
      regioes[id] = { id, q: C.APOIO_INICIAL, t: C.APOIO_INICIAL, pauta: pautas[i], resist: resist[i], bolha: { lado: null, nivel: 0 }, alcanceTotal: 0 };
    });
    const missoes = shuffle(BE.MISSOES_CANDIDATO.map((m) => m.id));
    const missaoAlg = BE.MISSOES_ALGORITMO[rnd(BE.MISSOES_ALGORITMO.length)].id;

    const jogadores = cadastro.map((c, i) => {
      if (c.papel === 'A') {
        return { pid: 'alg', tipo: 'algoritmo', nome: c.nome, missao: missaoAlg };
      }
      const def = BE.CANDIDATOS[c.papel];
      const arq = BE.ARQUETIPOS[def.arquetipo];
      return {
        pid: c.papel, tipo: 'candidato', nome: c.nome, grupo: def.grupo, def, arq,
        verba: arq.verba, rep: C.REPUTACAO_INICIAL, pop: 0, mao: [], missao: missoes[i],
        stats: { posts: 0, fakes: 0, engaj: 0, desmascarou: 0, regioes: {} },
        turno: null,
      };
    });

    const eventos = shuffle(BE.EVENTOS.filter((e) => !e.fixo).map((e) => e.id));

    const s = {
      versao: 1, rodada: 0, fase: 'inicio', regioes, jogadores,
      ordem: ORDEM_BASE.slice(), turnoIdx: 0,
      ind: { pol: 3, conf: 6, desinfo: 2 },
      alg: { engajamento: 0, vies: 0, escandalos: 0, pontos: 0, penalidade: 0, cartaJogada: false, mao: [] },
      baralho: montar(BE.CARTAS), descarte: [],
      baralhoAlg: montar(BE.CARTAS_ALGORITMO), descarteAlg: [],
      eventos, evento: null, trending: null, trendingOpcoes: [],
      feed: [], postSeq: 1, mods: {}, pendentes: [],
      fila: [], resultados: [],
      historico: [], log: [],
      regioesResistentes: RIDS.filter((id) => regioes[id].resist === 3),
      fakesSemanaPassada: [], fakesSemana: [],
      stats: { posts: 0, falsas: 0, enganosas: 0, desmascaradas: 0, circularam: 0, pontosDesinfo: 0, pontosTotal: 0, polMax: 3, semanasPol6: 0, confMin: 6, removidasChecagem: 0, zap: 0 },
    };
    for (let i = 0; i < 2; i++) comprarAlg(s);
    jogadores.filter((j) => j.tipo === 'candidato').forEach((j) => comprarAte(s, j));
    log(s, '🗳️ A campanha vai começar! Quadrados ■ e Triângulos ▲ disputam o país. O Algoritmo observa…', 'marco');
    return s;
  }

  function comprar(s) {
    if (!s.baralho.length) {
      s.baralho = shuffle(s.descarte);
      s.descarte = [];
    }
    return s.baralho.pop();
  }
  function comprarAte(s, j) {
    while (j.mao.length < j.arq.mao) {
      const c = comprar(s);
      if (!c) break;
      j.mao.push(c);
    }
  }
  function comprarAlg(s) {
    if (s.alg.mao.length >= C.MAO_ALGORITMO_MAX) return;
    if (!s.baralhoAlg.length) {
      s.baralhoAlg = shuffle(s.descarteAlg);
      s.descarteAlg = [];
    }
    const c = s.baralhoAlg.pop();
    if (c) s.alg.mao.push(c);
  }

  /* --------------------------- início de rodada ------------------------ */
  function iniciarRodada(s) {
    s.rodada++;
    s.mods = { influencer: {}, robos: {}, viralMod: 0, ruaBonus: 0, alcanceMod: 0 };
    s.feed = [];
    s.trending = null;
    s.fakesSemanaPassada = s.fakesSemana;
    s.fakesSemana = [];
    s.ordem = ORDEM_BASE.slice((s.rodada - 1) % 4).concat(ORDEM_BASE.slice(0, (s.rodada - 1) % 4));
    log(s, `📅 SEMANA ${s.rodada} DE ${C.RODADAS}`, 'marco');

    // promessas vencidas
    s.pendentes = s.pendentes.filter((p) => {
      if (p.rodada !== s.rodada) return true;
      const j = jogador(s, p.pid);
      const r = s.regioes[p.regiao];
      perder(s, r, j.grupo, 2, null);
      log(s, `🧾 A promessa mirabolante de ${j.def.nome} não saiu do papel: −2 no ${BE.REGIOES[p.regiao].nome}.`, 'neg');
      rep(s, j, -1, 'promessa não cumprida');
      return false;
    });

    // evento
    let evId;
    if (s.rodada === 1) evId = 'largada';
    else if (s.rodada === C.RODADAS) evId = 'retafinal';
    else evId = s.eventos.pop() || 'final';
    s.evento = BE.EVENTO[evId];
    aplicarEvento(s, s.evento);

    // opções de assunto do momento
    const ps = shuffle(Object.keys(BE.PAUTAS));
    let opcoes = ps.slice(0, 2);
    if (s.evento.pauta && !opcoes.includes(s.evento.pauta)) opcoes = [s.evento.pauta, ps.find((p) => p !== s.evento.pauta)];
    s.trendingOpcoes = opcoes;

    comprarAlg(s);
    postsOrganicos(s);
    s.fase = 'evento';
  }

  // Simpatizantes de cada grupo publicam por conta própria: o Algoritmo
  // sempre tem conteúdo dos dois lados para decidir.
  function postsOrganicos(s) {
    const noticias = BE.CARTAS.filter((c) => c.tipo === 'noticia');
    ['Q', 'T'].forEach((g) => {
      const c = noticias[rnd(noticias.length)];
      criarPost(s, { autor: null, grupo: g, cartaId: c.id, regiao: RIDS[rnd(RIDS.length)] });
    });
  }

  function criarPost(s, o) {
    const p = Object.assign({ id: 'p' + s.postSeq++, alcance: 1, zap: false, corrente: false, checado: false, removido: false, shadow: false, cascata: false, moderado: false }, o);
    s.feed.push(p);
    s.stats.posts++;
    const c = BE.CARTA[p.cartaId];
    if (c.veracidade === 'falsa') s.stats.falsas++;
    if (c.veracidade === 'enganosa') s.stats.enganosas++;
    return p;
  }

  function aplicarEvento(s, e) {
    const ev = (t) => log(s, `${e.icone} ${e.nome}: ${t}`, 'evento');
    switch (e.id) {
      case 'largada':
      case 'horarioev':
        candidatos(s).forEach((j) => (j.verba = Math.min(C.VERBA_MAX, j.verba + 1)));
        if (e.id === 'horarioev') s.mods.horarioBarato = true;
        ev(e.id === 'largada' ? 'todos recebem +R$ 1.' : 'Horário Eleitoral custa R$ 2 e todos recebem +R$ 1.');
        break;
      case 'retafinal':
        ev('última semana!');
        pol(s, 1, 'reta final');
        break;
      case 'crise':
        RIDS.forEach((id) => { perder(s, s.regioes[id], 'Q', 2); perder(s, s.regioes[id], 'T', 2); });
        ev('cada grupo perde 2 de apoio em todas as regiões.');
        break;
      case 'escandalo': {
        const alvo = candidatos(s).slice().sort((a, b) => b.pop - a.pop || b.rep - a.rep)[0];
        ev(`${alvo.def.nome} estava no topo e virou alvo.`);
        rep(s, alvo, -2, 'escândalo');
        break;
      }
      case 'vazamento': {
        const pids = [...new Set(s.fakesSemanaPassada)];
        ev(pids.length ? 'os prints apareceram.' : 'ninguém foi pego desta vez.');
        pids.forEach((pid) => rep(s, jogador(s, pid), -1, 'vazamento'));
        desinfo(s, -1);
        break;
      }
      case 'debatetv': {
        const med = (g) => { const cs = candidatos(s).filter((j) => j.grupo === g); return cs.reduce((a, j) => a + j.rep, 0) / cs.length; };
        const mq = med('Q'), mt = med('T');
        if (mq === mt) ev('empate técnico na reputação: ninguém ganhou o debate.');
        else {
          const g = mq > mt ? 'Q' : 'T';
          ganhar(s, s.regioes.SE, g, 3);
          ganhar(s, s.regioes.NE, g, 2);
          ev(`${BE.GRUPOS[g].forma} ${BE.GRUPOS[g].nome} saíram melhor (reputação média maior).`);
        }
        pol(s, 1, 'debate virou ringue');
        break;
      }
      case 'investigacao':
        s.mods.investigacao = true;
        ev('checagem reforçada nesta semana.');
        break;
      case 'desastre': {
        const id = RIDS[rnd(RIDS.length)];
        perder(s, s.regioes[id], 'Q', 2);
        perder(s, s.regioes[id], 'T', 2);
        ev(`região atingida: ${BE.REGIOES[id].nome}.`);
        reduzPol(s, 1, 'solidariedade');
        break;
      }
      case 'confianca':
        ev('ninguém acredita em mais nada.');
        conf(s, -2, 'crise de confiança');
        break;
      case 'final':
        s.mods.viralMod = -1;
        ev('viralidade −1 nesta semana.');
        reduzPol(s, 1, 'o país parou para o jogo');
        break;
      case 'apagao':
        s.mods.alcanceMod = -2;
        s.mods.ruaBonus = 1;
        ev('Algoritmo com −2 de alcance; rua com +1.');
        break;
      case 'pesquisa':
        RIDS.forEach((id) => { const g = controle(s.regioes[id]) || (s.regioes[id].q > s.regioes[id].t ? 'Q' : s.regioes[id].t > s.regioes[id].q ? 'T' : null); if (g) ganhar(s, s.regioes[id], g, 1); });
        ev('quem lidera, cresce.');
        break;
      case 'meme':
        s.mods.memeBonus = true;
        ev('sensacionalismo em alta.');
        break;
      case 'virada': {
        const n = nacional(s);
        if (Math.abs(n.pq - n.pt) < 0.5) { ev('empate nacional: nenhuma onda.'); break; }
        const g = n.pq < n.pt ? 'Q' : 'T';
        const k = g === 'Q' ? 'q' : 't', ok = g === 'Q' ? 't' : 'q';
        const alvos = RIDS.slice().sort((a, b) => (s.regioes[a][k] - s.regioes[a][ok]) - (s.regioes[b][k] - s.regioes[b][ok])).slice(0, 2);
        alvos.forEach((id) => ganhar(s, s.regioes[id], g, 2));
        ev(`${BE.GRUPOS[g].forma} ${BE.GRUPOS[g].nome} ganham fôlego em ${alvos.map((id) => BE.REGIOES[id].nome).join(' e ')}.`);
        break;
      }
    }
  }

  function escolherTrending(s, pauta) {
    if (s.fase !== 'trending' && s.fase !== 'evento') return;
    s.trending = pauta;
    log(s, `🔥 O Algoritmo colocou ${BE.PAUTAS[pauta].icone} ${BE.PAUTAS[pauta].nome} nos assuntos do momento.`, 'alg');
    s.fase = 'campanha';
    s.turnoIdx = 0;
    iniciarTurno(s);
  }

  /* ----------------------------- turno do candidato -------------------- */
  function doacao(s, g) {
    const n = controladas(s, g).length;
    return n >= 4 ? 2 : n >= 2 ? 1 : 0;
  }

  function iniciarTurno(s) {
    const j = atual(s);
    const renda = C.RENDA_BASE + doacao(s, j.grupo);
    j.verba = Math.min(C.VERBA_MAX, j.verba + renda);
    comprarAte(s, j);
    j.turno = { cartas: 0, panfletou: false, trocou: false, zap: null, renda };
  }

  function custo(s, c) {
    if (c.id === 'horario' && s.mods.horarioBarato) return 2;
    return c.custo || 0;
  }

  function podeJogar(s, j, carta) {
    const c = BE.CARTA[carta.id];
    if (s.fase !== 'campanha' || atual(s) !== j) return 'Não é a sua vez.';
    if (j.turno.cartas >= C.CARTAS_POR_TURNO) return `Você já jogou ${C.CARTAS_POR_TURNO} cartas neste turno.`;
    if (j.verba < custo(s, c)) return 'Verba insuficiente.';
    if (c.ultimaRodada && s.rodada !== C.RODADAS) return 'Só pode ser usada na última semana.';
    if ((c.acao === 'zap' || c.acao === 'corrente')) {
      if (j.turno.zap) return 'Você já tem uma notícia pronta para o Zap.';
      if (j.turno.cartas >= C.CARTAS_POR_TURNO - 1) return 'Precisa sobrar uma jogada para a notícia.';
      if (!j.mao.some((m) => m.uid !== carta.uid && BE.CARTA[m.id].tipo === 'noticia')) return 'Você não tem notícia na mão para mandar no Zap.';
    }
    if (c.alvo === 'post' && !s.feed.some((p) => !p.removido && !p.checado)) return 'Não há posts para checar no Feed.';
    if (c.restricao === 'adjControle' && !alvosValidos(s, j, carta).length) return 'Seu grupo ainda não controla nenhuma região para expandir.';
    return null;
  }

  function alvosValidos(s, j, carta) {
    const c = BE.CARTA[carta.id];
    if (c.tipo === 'noticia' || c.alvo === 'regiao') {
      if (c.restricao === 'adjControle') {
        const meus = controladas(s, j.grupo);
        return RIDS.filter((id) => meus.some((m) => BE.REGIOES[m].adj.includes(id)));
      }
      return RIDS.slice();
    }
    if (c.alvo === 'post') return s.feed.filter((p) => !p.removido && !p.checado).map((p) => p.id);
    return [];
  }

  function jogarCarta(s, pid, uid, alvo) {
    const j = jogador(s, pid);
    const carta = j.mao.find((m) => m.uid === uid);
    if (!carta) return { ok: false, msg: 'Carta não encontrada.' };
    const erro = podeJogar(s, j, carta);
    if (erro) return { ok: false, msg: erro };
    const c = BE.CARTA[carta.id];
    const precisaAlvo = c.tipo === 'noticia' || c.alvo === 'regiao' || c.alvo === 'post';
    if (precisaAlvo) {
      const val = alvosValidos(s, j, carta);
      if (!val.length) return { ok: false, msg: c.restricao === 'adjControle' ? 'Seu grupo não controla nenhuma região para expandir.' : 'Nenhum alvo válido.' };
      if (!val.includes(alvo)) return { ok: false, msg: 'Alvo inválido.' };
    }
    j.verba -= custo(s, c);
    j.mao = j.mao.filter((m) => m.uid !== uid);
    s.descarte.push(carta);
    j.turno.cartas++;
    const nome = c.nome || c.manchete;
    let msg = '';

    if (c.tipo === 'noticia') {
      const p = criarPost(s, { autor: pid, grupo: j.grupo, cartaId: c.id, regiao: alvo });
      j.stats.posts++;
      j.stats.regioes[alvo] = true;
      if (c.veracidade === 'falsa' || c.veracidade === 'enganosa') { j.stats.fakes++; s.fakesSemana.push(pid); }
      if (j.turno.zap) {
        p.zap = true;
        p.corrente = j.turno.zap === 'corrente';
        p.alcance = 2;
        j.turno.zap = null;
        s.stats.zap++;
        log(s, `📱 ${j.def.nome} mandou uma mensagem nos grupos de família do ${BE.REGIOES[alvo].nome}${p.corrente ? ' (corrente!)' : ''}.`, 'acao');
        msg = 'Notícia enviada pelo Zap: o Algoritmo não controla este post.';
      } else {
        log(s, `📰 ${j.def.nome} publicou no Feed, mirando o ${BE.REGIOES[alvo].nome}.`, 'acao');
        msg = 'Notícia publicada no Feed. Agora depende do Algoritmo.';
      }
      return { ok: true, msg };
    }

    const r = alvo && s.regioes[alvo];
    const bonusRua = (c.tipo === 'rua' ? s.mods.ruaBonus : 0) - (j.rep < 3 ? 1 : 0);
    const bonusUnico = j.def.arquetipo === 'terreno' ? 1 : 0;
    const nomeR = r ? BE.REGIOES[alvo].nome : '';
    switch (c.acao) {
      case 'ganho': {
        const g = ganhar(s, r, j.grupo, c.valor + bonusRua + bonusUnico, j);
        if (c.rep) rep(s, j, c.rep, c.nome);
        msg = `+${g} de apoio no ${nomeR}.`;
        break;
      }
      case 'todas': {
        let tot = 0;
        RIDS.forEach((id) => (tot += ganhar(s, s.regioes[id], j.grupo, c.valor + Math.max(0, bonusRua), j)));
        msg = `+${tot} de apoio somado no país.`;
        break;
      }
      case 'jingle': {
        let tot = ganhar(s, r, j.grupo, c.valor + bonusRua + bonusUnico, j);
        BE.REGIOES[alvo].adj.forEach((id) => (tot += ganhar(s, s.regioes[id], j.grupo, 1, j)));
        msg = `O jingle grudou: +${tot} de apoio somado.`;
        break;
      }
      case 'promessa': {
        const g = ganhar(s, r, j.grupo, c.valor + bonusRua + bonusUnico, j);
        s.pendentes.push({ rodada: s.rodada + 1, pid, regiao: alvo });
        msg = `+${g} de apoio no ${nomeR}. Mas a conta chega semana que vem…`;
        break;
      }
      case 'rep':
        rep(s, j, c.valor, c.nome);
        msg = `Reputação agora: ${j.rep}.`;
        break;
      case 'ilegal': {
        const dado = d6();
        if (dado <= c.risco) {
          rep(s, j, -2, 'flagrado fazendo boca de urna');
          msg = `🎲 ${dado}: FLAGRADO! Efeito anulado.`;
        } else {
          const g = ganhar(s, r, j.grupo, c.valor + bonusRua + bonusUnico, j);
          msg = `🎲 ${dado}: passou batido. +${g} no ${nomeR}.`;
        }
        break;
      }
      case 'zap':
      case 'corrente':
        j.turno.zap = c.acao;
        msg = 'Escolha agora a notícia que vai circular nos grupos.';
        break;
      case 'disparo': {
        const dado = d6();
        conf(s, -1, 'disparo em massa');
        desinfo(s, 1);
        if (dado <= c.risco) {
          rep(s, j, -3, 'disparo em massa flagrado pela Justiça Eleitoral');
          msg = `🎲 ${dado}: FLAGRADO pela Justiça Eleitoral!`;
        } else {
          let tot = 0;
          RIDS.forEach((id) => (tot += ganhar(s, s.regioes[id], j.grupo, c.valor, j)));
          msg = `🎲 ${dado}: os disparos chegaram. +${tot} de apoio somado.`;
        }
        break;
      }
      case 'influencer':
        s.mods.influencer[pid] = true;
        msg = 'Suas notícias desta semana terão +1 de alcance garantido.';
        break;
      case 'robos':
        s.mods.robos[pid] = true;
        desinfo(s, 1);
        msg = 'Robôs ligados: suas notícias parecerão mais virais para o Algoritmo.';
        break;
      case 'checagem': {
        const p = s.feed.find((x) => x.id === alvo);
        const pc = BE.CARTA[p.cartaId];
        if (p.zap && d6() <= 2) {
          msg = 'A mensagem circula em grupos fechados: a checagem não conseguiu rastrear a origem.';
          break;
        }
        if (pc.veracidade === 'falsa' || pc.veracidade === 'enganosa') {
          p.removido = 'checagem';
          p.revelado = true;
          j.stats.desmascarou++;
          s.stats.desmascaradas++;
          s.stats.removidasChecagem++;
          const autor = p.autor && jogador(s, p.autor);
          if (autor) rep(s, autor, -2, 'conteúdo desmentido pela checagem');
          rep(s, j, 1, 'checagem de fatos');
          conf(s, 1, 'checagem de fatos');
          msg = `Desmascarado: era ${BE.VERACIDADE[pc.veracidade].curto.toLowerCase()}. Post removido.`;
          log(s, `🔎 ${j.def.nome} checou “${pc.manchete}”: ${BE.VERACIDADE[pc.veracidade].rotulo}. Removido!`, 'bom');
        } else {
          p.checado = true;
          p.revelado = true;
          msg = pc.veracidade === 'verdadeira' ? 'É verdade! O post ganhou selo ✔ (+1 de efeito).' : 'É verdade, mas exagerado: sensacionalismo não é removido.';
          log(s, `🔎 ${j.def.nome} checou “${pc.manchete}”: ${BE.VERACIDADE[pc.veracidade].rotulo}.`, 'info');
        }
        break;
      }
      case 'jornalismo': {
        let n = 0;
        s.feed.forEach((p) => {
          const pc = BE.CARTA[p.cartaId];
          if (!p.removido && p.regiao === alvo && (pc.veracidade === 'falsa' || pc.veracidade === 'enganosa')) {
            p.removido = 'jornalismo';
            p.revelado = true;
            n++;
            const autor = p.autor && jogador(s, p.autor);
            if (autor) rep(s, autor, -2, 'reportagem investigativa');
          }
        });
        j.stats.desmascarou += n;
        s.stats.desmascaradas += n;
        s.stats.removidasChecagem += n;
        desinfo(s, -1);
        msg = n ? `A reportagem derrubou ${n} conteúdo(s) enganoso(s) no ${nomeR}.` : `A reportagem não encontrou conteúdo falso mirando o ${nomeR}.`;
        log(s, `🗞️ Jornalismo investigativo no ${nomeR}: ${n} post(s) removido(s).`, n ? 'bom' : 'info');
        break;
      }
      case 'educacao':
        r.resist = Math.min(4, r.resist + 1);
        reduzPol(s, 1, 'educação midiática');
        rep(s, j, 1, 'educação midiática');
        msg = `Resistência do ${nomeR} agora é ${r.resist}.`;
        break;
      case 'debate': {
        reduzPol(s, 2, 'debate construtivo');
        ganhar(s, r, 'Q', 1);
        ganhar(s, r, 'T', 1);
        rep(s, j, 1, 'debate construtivo');
        msg = 'Debate de ideias: os dois lados ganharam e a temperatura baixou.';
        break;
      }
      case 'contexto': {
        const antes = r.bolha.nivel;
        furarBolha(r, 2);
        if (antes >= 2) reduzPol(s, 1, 'contextualização');
        msg = `Bolha do ${nomeR}: ${antes} → ${r.bolha.nivel}.`;
        break;
      }
      case 'fontes':
        conf(s, 1, 'fontes confiáveis');
        desinfo(s, -1);
        rep(s, j, 1, 'fontes confiáveis');
        msg = 'Você divulgou fontes confiáveis.';
        break;
    }
    log(s, `${BE.TIPOS_CARTA[c.tipo].icone} ${j.def.nome} jogou ${nome}${nomeR ? ' no ' + nomeR : ''}. ${msg}`, 'acao');
    return { ok: true, msg };
  }

  function panfletar(s, pid, regiao) {
    const j = jogador(s, pid);
    if (atual(s) !== j || j.turno.panfletou) return { ok: false, msg: 'Você já panfletou neste turno.' };
    j.turno.panfletou = true;
    const g = ganhar(s, s.regioes[regiao], j.grupo, 1, j);
    log(s, `🧾 ${j.def.nome} panfletou no ${BE.REGIOES[regiao].nome} (+${g}).`, 'acao');
    return { ok: true, msg: `Panfletagem: +${g}.` };
  }

  function trocarCarta(s, pid, uid) {
    const j = jogador(s, pid);
    if (atual(s) !== j || j.turno.trocou) return { ok: false, msg: 'Você já trocou uma carta neste turno.' };
    if (j.verba < 1) return { ok: false, msg: 'Verba insuficiente.' };
    const carta = j.mao.find((m) => m.uid === uid);
    if (!carta) return { ok: false, msg: 'Carta não encontrada.' };
    j.verba -= 1;
    j.turno.trocou = true;
    j.mao = j.mao.filter((m) => m.uid !== uid);
    s.descarte.push(carta);
    const nova = comprar(s);
    if (nova) j.mao.push(nova);
    return { ok: true, msg: 'Carta trocada.' };
  }

  function encerrarTurno(s) {
    const j = atual(s);
    if (j && j.turno.zap) {
      log(s, `📱 ${j.def.nome} preparou o Zap mas não mandou nada.`, 'info');
      j.turno.zap = null;
    }
    s.turnoIdx++;
    if (s.turnoIdx < s.ordem.length) {
      iniciarTurno(s);
    } else {
      s.fase = 'algoritmo';
      prepararAlgoritmo(s);
    }
  }

  /* ------------------------------ Algoritmo ---------------------------- */
  function prepararAlgoritmo(s) {
    s.alg.pontos = Math.max(2, C.ALCANCE_BASE - s.alg.penalidade + s.mods.alcanceMod);
    s.alg.penalidade = 0;
    s.alg.cartaJogada = false;
    log(s, `🤖 Vez do Algoritmo: ${s.feed.filter((p) => !p.removido).length} posts no Feed, ${s.alg.pontos} pontos de alcance.`, 'alg');
  }

  function custoPost(p) {
    if (p.zap || p.removido || p.shadow) return 0;
    if (p.alcance === 0) return 1;
    return p.alcance - 1;
  }
  const pontosUsados = (s) => s.feed.reduce((a, p) => a + custoPost(p), 0);
  const pontosLivres = (s) => s.alg.pontos - pontosUsados(s);

  function viralidade(s, p) {
    const c = BE.CARTA[p.cartaId];
    const autor = p.autor && jogador(s, p.autor);
    const enganoso = c.veracidade !== 'verdadeira';
    let v = c.viral;
    if (autor && autor.def.arquetipo === 'rede') v += 1;
    if (autor && s.mods.robos[autor.pid] && !s.mods.bots) v += 2;
    if (c.pauta && c.pauta === s.trending) v += 1;
    if (c.pauta && c.pauta === s.mods.trendExtra) v += 2;
    if (enganoso) v += s.ind.pol >= 8 ? 2 : s.ind.pol >= 5 ? 1 : 0;
    if (c.veracidade === 'sensacionalista' && s.mods.memeBonus) v += 2;
    v += s.mods.viralMod || 0;
    return Math.max(0, v);
  }

  function ajustarAlcance(s, postId, valor) {
    const p = s.feed.find((x) => x.id === postId);
    if (!p || p.zap || p.removido || p.shadow) return { ok: false };
    valor = clamp(valor, 0, 4);
    const ant = p.alcance;
    p.alcance = valor;
    if (pontosLivres(s) < 0) {
      p.alcance = ant;
      return { ok: false, msg: 'Pontos de alcance insuficientes.' };
    }
    return { ok: true };
  }

  function jogarCartaAlg(s, uid, alvo) {
    if (s.fase !== 'algoritmo') return { ok: false, msg: 'Não é a vez do Algoritmo.' };
    if (s.alg.cartaJogada) return { ok: false, msg: 'Só 1 carta por semana.' };
    const carta = s.alg.mao.find((m) => m.uid === uid);
    if (!carta) return { ok: false, msg: 'Carta não encontrada.' };
    const c = BE.CARTA_ALG[carta.id];
    alvo = alvo || {};
    let msg = '';
    switch (c.id) {
      case 'bolha': {
        if (!alvo.regiao || !alvo.grupo) return { ok: false, msg: 'Escolha região e grupo.' };
        moverBolha(s, s.regioes[alvo.regiao], alvo.grupo, 1);
        s.alg.vies += alvo.grupo === 'Q' ? 2 : -2;
        msg = `Bolha ${BE.GRUPOS[alvo.grupo].forma} reforçada no ${BE.REGIOES[alvo.regiao].nome}.`;
        break;
      }
      case 'trend':
        if (!alvo.pauta) return { ok: false, msg: 'Escolha a pauta.' };
        s.mods.trendExtra = alvo.pauta;
        msg = `${BE.PAUTAS[alvo.pauta].nome} bombando: +2 de viralidade.`;
        break;
      case 'shadowban': {
        const p = s.feed.find((x) => x.id === alvo.post);
        if (!p || p.zap || p.removido) return { ok: false, msg: 'Escolha um post válido do Feed.' };
        p.alcance = 0;
        p.shadow = true;
        msg = 'Post silenciado. O autor nem vai saber.';
        break;
      }
      case 'moderacao': {
        const vivos = s.feed.filter((p) => !p.removido && !p.moderado).sort((a, b) => viralidade(s, b) - viralidade(s, a)).slice(0, 2);
        vivos.forEach((p) => (p.moderado = true));
        s.alg.engajamento = Math.max(0, s.alg.engajamento - 3);
        msg = `Você agora sabe a veracidade de ${vivos.length} post(s).`;
        break;
      }
      case 'selo':
        s.mods.selo = true;
        conf(s, 1, 'rótulos de contexto');
        msg = 'Conteúdo falso desta semana sai com rótulo.';
        break;
      case 'bots': {
        s.mods.bots = true;
        Object.keys(s.mods.robos).forEach((pid) => rep(s, jogador(s, pid), -2, 'robôs detectados'));
        conf(s, 1, 'detecção de bots');
        msg = Object.keys(s.mods.robos).length ? 'Robôs derrubados!' : 'Nenhum robô encontrado nesta semana.';
        break;
      }
      case 'cascata': {
        const p = s.feed.find((x) => x.id === alvo.post);
        if (!p || p.removido) return { ok: false, msg: 'Escolha um post válido do Feed.' };
        p.cascata = true;
        msg = 'Post recomendado em cascata para as regiões vizinhas.';
        break;
      }
      case 'eco':
        if (!alvo.regiao) return { ok: false, msg: 'Escolha a região.' };
        s.mods.eco = alvo.regiao;
        pol(s, 1, 'câmara de eco');
        msg = `Câmara de eco ligada no ${BE.REGIOES[alvo.regiao].nome}.`;
        break;
      case 'pausa':
        reduzPol(s, 1, 'pausa no app');
        conf(s, 1, 'pausa no app');
        s.alg.engajamento = Math.max(0, s.alg.engajamento - 5);
        msg = 'Usuários fizeram uma pausa.';
        break;
      case 'update':
        RIDS.forEach((id) => furarBolha(s.regioes[id], 1));
        s.alg.vies = s.alg.vies > 0 ? Math.max(0, s.alg.vies - 3) : Math.min(0, s.alg.vies + 3);
        msg = 'Bolhas −1 e viés reduzido.';
        break;
      case 'monetiza':
        s.alg.pontos += 3;
        conf(s, -1, 'monetização agressiva');
        msg = '+3 pontos de alcance nesta semana.';
        break;
    }
    s.alg.mao = s.alg.mao.filter((m) => m.uid !== uid);
    s.descarteAlg.push(carta);
    s.alg.cartaJogada = true;
    log(s, `🤖 O Algoritmo usou ${c.nome}. ${msg}`, 'alg');
    return { ok: true, msg };
  }

  function encerrarAlgoritmo(s) {
    // viés: quanto o Algoritmo empurrou cada grupo acima/abaixo do alcance padrão
    let dq = 0, dt = 0;
    s.feed.forEach((p) => {
      if (p.zap || p.removido) return;
      const d = p.alcance - 1;
      if (p.grupo === 'Q') dq += d;
      else dt += d;
    });
    s.alg.vies += dq - dt;
    s.alg.viesSemana = dq - dt;
    s.fila = s.feed.slice();
    s.resultados = [];
    s.fase = 'reacao';
    log(s, '👥 A população reage ao que viu (e ao que não viu)…', 'marco');
  }

  /* ------------------------- reação da população ------------------------ */
  function aplicarEfeito(s, r, c, g, e, autor) {
    if (c.modo === 'promo') return ganhar(s, r, g, e, autor);
    if (c.modo === 'ataque') return perder(s, r, outro(g), e, autor);
    // protesto: os dois lados perdem para os indecisos
    return perder(s, r, 'Q', e) + perder(s, r, 'T', e);
  }

  function resolverProximo(s) {
    const p = s.fila.shift();
    if (!p) return null;
    const c = BE.CARTA[p.cartaId];
    const r = s.regioes[p.regiao];
    const autor = p.autor && jogador(s, p.autor);
    const res = { post: p, carta: c, regiao: p.regiao, autorNome: autor ? autor.def.nome : `Simpatizantes ${BE.GRUPOS[p.grupo].forma}`, grupo: p.grupo, linhas: [], efeito: 0, engaj: 0, dado: null };

    if (p.removido) {
      res.status = 'removido';
      res.linhas.push(p.removido === 'checagem' ? 'Removido antes de circular pela Checagem de Fatos.' : 'Removido antes de circular pelo Jornalismo Investigativo.');
      s.resultados.push(res);
      return res;
    }

    let alc = p.alcance;
    if (autor && s.mods.influencer[autor.pid] && !p.zap) {
      alc = Math.min(4, Math.max(1, alc) + 1);
      res.linhas.push('🤳 Influenciador contratado: +1 de alcance.');
    }
    const viral = viralidade(s, p);
    res.alcance = alc;
    res.viral = viral;
    const enganoso = c.veracidade === 'falsa' || c.veracidade === 'enganosa';

    let engaj = p.zap ? 0 : alc * viral;
    if (s.mods.selo && enganoso) engaj = Math.floor(engaj / 2);

    if (alc === 0) {
      res.status = 'invisivel';
      res.linhas.push(p.shadow ? '🔇 Shadowban: ninguém viu este post.' : '🔇 O Algoritmo enterrou este post: ninguém viu.');
      s.resultados.push(res);
      return res;
    }

    // tentativa de desmascarar conteúdo falso/enganoso
    if (enganoso) {
      const mod = r.resist + (alc >= 3 ? 1 : 0) + (s.ind.conf >= 7 ? 1 : 0) + (s.mods.investigacao ? 2 : 0) - (p.zap ? 1 : 0);
      const limiar = c.veracidade === 'falsa' ? 7 : 8;
      const dado = d6();
      res.dado = { valor: dado, mod, limiar };
      if (dado + mod >= limiar) {
        res.status = 'desmascarado';
        const perdeu = perder(s, r, p.grupo, 2);
        if (autor) rep(s, autor, -2, 'fake desmascarada pela população');
        s.stats.desmascaradas++;
        res.efeito = -perdeu;
        res.linhas.push(`🎲 ${dado} + ${mod} ≥ ${limiar}: o povo do ${BE.REGIOES[p.regiao].nome} desconfiou e checou. Pegou mal: ${BE.GRUPOS[p.grupo].forma} −${perdeu}.`);
        creditar(s, p, autor, r, alc, engaj, res);
        s.resultados.push(res);
        log(s, `❌ Desmascarado no ${BE.REGIOES[p.regiao].nome}: “${c.manchete}” (${BE.VERACIDADE[c.veracidade].rotulo}).`, 'bom');
        return res;
      }
      res.linhas.push(`🎲 ${dado} + ${mod} < ${limiar}: ninguém checou. O conteúdo colou.`);
    }

    // efeito
    let e = Math.round(c.efeito * MULT[alc]);
    if (c.pauta && c.pauta === r.pauta) { e += 1; res.linhas.push(`${BE.PAUTAS[c.pauta].icone} Pauta que a região valoriza: +1.`); }
    if (c.pauta && c.pauta === s.trending) { e += 1; res.linhas.push('🔥 Assunto do momento: +1.'); }
    if (r.bolha.lado && r.bolha.nivel) {
      if (r.bolha.lado === p.grupo) { e += r.bolha.nivel; res.linhas.push(`🫧 Bolha a favor (confirma o que já acreditam): +${r.bolha.nivel}.`); }
      else { e -= r.bolha.nivel; res.linhas.push(`🫧 Bolha contrária (ninguém quer ouvir): −${r.bolha.nivel}.`); }
    }
    if (s.mods.eco === p.regiao && r.bolha.lado === p.grupo) { e *= 2; res.linhas.push('📢 Câmara de eco: efeito dobrado.'); }
    if (c.veracidade === 'verdadeira') {
      if (p.checado) { e += 1; res.linhas.push('✔ Selo de checagem: +1.'); }
      if (s.ind.conf <= 3) { e -= 1; res.linhas.push('🤨 Confiança pública baixa: ninguém acredita nem no que é verdade (−1).'); }
      if (autor && autor.rep < 3) { e -= 1; res.linhas.push('💢 Reputação do autor muito baixa (−1).'); }
    }
    if (s.mods.selo && enganoso) { e = Math.floor(e / 2); res.linhas.push('🏷️ Rótulo de contexto: efeito pela metade.'); }
    e = Math.max(0, e);

    let total = aplicarEfeito(s, r, c, p.grupo, e, autor);
    const espalhar = p.cascata || p.corrente;
    if (espalhar) {
      const meio = Math.floor(e / 2);
      BE.REGIOES[p.regiao].adj.forEach((id) => (total += aplicarEfeito(s, s.regioes[id], c, p.grupo, meio, autor)));
      if (!p.zap) engaj += Math.floor(engaj / 2);
      res.linhas.push(`${p.corrente ? '🔗 Corrente' : '🌊 Cascata'}: espalhou para ${BE.REGIOES[p.regiao].adj.map((id) => BE.REGIOES[id].nome).join(', ')} (${meio} em cada).`);
    }
    res.efeito = total;
    res.status = 'circulou';
    s.stats.pontosTotal += total;

    // consequências por tipo
    if (c.veracidade === 'falsa') {
      desinfo(s, alc >= 3 ? 2 : 1);
      conf(s, -1);
      s.stats.circularam++;
      s.stats.pontosDesinfo += total;
    } else if (c.veracidade === 'enganosa') {
      desinfo(s, 1);
      if (alc >= 2) conf(s, -1);
      s.stats.circularam++;
      s.stats.pontosDesinfo += total;
    } else if (c.veracidade === 'sensacionalista') {
      if (alc >= 2) { pol(s, 1, 'sensacionalismo viralizou'); res.linhas.push('⚡ Viralizou com indignação: polarização +1.'); }
    } else {
      if (alc >= 3) { conf(s, 1); res.linhas.push('🤝 Informação de qualidade circulando: confiança +1.'); }
      if (c.bonus) {
        if (c.bonus.rep && autor) rep(s, autor, c.bonus.rep);
        if (c.bonus.confianca) conf(s, c.bonus.confianca);
        if (c.bonus.desinfo) desinfo(s, c.bonus.desinfo);
      }
    }
    if (c.modo === 'ataque' && alc >= 3 && total > 0) { pol(s, 1, 'ataque viralizou'); res.linhas.push('⚔️ Ataque viralizou: polarização +1.'); }
    if (alc >= 2 && !p.zap && c.modo !== 'protesto') moverBolha(s, r, p.grupo, 1);

    creditar(s, p, autor, r, alc, engaj, res);
    s.resultados.push(res);
    const sinal = c.modo === 'ataque' ? `−${total} para ${BE.GRUPOS[outro(p.grupo)].forma}` : c.modo === 'protesto' ? `−${total} somado dos dois lados` : `+${total} para ${BE.GRUPOS[p.grupo].forma}`;
    log(s, `${p.zap ? '📱' : '📰'} “${c.manchete}” circulou no ${BE.REGIOES[p.regiao].nome} (${BE.VERACIDADE[c.veracidade].rotulo}): ${sinal}.`, enganoso ? 'neg' : 'info');
    return res;
  }

  function creditar(s, p, autor, r, alc, engaj, res) {
    res.engaj = engaj;
    if (!p.zap) {
      r.alcanceTotal += alc;
      s.alg.engajamento += engaj;
    }
    if (autor) autor.stats.engaj += engaj;
  }

  function resolverTudo(s) {
    const out = [];
    let r;
    while ((r = resolverProximo(s))) out.push(r);
    return out;
  }

  /* ---------------------------- consequências -------------------------- */
  function consequencias(s) {
    const msgs = [];
    const m = (t, tipo) => { msgs.push({ t, tipo: tipo || 'info' }); log(s, t, tipo === 'neg' ? 'neg' : 'ind'); };

    if (s.ind.desinfo >= 4) { pol(s, 1); m('🦠 A desinformação acumulada esquenta os ânimos: polarização +1.', 'neg'); }
    if (s.ind.desinfo >= 5) { conf(s, -1); m('🦠 Tanta mentira circulando corrói a confiança: confiança −1.', 'neg'); }

    if (s.ind.pol >= 7) {
      let tot = 0;
      RIDS.forEach((id) => {
        const r = s.regioes[id];
        if (r.q === r.t) return;
        tot += ganhar(s, r, r.q > r.t ? 'Q' : 'T', 2);
      });
      if (tot) m(`🔥 Radicalização: com polarização ${s.ind.pol}, indecisos escolhem o lado que já domina cada região (${tot} pontos).`, 'neg');
    }

    const v = s.alg.vies;
    if (Math.abs(v) >= C.LIMIAR_VIES) {
      s.alg.escandalos++;
      s.alg.engajamento = Math.max(0, s.alg.engajamento - 8);
      s.alg.vies = 0;
      s.alg.penalidade += 2;
      conf(s, -1);
      m(`🚨 ESCÂNDALO: denúncia de que o Algoritmo favorece os ${BE.GRUPOS[v > 0 ? 'Q' : 'T'].nome}! Engajamento −8, confiança −1 e −2 de alcance na próxima semana.`, 'neg');
    } else if (v !== 0) {
      s.alg.vies += v > 0 ? -1 : 1;
    }

    if (s.ind.conf <= 3) {
      s.alg.penalidade += 2;
      m('⚖️ Confiança pública baixa: o Congresso abre uma CPI das plataformas. Algoritmo com −2 de alcance na próxima semana.', 'neg');
    }
    if (s.ind.conf <= 1) { pol(s, 1); m('🧨 Sem confiança em nada, cada um acredita só no seu lado: polarização +1.', 'neg'); }

    const antes = s.ind.desinfo;
    desinfo(s, -1);
    if (antes > s.ind.desinfo) m('🧹 Parte dos boatos perdeu força com o tempo: desinformação −1.');

    if (s.ind.pol >= 6) s.stats.semanasPol6++;
    s.stats.confMin = Math.min(s.stats.confMin, s.ind.conf);
    const n = nacional(s);
    s.historico.push({ r: s.rodada, pol: s.ind.pol, conf: s.ind.conf, desinfo: s.ind.desinfo, pq: n.pq, pt: n.pt, eng: s.alg.engajamento });
    s.fase = 'consequencias';
    if (!msgs.length) m('😌 Semana sem grandes sobressaltos.');
    return msgs;
  }

  function avancar(s) {
    if (s.rodada >= C.RODADAS) {
      s.fase = 'apuracao';
      s.final = apuracao(s);
      return;
    }
    iniciarRodada(s);
  }

  /* ------------------------------- missões ----------------------------- */
  function checarMissao(s, j) {
    const id = j.missao;
    const ctrl = (r) => controle(s.regioes[r]);
    if (j.tipo === 'algoritmo') {
      const m = BE.MISSAO[id];
      const eng = s.alg.engajamento;
      switch (id) {
        case 'cliques': return { ok: eng >= m.meta && s.ind.conf >= 3, prog: `Engajamento ${eng}/${m.meta} · confiança ${s.ind.conf} (mín. 3)` };
        case 'treta': return { ok: s.stats.semanasPol6 >= 3 && s.stats.polMax < 10, prog: `Semanas com polarização 6+: ${s.stats.semanasPol6}/3 · pico ${s.stats.polMax} (não pode chegar a 10)` };
        case 'guardiao': return { ok: s.ind.conf >= 7 && eng >= m.meta, prog: `Confiança ${s.ind.conf}/7 · engajamento ${eng}/${m.meta}` };
        case 'onipresente': {
          const ok = RIDS.filter((r) => s.regioes[r].alcanceTotal >= m.meta).length;
          return { ok: ok === 5 && Math.abs(s.alg.vies) <= 3 && s.alg.escandalos === 0, prog: `Regiões com alcance ${m.meta}+: ${ok}/5 · viés ${s.alg.vies > 0 ? '+' : ''}${s.alg.vies} · escândalos ${s.alg.escandalos}` };
        }
        case 'novela': {
          const n = nacional(s);
          const d = Math.abs(n.pq - n.pt);
          return { ok: d <= 6 && eng >= m.meta, prog: `Diferença nacional ${d.toFixed(1)} pts (máx. 6) · engajamento ${eng}/${m.meta}` };
        }
      }
      return { ok: false, prog: '' };
    }
    const g = j.grupo;
    const advs = candidatos(s).filter((c) => c.grupo !== g);
    const outros = candidatos(s).filter((c) => c !== j);
    const nome = (r) => BE.REGIOES[r].nome;
    const est = (r) => (ctrl(r) === g ? '✅' : '⬜') + ' ' + nome(r);
    switch (id) {
      case 'nne': return { ok: ctrl('N') === g && ctrl('NE') === g, prog: `${est('N')} · ${est('NE')}` };
      case 'sco': return { ok: ctrl('S') === g && ctrl('CO') === g, prog: `${est('S')} · ${est('CO')}` };
      case 'sudeste': {
        const r = s.regioes.SE;
        const d = g === 'Q' ? r.q - r.t : r.t - r.q;
        return { ok: d >= 8, prog: `Vantagem no Sudeste: ${d > 0 ? '+' : ''}${d} (meta +8)` };
      }
      case 'fichalimpa': return { ok: j.rep >= 8 && j.stats.fakes === 0, prog: `Reputação ${j.rep}/8 · conteúdos enganosos publicados: ${j.stats.fakes} (precisa ser 0)` };
      case 'popular': {
        const max = Math.max(...outros.map((o) => o.pop));
        return { ok: j.pop > max, prog: `Sua popularidade ${j.pop} · maior rival ${max}` };
      }
      case 'cacador': return { ok: j.stats.desmascarou >= 2, prog: `Desmascarados: ${j.stats.desmascarou}/2` };
      case 'resistentes': return { ok: s.regioesResistentes.every((r) => ctrl(r) === g), prog: s.regioesResistentes.map(est).join(' · ') };
      case 'crise': return { ok: advs.every((a) => a.rep <= 4), prog: advs.map((a) => `${a.def.nome}: ${a.rep}`).join(' · ') + ' (meta ≤ 4)' };
      case 'viral': {
        const max = Math.max(...outros.map((o) => o.stats.engaj));
        return { ok: j.stats.engaj > max && j.stats.posts >= 5, prog: `Seu engajamento ${j.stats.engaj} · maior rival ${max} · notícias ${j.stats.posts}/5` };
      }
      case 'pacificador': return { ok: s.ind.pol <= 5 && controladas(s, g).length >= 2, prog: `Polarização ${s.ind.pol} (meta ≤ 5) · regiões controladas ${controladas(s, g).length}/2` };
    }
    return { ok: false, prog: '' };
  }

  /* ------------------------------- apuração ---------------------------- */
  function apuracao(s) {
    const n = nacional(s);
    let vencedor = n.pq > n.pt ? 'Q' : n.pt > n.pq ? 'T' : null;
    let desempate = null;
    if (!vencedor) {
      const rq = candidatos(s).filter((j) => j.grupo === 'Q').reduce((a, j) => a + j.rep, 0);
      const rt = candidatos(s).filter((j) => j.grupo === 'T').reduce((a, j) => a + j.rep, 0);
      vencedor = rq > rt ? 'Q' : rt > rq ? 'T' : (Math.random() < 0.5 ? 'Q' : 'T');
      desempate = 'Empate nos votos: decidido pela soma de reputação.';
    }
    const contestada = s.ind.conf === 0;
    const regioes = RIDS.map((id) => ({ id, ...s.regioes[id], controle: controle(s.regioes[id]) }));
    const jogadores = s.jogadores.map((j) => {
      const m = checarMissao(s, j);
      let pontos = 0;
      if (j.tipo === 'candidato') {
        if (j.grupo === vencedor) pontos += 6;
        if (m.ok) pontos += 5;
        pontos += Math.floor(j.rep / 2);
      } else {
        if (m.ok) pontos += 9;
        pontos += Math.floor(s.alg.engajamento / 40);
      }
      if (contestada) pontos -= 2;
      return { pid: j.pid, nome: j.nome, tipo: j.tipo, missao: j.missao, ok: m.ok, prog: m.prog, pontos };
    });
    return { nacional: n, vencedor, desempate, contestada, regioes, jogadores };
  }

  BE.Engine = {
    novoJogo, iniciarRodada, escolherTrending, iniciarTurno, podeJogar, alvosValidos, jogarCarta, panfletar, trocarCarta, encerrarTurno,
    ajustarAlcance, jogarCartaAlg, encerrarAlgoritmo, pontosLivres, pontosUsados, custoPost, viralidade,
    resolverProximo, resolverTudo, consequencias, avancar, checarMissao, apuracao,
    // consultas
    und, controle, controladas, nacional, jogador, candidatos, atual, custo, doacao, d6,
  };
})();
