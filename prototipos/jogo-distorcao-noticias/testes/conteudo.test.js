'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { tecnicas, noticias } = require('../conteudo.js');
const Jogo = require('../logica.js');

test('o baralho tem 6 técnicas com valor de 1 a 5, e apelo ao medo vale mais', () => {
  assert.equal(tecnicas.length, 6);
  assert.equal(new Set(tecnicas.map((t) => t.id)).size, 6);
  for (const t of tecnicas) {
    assert.ok(t.nome && t.instrucao, `técnica ${t.id} sem nome ou instrução`);
    assert.ok(Number.isInteger(t.valor) && t.valor >= 1 && t.valor <= 5, `valor inválido em ${t.id}`);
  }
  const maior = Math.max(...tecnicas.map((t) => t.valor));
  assert.equal(tecnicas.find((t) => t.id === 'medo').valor, maior);
});

test('o banco tem de 3 a 5 notícias, e pelo menos uma tem origem real', () => {
  assert.ok(noticias.length >= 3 && noticias.length <= 5);
  assert.equal(new Set(noticias.map((n) => n.id)).size, noticias.length);
  for (const n of noticias) assert.ok(n.texto && n.texto.trim().length > 0, `notícia ${n.id} sem texto`);
  assert.ok(noticias.some((n) => n.origem));
});

test('toda origem tem texto e link https', () => {
  for (const n of noticias.filter((n) => n.origem)) {
    assert.ok(n.origem.texto, `origem de ${n.id} sem texto`);
    assert.match(n.origem.link, /^https:\/\//, `origem de ${n.id} sem link https`);
  }
});

test('a notícia do chiclete conta que a origem é Singapura em 1992', () => {
  const chiclete = noticias.find((n) => n.id === 'chiclete');
  assert.ok(chiclete, 'notícia do chiclete ausente');
  assert.match(chiclete.origem.texto, /Singapura/);
  assert.match(chiclete.origem.texto, /1992/);
});

test('o conteúdo real monta uma partida jogável', () => {
  const estado = Jogo.criarPartida({ nomes: ['Ana', 'Bia', 'Caio'], tecnicas, noticia: noticias[0] });
  assert.equal(Jogo.versaoVisivel(estado), noticias[0].texto);
});
