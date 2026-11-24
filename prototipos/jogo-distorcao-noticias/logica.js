// Regras da partida do telefone sem fio da desinformação.
// Funções puras: recebem o estado da partida e devolvem um estado novo, sem tocar na tela.
(function (raiz) {
  'use strict';

  const MIN_JOGADORES = 3;
  const MAX_JOGADORES = 6;
  const TAMANHO_MAO = 3;
  const VOLTAS = 2;
  const ALCANCE_INICIAL = 100;
  const FATOR_ALCANCE = 0.3;

  function sortear(lista, aleatorio) {
    return lista[Math.floor(aleatorio() * lista.length)];
  }

  function comprarCarta(mao, tecnicas, aleatorio) {
    const disponiveis = tecnicas.map((t) => t.id).filter((id) => !mao.includes(id));
    return sortear(disponiveis, aleatorio);
  }

  function criarPartida({ nomes, tecnicas, noticia, aleatorio = Math.random }) {
    const limpos = (nomes || []).map((nome) => String(nome).trim());
    if (limpos.length < MIN_JOGADORES || limpos.length > MAX_JOGADORES) {
      throw new Error(`A partida precisa de ${MIN_JOGADORES} a ${MAX_JOGADORES} jogadores.`);
    }
    if (limpos.some((nome) => nome === '')) {
      throw new Error('Todo jogador precisa de um nome.');
    }
    // Os jogadores são chamados pelo nome na passagem e no placar, então nomes iguais confundiriam a partida.
    if (new Set(limpos.map((nome) => nome.toLocaleLowerCase('pt-BR'))).size !== limpos.length) {
      throw new Error('Cada jogador precisa de um nome diferente.');
    }
    if (tecnicas.length <= TAMANHO_MAO) {
      throw new Error('O baralho precisa de mais técnicas do que cartas na mão.');
    }

    const jogadores = limpos.map((nome) => {
      const mao = [];
      while (mao.length < TAMANHO_MAO) mao.push(comprarCarta(mao, tecnicas, aleatorio));
      return { nome, mao };
    });

    return {
      jogadores,
      tecnicas,
      noticia,
      versoes: [],
      totalTurnos: jogadores.length * VOLTAS,
      aleatorio,
    };
  }

  function indiceDaVez(estado) {
    return estado.versoes.length % estado.jogadores.length;
  }

  function jogadorDaVez(estado) {
    return estado.jogadores[indiceDaVez(estado)];
  }

  function maoDaVez(estado) {
    return jogadorDaVez(estado).mao;
  }

  function voltaAtual(estado) {
    return Math.min(Math.floor(estado.versoes.length / estado.jogadores.length) + 1, VOLTAS);
  }

  function partidaTerminou(estado) {
    return estado.versoes.length >= estado.totalTurnos;
  }

  function ultimaVersao(estado) {
    return estado.versoes.at(-1);
  }

  function versaoVisivel(estado) {
    const ultima = ultimaVersao(estado);
    return ultima ? ultima.texto : estado.noticia.texto;
  }

  function alcanceAtual(estado) {
    const ultima = ultimaVersao(estado);
    return ultima ? ultima.alcance : ALCANCE_INICIAL;
  }

  function buscarTecnica(estado, id) {
    return estado.tecnicas.find((t) => t.id === id);
  }

  function jogarTurno(estado, { tecnicaId, texto }) {
    if (partidaTerminou(estado)) throw new Error('A partida já terminou.');

    const indice = indiceDaVez(estado);
    const jogador = estado.jogadores[indice];
    if (!tecnicaId || !jogador.mao.includes(tecnicaId)) {
      throw new Error('Escolha uma carta da sua mão.');
    }
    const textoLimpo = String(texto || '').trim();
    if (textoLimpo === '') throw new Error('Escreva o texto da nova versão.');

    const tecnica = buscarTecnica(estado, tecnicaId);
    // O algoritmo só olha a técnica usada: quanto mais apelativa, mais a notícia se espalha.
    const alcance = Math.round(alcanceAtual(estado) * (1 + tecnica.valor * FATOR_ALCANCE));

    const restante = jogador.mao.filter((id) => id !== tecnicaId);
    const novaMao = [...restante, comprarCarta(restante, estado.tecnicas, estado.aleatorio)];

    return {
      ...estado,
      jogadores: estado.jogadores.map((j, i) => (i === indice ? { ...j, mao: novaMao } : j)),
      versoes: [...estado.versoes, { texto: textoLimpo, autor: indice, tecnicaId, alcance }],
    };
  }

  function montarRevelacao(estado) {
    const versoes = estado.versoes.map((versao, i) => ({
      numero: i + 1,
      autor: estado.jogadores[versao.autor].nome,
      tecnica: buscarTecnica(estado, versao.tecnicaId),
      texto: versao.texto,
      alcance: versao.alcance,
    }));

    const placar = estado.jogadores
      .map((jogador, indice) => ({
        nome: jogador.nome,
        engajamento: estado.versoes
          .filter((v) => v.autor === indice)
          .reduce((soma, v) => soma + buscarTecnica(estado, v.tecnicaId).valor, 0),
      }))
      .sort((a, b) => b.engajamento - a.engajamento);

    const maximo = placar.length ? placar[0].engajamento : 0;
    const vencedores = placar.filter((p) => p.engajamento === maximo).map((p) => p.nome);

    const revelacao = {
      original: estado.noticia.texto,
      final: versaoVisivel(estado),
      versoes,
      serieAlcance: [ALCANCE_INICIAL, ...estado.versoes.map((v) => v.alcance)],
      placar,
      vencedores,
    };
    if (estado.noticia.origem) revelacao.origem = estado.noticia.origem;
    return revelacao;
  }

  const api = {
    MIN_JOGADORES,
    MAX_JOGADORES,
    VOLTAS,
    sortear,
    buscarTecnica,
    criarPartida,
    jogadorDaVez,
    maoDaVez,
    voltaAtual,
    partidaTerminou,
    versaoVisivel,
    jogarTurno,
    montarRevelacao,
  };

  raiz.JogoLogica = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
