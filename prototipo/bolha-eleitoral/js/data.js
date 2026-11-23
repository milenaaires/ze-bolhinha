/* =========================================================================
   BOLHA ELEITORAL — dados do jogo (regiões, candidatos, cartas, eventos,
   missões). Tudo aqui é conteúdo; as regras ficam em engine.js.
   ========================================================================= */
(function () {
  'use strict';
  const BE = (window.BE = window.BE || {});

  BE.CONFIG = {
    RODADAS: 6,
    CARTAS_POR_TURNO: 2,
    VERBA_MAX: 12,
    RENDA_BASE: 3,
    REPUTACAO_INICIAL: 6,
    ALCANCE_BASE: 6, // pontos de alcance do Algoritmo por semana
    LIMIAR_CONTROLE: 5, // vantagem mínima para controlar uma região
    LIMIAR_VIES: 6, // viés acumulado que dispara o escândalo
    MAO_ALGORITMO_MAX: 4,
    APOIO_INICIAL: 30, // % de cada grupo em cada região no início
  };

  BE.GRUPOS = {
    Q: { id: 'Q', nome: 'Quadrados', singular: 'Quadrado', forma: '■' },
    T: { id: 'T', nome: 'Triângulos', singular: 'Triângulo', forma: '▲' },
  };

  BE.PAUTAS = {
    economia: { nome: 'Economia', icone: '💰' },
    saude: { nome: 'Saúde', icone: '🏥' },
    seguranca: { nome: 'Segurança', icone: '🚨' },
    educacao: { nome: 'Educação', icone: '📚' },
    ambiente: { nome: 'Meio Ambiente', icone: '🌳' },
  };

  // Peso eleitoral ≈ distribuição do eleitorado por região (TSE, 2022).
  // Pauta e resistência à desinformação são SORTEADAS a cada partida, para
  // não sugerir que alguma região real seja mais ou menos "enganável".
  BE.REGIOES = {
    N: { id: 'N', nome: 'Norte', votos: 8, adj: ['NE', 'CO'] },
    NE: { id: 'NE', nome: 'Nordeste', votos: 27, adj: ['N', 'CO', 'SE'] },
    CO: { id: 'CO', nome: 'Centro-Oeste', votos: 7, adj: ['N', 'NE', 'SE', 'S'] },
    SE: { id: 'SE', nome: 'Sudeste', votos: 43, adj: ['NE', 'CO', 'S'] },
    S: { id: 'S', nome: 'Sul', votos: 15, adj: ['SE', 'CO'] },
  };
  BE.REGIAO_IDS = ['N', 'NE', 'CO', 'SE', 'S'];

  BE.ARQUETIPOS = {
    terreno: {
      nome: 'Palanque',
      desc: 'Cartas de rua com alvo em uma região dão +1 de apoio. Começa com R$ 6.',
      verba: 6,
      mao: 5,
    },
    rede: {
      nome: 'Viral',
      desc: 'Suas notícias têm +1 de viralidade. Segura até 6 cartas. Começa com R$ 5.',
      verba: 5,
      mao: 6,
    },
  };

  // Cada grupo tem um candidato de cada arquétipo: as habilidades são
  // espelhadas para que nenhum lado tenha vantagem estrutural.
  BE.CANDIDATOS = {
    q1: { slot: 'q1', grupo: 'Q', nome: 'Dona Quitéria Esquadro', titulo: 'A Rainha do Comício', arquetipo: 'terreno', bordao: '“Quem tem quina tem rumo!”' },
    q2: { slot: 'q2', grupo: 'Q', nome: 'Kiko Quina', titulo: 'O Coach dos Reels', arquetipo: 'rede', bordao: '“Ângulo reto, papo reto.”' },
    t1: { slot: 't1', grupo: 'T', nome: 'Seu Tonho Vértice', titulo: 'O Homem da Carreata', arquetipo: 'terreno', bordao: '“Três lados, um só coração!”' },
    t2: { slot: 't2', grupo: 'T', nome: 'Tati Triangulina', titulo: 'A Rainha da Dancinha', arquetipo: 'rede', bordao: '“Aponta pra cima, Brasil!”' },
  };

  BE.VERACIDADE = {
    falsa: { rotulo: 'FAKE NEWS', curto: 'Falsa', cls: 'v-falsa' },
    enganosa: { rotulo: 'ENGANOSA', curto: 'Enganosa', cls: 'v-enganosa' },
    sensacionalista: { rotulo: 'SENSACIONALISTA', curto: 'Sensacionalista', cls: 'v-sensa' },
    verdadeira: { rotulo: 'VERDADEIRA', curto: 'Verdadeira', cls: 'v-verdade' },
  };

  /* ---------------------------------------------------------------------
     BARALHO DE CAMPANHA (compartilhado pelos 4 candidatos)
     tipo: noticia | rua | digital | conscientizacao
     Notícias vão para o Feed (ou para o Zap) e dependem do Algoritmo.
     modo: promo (ganha apoio) | ataque (tira apoio do adversário) |
           protesto (os dois grupos perdem apoio para indecisos)
     selo: ficcao (notícia inventada para o jogo) | fato (fato histórico)
     --------------------------------------------------------------------- */
  BE.CARTAS = [
    // ===== NOTÍCIAS FALSAS =====
    { id: 'pix', tipo: 'noticia', veracidade: 'falsa', modo: 'ataque', custo: 1, copias: 2, efeito: 4, viral: 4, pauta: 'economia', selo: 'ficcao',
      manchete: 'URGENTE!!! Adversário vai taxar até o Pix da sua avó',
      explicacao: 'Boato clássico: mexe com o bolso, usa caixa-alta e senso de urgência. Não existia proposta nenhuma.' },
    { id: 'audio', tipo: 'noticia', veracidade: 'falsa', modo: 'ataque', custo: 1, copias: 2, efeito: 4, viral: 3, pauta: 'seguranca', selo: 'ficcao',
      manchete: 'Áudio de 7 minutos do “primo de um delegado” revela plano secreto do adversário',
      explicacao: 'Fonte anônima com autoridade emprestada + áudio longo = difícil de checar, fácil de repassar.' },
    { id: 'pesquisa87', tipo: 'noticia', veracidade: 'falsa', modo: 'promo', custo: 1, copias: 1, efeito: 4, viral: 3, pauta: null, selo: 'ficcao',
      manchete: 'Pesquisa EXCLUSIVA crava: nosso candidato tem 87%!',
      explicacao: 'No Brasil, pesquisas eleitorais precisam ser registradas na Justiça Eleitoral antes de divulgadas. Esta não tinha registro: só explora o efeito manada.' },
    { id: 'churrasco', tipo: 'noticia', veracidade: 'falsa', modo: 'ataque', custo: 1, copias: 1, efeito: 4, viral: 4, pauta: 'ambiente', selo: 'ficcao',
      manchete: 'Adversário quer proibir o churrasco de domingo',
      explicacao: 'Pega uma pauta real (meio ambiente) e distorce até o absurdo para gerar indignação.' },
    { id: 'postos', tipo: 'noticia', veracidade: 'falsa', modo: 'ataque', custo: 1, copias: 1, efeito: 4, viral: 3, pauta: 'saude', selo: 'ficcao',
      manchete: 'Adversário vai fechar os postos de saúde às sextas, diz “enfermeira”',
      explicacao: 'Usa um personagem genérico (“uma enfermeira”) para dar credibilidade a algo inventado.' },
    { id: 'dancinha', tipo: 'noticia', veracidade: 'falsa', modo: 'ataque', custo: 1, copias: 1, efeito: 3, viral: 4, pauta: 'educacao', selo: 'ficcao',
      manchete: '“Professor” denuncia: escolas vão trocar matemática por dancinha',
      explicacao: 'Pânico moral com “denunciante” sem nome. Não existe plano assim.' },
    { id: 'gatinhos', tipo: 'noticia', veracidade: 'falsa', modo: 'promo', custo: 1, copias: 1, efeito: 4, viral: 3, pauta: null, selo: 'ficcao',
      manchete: 'Nosso candidato salvou 12 gatinhos de um incêndio (vídeo!)',
      explicacao: 'Não houve incêndio nem gatinhos. Histórias heroicas inventadas criam simpatia rápida e ninguém confere.' },

    // ===== ENGANOSAS (fora de contexto, manipuladas) =====
    { id: 'multidao', tipo: 'noticia', veracidade: 'enganosa', modo: 'promo', custo: 1, copias: 2, efeito: 3, viral: 3, pauta: null, selo: 'ficcao',
      manchete: 'Mar de gente no nosso comício! (foto)',
      explicacao: 'A foto é real, mas é de um bloco de Carnaval. Imagem verdadeira + contexto falso.' },
    { id: 'video2014', tipo: 'noticia', veracidade: 'enganosa', modo: 'ataque', custo: 1, copias: 1, efeito: 3, viral: 3, pauta: 'seguranca', selo: 'ficcao',
      manchete: 'Vídeo do adversário “gravado ontem” choca o país',
      explicacao: 'O vídeo é de anos atrás e foi recortado. Conteúdo velho recirculado como novo é uma das formas mais comuns de desinformação.' },
    { id: 'grafico', tipo: 'noticia', veracidade: 'enganosa', modo: 'ataque', custo: 1, copias: 1, efeito: 3, viral: 2, pauta: 'economia', selo: 'ficcao',
      manchete: 'Gráfico prova: o desemprego EXPLODIU',
      explicacao: 'O eixo do gráfico começa em 11%, não em 0%. Uma variação pequena parece um abismo.' },
    { id: 'et', tipo: 'noticia', veracidade: 'enganosa', modo: 'ataque', custo: 1, copias: 1, efeito: 3, viral: 4, pauta: null, selo: 'ficcao',
      manchete: 'Foto: adversário abraçado com o ET de Varginha',
      explicacao: 'Montagem. Mesmo quem ri sabendo que é falso guarda a associação: o humor ajuda a desinformação a circular.' },
    { id: 'frase', tipo: 'noticia', veracidade: 'enganosa', modo: 'ataque', custo: 1, copias: 1, efeito: 3, viral: 3, pauta: 'saude', selo: 'ficcao',
      manchete: 'Adversário admite: “Eu vou acabar…” (vídeo)',
      explicacao: 'A frase completa era “Eu vou acabar com a fila do posto”. Um corte muda totalmente o sentido.' },

    // ===== SENSACIONALISTAS =====
    { id: 'cafe', tipo: 'noticia', veracidade: 'sensacionalista', modo: 'ataque', custo: 1, copias: 2, efeito: 2, viral: 4, pauta: null, selo: 'ficcao',
      manchete: 'VOCÊ NÃO VAI ACREDITAR no que o adversário comeu no café',
      explicacao: 'Era pão com manteiga. A isca de clique promete escândalo e não entrega nada, mas o clique já contou.' },
    { id: 'midia', tipo: 'noticia', veracidade: 'sensacionalista', modo: 'promo', custo: 1, copias: 1, efeito: 2, viral: 3, pauta: 'seguranca', selo: 'ficcao',
      manchete: 'O que a mídia NÃO te conta sobre segurança pública',
      explicacao: 'Mistura dados reais com tom conspiratório: gera desconfiança generalizada em vez de informação.' },
    { id: 'caramelo', tipo: 'noticia', veracidade: 'sensacionalista', modo: 'promo', custo: 1, copias: 2, efeito: 3, viral: 4, pauta: null, selo: 'ficcao',
      manchete: 'Candidato adota vira-lata caramelo (com piano triste ao fundo)',
      explicacao: 'É verdade, mas foi produzido para emocionar, não para informar. Apelo emocional não diz nada sobre propostas.' },

    // ===== VERDADEIRAS (ficção do jogo, mas legítimas) =====
    { id: 'sus52', tipo: 'noticia', veracidade: 'verdadeira', modo: 'promo', custo: 2, copias: 1, efeito: 3, viral: 1, pauta: 'saude', selo: 'ficcao',
      manchete: 'Candidato apresenta plano para a saúde com 52 páginas e metas',
      explicacao: 'Informação verificável e útil, mas pouco “engajante”. Conteúdo de qualidade raramente viraliza sozinho.' },
    { id: 'tecnico', tipo: 'noticia', veracidade: 'verdadeira', modo: 'promo', custo: 2, copias: 1, efeito: 3, viral: 1, pauta: 'educacao', selo: 'ficcao',
      manchete: 'Proposta: ensino técnico em todas as capitais, com orçamento detalhado',
      explicacao: 'Proposta concreta, com fonte e custo. Dá para cobrar depois.' },
    { id: 'contas', tipo: 'noticia', veracidade: 'verdadeira', modo: 'promo', custo: 1, copias: 1, efeito: 2, viral: 1, pauta: null, selo: 'ficcao', bonus: { rep: 1 },
      manchete: 'Prestação de contas da campanha publicada e em dia',
      explicacao: 'Transparência não dá like, mas constrói reputação (+1 se circular).' },
    { id: 'reflorestar', tipo: 'noticia', veracidade: 'verdadeira', modo: 'promo', custo: 2, copias: 1, efeito: 3, viral: 1, pauta: 'ambiente', selo: 'ficcao',
      manchete: 'Plano de reflorestamento com metas e fiscalização',
      explicacao: 'Metas mensuráveis são o oposto da promessa vaga.' },
    { id: 'microcredito', tipo: 'noticia', veracidade: 'verdadeira', modo: 'promo', custo: 2, copias: 1, efeito: 3, viral: 2, pauta: 'economia', selo: 'ficcao',
      manchete: 'Microcrédito para camelôs e ambulantes: veja como funciona',
      explicacao: 'Explica a proposta em linguagem simples. Informação útil também pode engajar.' },
    { id: 'faltou', tipo: 'noticia', veracidade: 'verdadeira', modo: 'ataque', custo: 1, copias: 2, efeito: 2, viral: 2, pauta: null, selo: 'ficcao',
      manchete: 'Adversário faltou a 3 debates (está na agenda oficial)',
      explicacao: 'Crítica baseada em fato verificável: é legítima e qualquer um pode conferir.' },
    { id: 'policiamento', tipo: 'noticia', veracidade: 'verdadeira', modo: 'promo', custo: 2, copias: 1, efeito: 3, viral: 1, pauta: 'seguranca', selo: 'ficcao',
      manchete: 'Policiamento comunitário: candidato mostra resultados do projeto',
      explicacao: 'Dados de resultado, com fonte. Menos emoção, mais substância.' },

    // ===== FATOS HISTÓRICOS (absurdos, porém verdadeiros e verificáveis) =====
    { id: 'cacareco', tipo: 'noticia', veracidade: 'verdadeira', modo: 'protesto', custo: 1, copias: 1, efeito: 2, viral: 3, pauta: null, selo: 'fato',
      fonte: 'Eleição municipal de São Paulo, 1959',
      manchete: 'O rinoceronte Cacareco “recebeu” cerca de 100 mil votos para vereador',
      explicacao: 'Parece fake, mas é fato histórico: um voto de protesto famoso (os votos foram anulados). Absurdo não é sinônimo de falso: por isso checar é melhor que “achar”.' },
    { id: 'tiao', tipo: 'noticia', veracidade: 'verdadeira', modo: 'protesto', custo: 1, copias: 1, efeito: 2, viral: 3, pauta: null, selo: 'fato',
      fonte: 'Eleição municipal do Rio de Janeiro, 1988',
      manchete: 'O Macaco Tião, do zoológico do Rio, teve cerca de 400 mil votos para prefeito',
      explicacao: 'Outro voto de protesto real. A cédula era de papel e o eleitor escrevia o nome: os votos foram anulados.' },
    { id: 'urna', tipo: 'noticia', veracidade: 'verdadeira', modo: 'promo', custo: 1, copias: 1, efeito: 1, viral: 1, pauta: null, selo: 'fato', bonus: { confianca: 1, desinfo: -1 },
      fonte: 'TSE: urna eletrônica desde 1996; Testes Públicos de Segurança desde 2009',
      manchete: 'A urna eletrônica é usada no Brasil desde 1996 e passa por testes públicos de segurança',
      explicacao: 'Informação institucional verificável. Fortalece a confiança pública (+1) e reduz a desinformação (−1).' },
    { id: 'fichalimpa', tipo: 'noticia', veracidade: 'verdadeira', modo: 'promo', custo: 1, copias: 1, efeito: 2, viral: 2, pauta: null, selo: 'fato', bonus: { rep: 1 },
      fonte: 'Lei Complementar nº 135/2010',
      manchete: 'A Lei da Ficha Limpa nasceu de um projeto de iniciativa popular',
      explicacao: 'Mais de 1 milhão de assinaturas de cidadãos levaram o projeto ao Congresso. Participação também muda regra.' },

    // ===== CAMPANHA DE RUA (efeito imediato, não passa pelo Algoritmo) =====
    { id: 'comicio', tipo: 'rua', nome: 'Comício na Praça', custo: 3, copias: 3, alvo: 'regiao', acao: 'ganho', valor: 4,
      desc: 'Palanque, carro de som e pastel. +4 de apoio na região.' },
    { id: 'santinho', tipo: 'rua', nome: 'Chuva de Santinhos', custo: 1, copias: 4, alvo: 'regiao', acao: 'ganho', valor: 2,
      desc: '+2 de apoio na região. Depois alguém varre.' },
    { id: 'horario', tipo: 'rua', nome: 'Horário Eleitoral Gratuito', custo: 4, copias: 2, alvo: 'nenhum', acao: 'todas', valor: 1,
      desc: 'Interrompe a novela no país inteiro: +1 de apoio em todas as regiões.' },
    { id: 'jingle', tipo: 'rua', nome: 'Jingle Chiclete', custo: 2, copias: 2, alvo: 'regiao', acao: 'jingle', valor: 2,
      desc: '+2 na região e +1 em cada região vizinha. Ninguém tira da cabeça.' },
    { id: 'caravana', tipo: 'rua', nome: 'Caravana da Expansão', custo: 2, copias: 3, alvo: 'regiao', restricao: 'adjControle', acao: 'ganho', valor: 4,
      desc: '+4 numa região VIZINHA de uma região que seu grupo controla. Expanda a partir do seu território.' },
    { id: 'promessa', tipo: 'rua', nome: 'Promessa Mirabolante', custo: 1, copias: 2, alvo: 'regiao', acao: 'promessa', valor: 4,
      desc: '“Metrô até a Lua!” +4 agora. Na semana seguinte, a conta chega: −2 na região e −1 de reputação.' },
    { id: 'radio', tipo: 'rua', nome: 'Entrevista na Rádio Comunitária', custo: 2, copias: 2, alvo: 'regiao', acao: 'ganho', valor: 3, rep: 1,
      desc: '+3 na região e +1 de reputação.' },
    { id: 'marketing', tipo: 'rua', nome: 'Marqueteiro de Grife', custo: 2, copias: 2, alvo: 'nenhum', acao: 'rep', valor: 2,
      desc: '+2 de reputação. Terno novo, sorriso ensaiado.' },
    { id: 'bocadeurna', tipo: 'rua', nome: 'Boca de Urna', custo: 2, copias: 2, alvo: 'regiao', acao: 'ilegal', valor: 3, risco: 2, ultimaRodada: true,
      desc: 'Só na última semana. +3 na região. É crime eleitoral: com 1–2 no dado, você é flagrado(a): efeito anulado e −2 de reputação.' },

    // ===== DIGITAL / WHATSAPP (fora do controle do Algoritmo) =====
    { id: 'tiazap', tipo: 'digital', nome: 'Tia do Zap', custo: 1, copias: 3, alvo: 'nenhum', acao: 'zap',
      desc: '“Bom dia, grupo! 🌷” Sua próxima notícia neste turno vai pelo WhatsApp: o Algoritmo não controla, chega com alcance 2 e é mais difícil de desmentir.' },
    { id: 'corrente', tipo: 'digital', nome: 'Corrente “Repasse pra 10 grupos”', custo: 2, copias: 2, alvo: 'nenhum', acao: 'corrente',
      desc: 'Como a Tia do Zap, e a notícia ainda se espalha para as regiões vizinhas com metade do efeito.' },
    { id: 'disparo', tipo: 'digital', nome: 'Disparo em Massa', custo: 4, copias: 1, alvo: 'nenhum', acao: 'disparo', valor: 2, risco: 2,
      desc: '+2 em todas as regiões. Proibido pela Justiça Eleitoral: com 1–2 no dado, é flagrado: anulado e −3 de reputação. Confiança pública −1 de qualquer jeito.' },
    { id: 'influencer', tipo: 'digital', nome: 'Influenciador Contratado', custo: 3, copias: 2, alvo: 'nenhum', acao: 'influencer',
      desc: '#publi (esquecida). Suas notícias desta semana ganham +1 de alcance DEPOIS da decisão do Algoritmo e nunca ficam abaixo de 1.' },
    { id: 'robos', tipo: 'digital', nome: 'Fazenda de Robôs', custo: 2, copias: 2, alvo: 'nenhum', acao: 'robos',
      desc: 'Suas notícias desta semana aparecem com +2 de viralidade (engajamento falso). Se o Algoritmo usar Detecção de Bots: anulado e −2 de reputação. Desinformação +1.' },

    // ===== CONSCIENTIZAÇÃO =====
    { id: 'checagem', tipo: 'conscientizacao', nome: 'Checagem de Fatos', custo: 1, copias: 5, alvo: 'post', acao: 'checagem',
      desc: 'Escolha um post do Feed. Falso ou enganoso: é removido, o autor perde 2 de reputação, você ganha 1 e a confiança sobe. Verdadeiro: ganha selo ✔ (+1 de efeito).' },
    { id: 'jornalismo', tipo: 'conscientizacao', nome: 'Jornalismo Investigativo', custo: 3, copias: 2, alvo: 'regiao', acao: 'jornalismo',
      desc: 'Todos os posts falsos ou enganosos do Feed direcionados à região são removidos (autores −2 de reputação). Desinformação −1.' },
    { id: 'educacao', tipo: 'conscientizacao', nome: 'Educação Midiática', custo: 2, copias: 2, alvo: 'regiao', acao: 'educacao',
      desc: 'Resistência à desinformação da região +1 (máx. 4). Polarização −1. Reputação +1.' },
    { id: 'debate', tipo: 'conscientizacao', nome: 'Debate Construtivo', custo: 2, copias: 2, alvo: 'regiao', acao: 'debate',
      desc: 'Polarização −2. Os DOIS grupos ganham +1 na região. Você ganha +1 de reputação.' },
    { id: 'contexto', tipo: 'conscientizacao', nome: 'Contextualização', custo: 1, copias: 2, alvo: 'regiao', acao: 'contexto',
      desc: 'Bolha da região −2. Se a bolha era de nível 2 ou mais, polarização −1.' },
    { id: 'fontes', tipo: 'conscientizacao', nome: 'Fontes Confiáveis', custo: 1, copias: 2, alvo: 'nenhum', acao: 'fontes',
      desc: 'Confiança pública +1, desinformação −1, reputação +1.' },
  ];

  BE.TIPOS_CARTA = {
    noticia: { nome: 'Notícia', curto: 'Notícia', icone: '📰' },
    rua: { nome: 'Campanha de rua', curto: 'Rua', icone: '📣' },
    digital: { nome: 'Zap & Redes', curto: 'Zap & Redes', icone: '📱' },
    conscientizacao: { nome: 'Conscientização', curto: 'Checagem', icone: '🔎' },
  };

  /* --------------------------------------------------------------------- */
  BE.CARTAS_ALGORITMO = [
    { id: 'bolha', nome: 'Bolha de Filtro', alvo: 'regiao+grupo', copias: 2,
      desc: 'Escolha uma região e um grupo: a bolha da região cresce 1 nível para esse grupo. Conta +2 de viés.' },
    { id: 'trend', nome: 'Assunto do Momento', alvo: 'pauta', copias: 2,
      desc: 'Posts da pauta escolhida ganham +2 de viralidade nesta semana.' },
    { id: 'shadowban', nome: 'Shadowban', alvo: 'post', copias: 2,
      desc: 'Um post fica com alcance 0 sem gastar pontos. Ninguém avisa o autor. (Conta como viés.)' },
    { id: 'moderacao', nome: 'Moderação de Conteúdo', alvo: 'nenhum', copias: 2,
      desc: 'Revela para você a veracidade dos 2 posts mais virais do Feed. Moderar custa: −3 de engajamento.' },
    { id: 'selo', nome: 'Rótulo “Contexto Adicionado”', alvo: 'nenhum', copias: 2,
      desc: 'Posts falsos ou enganosos desta semana têm efeito e engajamento pela metade. Confiança +1.' },
    { id: 'bots', nome: 'Detecção de Bots', alvo: 'nenhum', copias: 2,
      desc: 'Anula as Fazendas de Robôs desta semana (os contratantes perdem 2 de reputação). Confiança +1.' },
    { id: 'cascata', nome: 'Recomendação em Cascata', alvo: 'post', copias: 2,
      desc: 'O post também chega às regiões vizinhas com metade do efeito (e gera engajamento extra).' },
    { id: 'eco', nome: 'Câmara de Eco', alvo: 'regiao', copias: 1,
      desc: 'Na região, posts do grupo dono da bolha têm efeito dobrado. Polarização +1.' },
    { id: 'pausa', nome: '“Você está há 3h no app”', alvo: 'nenhum', copias: 1,
      desc: 'Polarização −1 e confiança +1. Engajamento −5.' },
    { id: 'update', nome: 'Atualização do Algoritmo', alvo: 'nenhum', copias: 1,
      desc: 'Todas as bolhas −1. O viés acumulado se aproxima de zero em 3.' },
    { id: 'monetiza', nome: 'Monetização Agressiva', alvo: 'nenhum', copias: 1,
      desc: '+3 pontos de alcance nesta semana. Confiança −1.' },
  ];

  /* --------------------------------------------------------------------- */
  BE.EVENTOS = [
    { id: 'largada', fixo: 1, nome: 'Começa a propaganda eleitoral', icone: '🏁',
      texto: 'Carros de som aquecendo, santinhos impressos. Cada candidato recebe +R$ 1.',
      edu: 'Pela lei eleitoral, a propaganda só é permitida a partir de 16 de agosto do ano da eleição.' },
    { id: 'retafinal', fixo: 'ultima', nome: 'Reta final: véspera da eleição', icone: '⏳',
      texto: 'Última semana! A Boca de Urna pode ser usada (por sua conta e risco). Nervos à flor da pele: polarização +1.',
      edu: 'Boca de urna no dia da eleição é crime eleitoral (Lei nº 9.504/1997).' },
    { id: 'crise', nome: 'Crise econômica', icone: '📉', pauta: 'economia',
      texto: 'O preço do cafezinho disparou. Em todas as regiões, cada grupo perde 2 de apoio para os indecisos. Economia entra nas opções de assunto.',
      edu: 'Crises reais desgastam todos os lados e abrem espaço para quem oferece explicações simples.' },
    { id: 'escandalo', nome: 'Escândalo político', icone: '💥',
      texto: 'O holofote tem dois lados: o candidato com mais popularidade perde 2 de reputação.',
      edu: 'Quem lidera vira alvo: denúncias se multiplicam, verdadeiras ou não.' },
    { id: 'vazamento', nome: 'Vazamento de conversas', icone: '🕵️',
      texto: 'Prints de grupos vazaram. Quem publicou conteúdo falso ou enganoso na semana passada perde 1 de reputação. Desinformação −1.',
      edu: 'Na internet, “apagar” raramente é para sempre.' },
    { id: 'debatetv', nome: 'Debate presidencial na TV', icone: '📺',
      texto: 'O grupo com maior reputação média ganha +3 no Sudeste e +2 no Nordeste. O debate virou ringue: polarização +1.',
      edu: 'Debates alcançam milhões de pessoas ao mesmo tempo, sem filtro algorítmico.' },
    { id: 'investigacao', nome: 'Investigação jornalística', icone: '🗞️',
      texto: 'Redações em alerta: nesta semana, conteúdos falsos e enganosos têm +2 de chance de serem desmascarados.',
      edu: 'Checagem profissional e jornalismo investigativo aumentam o custo de mentir.' },
    { id: 'desastre', nome: 'Desastre ambiental', icone: '🌊', pauta: 'ambiente',
      texto: 'Enchentes mobilizam o país. Em uma região sorteada, cada grupo perde 2 para os indecisos. A solidariedade reduz a polarização em 1.',
      edu: 'Tragédias costumam ser alvo de boatos: correntes falsas de doação se espalham rápido.' },
    { id: 'confianca', nome: 'Crise de confiança', icone: '🤨',
      texto: 'O golpe do falso boleto viralizou e ninguém acredita em mais nada. Confiança pública −2.',
      edu: 'Quando a confiança cai, até a informação verdadeira perde força.' },
    { id: 'final', nome: 'Final do campeonato', icone: '⚽',
      texto: 'O país só fala de futebol: todas as notícias têm −1 de viralidade nesta semana. Polarização −1.',
      edu: 'A atenção é limitada: assuntos competem entre si o tempo todo.' },
    { id: 'apagao', nome: 'Instabilidade nas redes', icone: '📵',
      texto: 'Aplicativos fora do ar por horas. O Algoritmo tem −2 pontos de alcance e as campanhas de rua ganham +1 de efeito.',
      edu: 'Sem feed, voltam o boca a boca, a rádio e a praça.' },
    { id: 'pesquisa', nome: 'Pesquisa registrada divulgada', icone: '📊',
      texto: 'Efeito manada: em cada região, o grupo que lidera ganha +1.',
      edu: 'Pesquisas eleitorais precisam de registro na Justiça Eleitoral antes da divulgação.' },
    { id: 'meme', nome: 'Meme do momento', icone: '🤡',
      texto: 'Um meme dominou a internet: notícias sensacionalistas têm +2 de viralidade nesta semana.',
      edu: 'Humor e indignação são os combustíveis preferidos do engajamento.' },
    { id: 'virada', nome: 'Onda de opinião', icone: '🌊',
      texto: 'Quem está atrás nas pesquisas ganha fôlego: o grupo em desvantagem nacional ganha +2 nas duas regiões onde está mais atrás.',
      edu: 'Opinião pública não é estática: eventos mudam humores rapidamente.' },
    { id: 'horarioev', nome: 'Começa o horário eleitoral', icone: '🎙️',
      texto: 'Nesta semana, o Horário Eleitoral Gratuito custa R$ 2 e cada candidato recebe +R$ 1.',
      edu: 'O horário eleitoral é gratuito para os partidos; o custo é compensado às emissoras.' },
  ];

  /* --------------------------------------------------------------------- */
  // Missões dos candidatos: todas são neutras ("seu grupo"), qualquer
  // candidato pode recebê-las.
  BE.MISSOES_CANDIDATO = [
    { id: 'nne', nome: 'Corredor Norte–Nordeste', desc: 'No fim do jogo, seu grupo controla o Norte e o Nordeste.' },
    { id: 'sco', nome: 'Eixo Sul–Centro-Oeste', desc: 'No fim do jogo, seu grupo controla o Sul e o Centro-Oeste.' },
    { id: 'sudeste', nome: 'Coração do Eleitorado', desc: 'No fim do jogo, seu grupo lidera o Sudeste por 8 pontos ou mais.' },
    { id: 'fichalimpa', nome: 'Ficha Limpa', desc: 'Termine com reputação 8+ sem nunca ter publicado notícia falsa ou enganosa.' },
    { id: 'popular', nome: 'Fenômeno das Urnas', desc: 'Termine como o(a) candidato(a) de maior popularidade, mesmo que seu grupo perca.' },
    { id: 'cacador', nome: 'Caça-Boatos', desc: 'Desmascare pelo menos 2 conteúdos falsos ou enganosos com suas cartas de conscientização.' },
    { id: 'resistentes', nome: 'Voto Consciente', desc: 'No fim, seu grupo controla as regiões que começaram com resistência 3 à desinformação.' },
    { id: 'crise', nome: 'Crise Fabricada', desc: 'No fim, os dois candidatos adversários estão com reputação 4 ou menos.' },
    { id: 'viral', nome: 'Dono do Feed', desc: 'Suas notícias geram mais engajamento que as de qualquer outro candidato (mínimo de 5 notícias publicadas).' },
    { id: 'pacificador', nome: 'Pacificador(a)', desc: 'No fim, a polarização está em 5 ou menos e seu grupo controla pelo menos 2 regiões.' },
  ];

  // Limiares de engajamento calibrados por simulação (ver sim.js).
  BE.MISSOES_ALGORITMO = [
    { id: 'cliques', nome: 'Máquina de Cliques', meta: 190,
      desc: 'Acumule 190+ de engajamento, sem deixar a confiança pública terminar abaixo de 3 (ou a regulação acaba com a festa).' },
    { id: 'treta', nome: 'Treta Rende', desc: 'Termine pelo menos 3 semanas com polarização 6 ou mais, mas sem deixar o país explodir: a polarização nunca pode chegar a 10.' },
    { id: 'guardiao', nome: 'Guardião da Confiança', meta: 95,
      desc: 'Termine com confiança pública 7+ e pelo menos 95 de engajamento (a plataforma ainda precisa dar lucro).' },
    { id: 'onipresente', nome: 'Onipresente', meta: 6,
      desc: 'Todas as 5 regiões recebem 6+ de alcance acumulado, e você termina com viés entre −3 e +3, sem nenhum escândalo de viés.' },
    { id: 'novela', nome: 'Final de Novela', meta: 150,
      desc: 'A eleição termina com diferença nacional de 6 pontos ou menos e você acumula 150+ de engajamento. Disputa acirrada dá audiência.' },
  ];

  // índices por id
  BE.CARTA = {};
  BE.CARTAS.forEach((c) => (BE.CARTA[c.id] = c));
  BE.CARTA_ALG = {};
  BE.CARTAS_ALGORITMO.forEach((c) => (BE.CARTA_ALG[c.id] = c));
  BE.EVENTO = {};
  BE.EVENTOS.forEach((e) => (BE.EVENTO[e.id] = e));
  BE.MISSAO = {};
  BE.MISSOES_CANDIDATO.concat(BE.MISSOES_ALGORITMO).forEach((m) => (BE.MISSAO[m.id] = m));
})();
