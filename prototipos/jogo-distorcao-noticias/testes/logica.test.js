'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const Jogo = require('../logica.js');

// Gerador pseudoaleatório com semente, para que os sorteios sejam reproduzíveis.
function geradorComSemente(semente) {
  let a = semente >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TECNICAS = [
  { id: 'omissao', nome: 'Omissão de contexto', instrucao: 'Tire uma informação importante.', valor: 2 },
  { id: 'exagero', nome: 'Exagero', instrucao: 'Aumente um número.', valor: 3 },
  { id: 'autoridade', nome: 'Autoridade falsa', instrucao: 'Cite um especialista inventado.', valor: 3 },
  { id: 'cacaclique', nome: 'Manchete caça-clique', instrucao: 'Crie uma manchete chamativa.', valor: 4 },
  { id: 'inimigo', nome: 'Culpar um inimigo', instrucao: 'Ponha a culpa num grupo.', valor: 4 },
  { id: 'medo', nome: 'Apelo ao medo', instrucao: 'Diga que algo terrível vai acontecer.', valor: 5 },
];

const NOTICIA_COM_ORIGEM = {
  id: 'chiclete',
  texto: 'Assembleia aprova proibição da venda de chicletes no estado.',
  origem: { texto: 'Singapura proibiu a venda de chicletes em 1992.', link: 'https://example.org/chiclete' },
};

const NOTICIA_SEM_ORIGEM = {
  id: 'onibus',
  texto: 'Prefeitura reajusta a passagem de ônibus em 5%.',
};

function novaPartida(nomes, noticia = NOTICIA_SEM_ORIGEM, semente = 42) {
  return Jogo.criarPartida({ nomes, tecnicas: TECNICAS, noticia, aleatorio: geradorComSemente(semente) });
}

// Joga um turno usando a primeira carta da mão que tenha o id pedido,
// ou a primeira carta da mão quando nenhum id é pedido.
function jogar(estado, texto, tecnicaId) {
  const mao = Jogo.maoDaVez(estado);
  const escolhida = tecnicaId && mao.includes(tecnicaId) ? tecnicaId : mao[0];
  return Jogo.jogarTurno(estado, { tecnicaId: escolhida, texto });
}

test('criar a partida com 4 nomes dá a cada jogador uma mão de 3 técnicas distintas', () => {
  const estado = novaPartida(['Ana', 'Bia', 'Caio', 'Duda']);
  assert.equal(estado.jogadores.length, 4);
  for (const jogador of estado.jogadores) {
    assert.equal(jogador.mao.length, 3);
    assert.equal(new Set(jogador.mao).size, 3);
    for (const id of jogador.mao) assert.ok(TECNICAS.some((t) => t.id === id));
  }
});

test('a partida rejeita menos de 3 ou mais de 6 jogadores e nomes em branco', () => {
  assert.throws(() => novaPartida(['Ana', 'Bia']), /3 a 6 jogadores/);
  assert.throws(() => novaPartida(['A', 'B', 'C', 'D', 'E', 'F', 'G']), /3 a 6 jogadores/);
  assert.throws(() => novaPartida(['Ana', '   ', 'Caio']), /nome/i);
});

test('a partida rejeita nomes repetidos, mesmo com maiúsculas ou espaços diferentes', () => {
  assert.throws(() => novaPartida(['Ana', 'Bia', 'Ana']), /nome diferente/);
  assert.throws(() => novaPartida(['Ana', 'Bia', ' ana ']), /nome diferente/);
});

test('no primeiro turno a versão visível é o texto original', () => {
  const estado = novaPartida(['Ana', 'Bia', 'Caio']);
  assert.equal(Jogo.versaoVisivel(estado), NOTICIA_SEM_ORIGEM.texto);
  assert.equal(Jogo.jogadorDaVez(estado).nome, 'Ana');
  assert.equal(Jogo.voltaAtual(estado), 1);
});

test('na segunda volta, cada jogador vê só a versão do jogador anterior', () => {
  let estado = novaPartida(['Ana', 'Bia', 'Caio', 'Duda']);
  for (let i = 1; i <= 6; i++) estado = jogar(estado, `versão ${i}`);
  // Turno 7: vez do jogador 3 (Caio) na segunda volta.
  assert.equal(Jogo.jogadorDaVez(estado).nome, 'Caio');
  assert.equal(Jogo.voltaAtual(estado), 2);
  assert.equal(Jogo.versaoVisivel(estado), 'versão 6');
});

test('texto vazio ou só com espaços é rejeitado e o turno não avança', () => {
  const estado = novaPartida(['Ana', 'Bia', 'Caio']);
  const tecnicaId = Jogo.maoDaVez(estado)[0];
  assert.throws(() => Jogo.jogarTurno(estado, { tecnicaId, texto: '' }), /texto/i);
  assert.throws(() => Jogo.jogarTurno(estado, { tecnicaId, texto: '   \n ' }), /texto/i);
  assert.equal(Jogo.jogadorDaVez(estado).nome, 'Ana');
  assert.equal(estado.versoes.length, 0);
});

test('jogar sem carta ou com uma técnica fora da mão é rejeitado', () => {
  const estado = novaPartida(['Ana', 'Bia', 'Caio']);
  const fora = TECNICAS.map((t) => t.id).find((id) => !Jogo.maoDaVez(estado).includes(id));
  assert.throws(() => Jogo.jogarTurno(estado, { tecnicaId: fora, texto: 'nova versão' }), /carta/i);
  assert.throws(() => Jogo.jogarTurno(estado, { tecnicaId: undefined, texto: 'nova versão' }), /carta/i);
});

test('depois de jogar, a mão volta a ter 3 técnicas distintas', () => {
  let estado = novaPartida(['Ana', 'Bia', 'Caio']);
  for (let i = 0; i < 6; i++) {
    estado = jogar(estado, `versão ${i}`);
    for (const jogador of estado.jogadores) {
      assert.equal(jogador.mao.length, 3);
      assert.equal(new Set(jogador.mao).size, 3);
    }
  }
});

test('jogar não altera o estado anterior', () => {
  const antes = novaPartida(['Ana', 'Bia', 'Caio']);
  const maoAntes = [...antes.jogadores[0].mao];
  jogar(antes, 'nova versão');
  assert.equal(antes.versoes.length, 0);
  assert.deepEqual(antes.jogadores[0].mao, maoAntes);
});

test('com 3 jogadores a partida termina após o 6º turno e recusa um 7º', () => {
  let estado = novaPartida(['Ana', 'Bia', 'Caio']);
  for (let i = 1; i <= 5; i++) {
    estado = jogar(estado, `versão ${i}`);
    assert.equal(Jogo.partidaTerminou(estado), false);
  }
  estado = jogar(estado, 'versão 6');
  assert.equal(Jogo.partidaTerminou(estado), true);
  assert.throws(() => jogar(estado, 'versão 7'), /terminou/);
});

test('o alcance parte de 100 e cresce com o valor de cada carta', () => {
  let estado = novaPartida(['Ana', 'Bia', 'Caio']);
  estado = Jogo.jogarTurno(estado, { tecnicaId: forcarCarta(estado, 'medo'), texto: 'medo' });
  estado = Jogo.jogarTurno(estado, { tecnicaId: forcarCarta(estado, 'omissao'), texto: 'omissão' });
  assert.deepEqual(estado.versoes.map((v) => v.alcance), [250, 400]);
});

// Coloca a técnica pedida na mão do jogador da vez, para testar a pontuação sem depender do sorteio.
function forcarCarta(estado, tecnicaId) {
  const jogador = Jogo.jogadorDaVez(estado);
  if (!jogador.mao.includes(tecnicaId)) jogador.mao[0] = tecnicaId;
  return tecnicaId;
}

test('quem joga cartas mais apelativas soma mais engajamento e vence', () => {
  let estado = novaPartida(['Ana', 'Bia', 'Caio']);
  const cartas = { Ana: 'medo', Bia: 'omissao', Caio: 'exagero' };
  while (!Jogo.partidaTerminou(estado)) {
    const nome = Jogo.jogadorDaVez(estado).nome;
    estado = Jogo.jogarTurno(estado, { tecnicaId: forcarCarta(estado, cartas[nome]), texto: `texto de ${nome}` });
  }
  const revelacao = Jogo.montarRevelacao(estado);
  const pontos = Object.fromEntries(revelacao.placar.map((p) => [p.nome, p.engajamento]));
  assert.deepEqual(pontos, { Ana: 10, Bia: 4, Caio: 6 });
  assert.deepEqual(revelacao.vencedores, ['Ana']);
  assert.equal(revelacao.placar[0].nome, 'Ana');
});

test('empate no topo faz os dois jogadores vencerem', () => {
  let estado = novaPartida(['Ana', 'Bia', 'Caio']);
  const cartas = { Ana: 'medo', Bia: 'medo', Caio: 'omissao' };
  while (!Jogo.partidaTerminou(estado)) {
    const nome = Jogo.jogadorDaVez(estado).nome;
    estado = Jogo.jogarTurno(estado, { tecnicaId: forcarCarta(estado, cartas[nome]), texto: `texto de ${nome}` });
  }
  assert.deepEqual(Jogo.montarRevelacao(estado).vencedores, ['Ana', 'Bia']);
});

test('a revelação traz original, final e todas as versões com autor e carta', () => {
  let estado = novaPartida(['Ana', 'Bia', 'Caio'], NOTICIA_COM_ORIGEM);
  while (!Jogo.partidaTerminou(estado)) estado = jogar(estado, `versão ${estado.versoes.length + 1}`);
  const revelacao = Jogo.montarRevelacao(estado);
  assert.equal(revelacao.original, NOTICIA_COM_ORIGEM.texto);
  assert.equal(revelacao.final, 'versão 6');
  assert.equal(revelacao.versoes.length, 6);
  assert.deepEqual(revelacao.versoes.map((v) => v.autor), ['Ana', 'Bia', 'Caio', 'Ana', 'Bia', 'Caio']);
  for (const versao of revelacao.versoes) assert.ok(versao.tecnica && versao.tecnica.nome);
  assert.equal(revelacao.serieAlcance[0], 100);
  assert.equal(revelacao.serieAlcance.length, 7);
  assert.deepEqual(revelacao.origem, NOTICIA_COM_ORIGEM.origem);
});

test('a revelação não traz origem quando a notícia não tem', () => {
  let estado = novaPartida(['Ana', 'Bia', 'Caio'], NOTICIA_SEM_ORIGEM);
  while (!Jogo.partidaTerminou(estado)) estado = jogar(estado, 'algo');
  assert.equal('origem' in Jogo.montarRevelacao(estado), false);
});

test('o mesmo gerador com a mesma semente produz as mesmas mãos', () => {
  const a = novaPartida(['Ana', 'Bia', 'Caio'], NOTICIA_SEM_ORIGEM, 7);
  const b = novaPartida(['Ana', 'Bia', 'Caio'], NOTICIA_SEM_ORIGEM, 7);
  assert.deepEqual(a.jogadores.map((j) => j.mao), b.jogadores.map((j) => j.mao));
});
