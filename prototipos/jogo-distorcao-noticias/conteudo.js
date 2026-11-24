// Cartas de técnica de distorção e banco de notícias de partida.
// As notícias são fictícias. Algumas transplantam para o Brasil um fato real de outro país ou época;
// essas trazem a origem verdadeira, conferida em fonte aberta, para a revelação no fim da partida.
// Funciona como <script> comum no navegador (global JogoConteudo) e com require() no Node.
(function (raiz) {
  'use strict';

  // Quanto mais apelativa a técnica, mais engajamento ela rende para o algoritmo.
  const tecnicas = [
    {
      id: 'omissao',
      nome: 'Omissão de contexto',
      instrucao: 'Corte a informação que explica o fato. Ex.: tire o "após aprovação da Câmara".',
      valor: 2,
    },
    {
      id: 'exagero',
      nome: 'Exagero',
      instrucao: 'Aumente um número ou o tamanho do fato. Ex.: 5% vira 50%.',
      valor: 3,
    },
    {
      id: 'autoridade',
      nome: 'Autoridade falsa',
      instrucao: 'Ponha a notícia na boca de um especialista ou órgão que não existe. Ex.: "segundo o Instituto Nacional da Verdade".',
      valor: 3,
    },
    {
      id: 'cacaclique',
      nome: 'Manchete caça-clique',
      instrucao: 'Reescreva com uma chamada que obriga a clicar. Ex.: "Você não vai acreditar no que aprovaram".',
      valor: 4,
    },
    {
      id: 'inimigo',
      nome: 'Culpar um inimigo',
      instrucao: 'Diga que a culpa é de um grupo de pessoas. Ex.: "mais uma armação dos de sempre".',
      valor: 4,
    },
    {
      id: 'medo',
      nome: 'Apelo ao medo',
      instrucao: 'Diga que algo terrível vai acontecer com quem lê. Ex.: "sua família corre perigo".',
      valor: 5,
    },
  ];

  const noticias = [
    {
      id: 'chiclete',
      texto: 'Assembleia Legislativa de Mato Grosso aprova a proibição da importação e da venda de chicletes no estado. Quem já tem o produto em casa poderá continuar usando.',
      origem: {
        texto: 'Em 3 de janeiro de 1992, Singapura proibiu a importação e a venda de chicletes. Mascar não virou crime, e desde 2004 só chicletes terapêuticos podem ser vendidos, em farmácias.',
        link: 'https://en.wikipedia.org/wiki/Chewing_gum_sales_ban_in_Singapore',
      },
    },
    {
      id: 'cintura',
      texto: 'Prefeitura de Vila Nova vai medir a cintura dos servidores de 40 a 74 anos no exame anual. Secretarias com muitos funcionários acima do limite terão de apresentar um plano de saúde.',
      origem: {
        texto: 'Desde 2008, a "lei Metabo" do Japão mede a cintura de quem tem de 40 a 74 anos nos exames anuais (limite de 85 cm para homens e 90 cm para mulheres). Empresas com muitos funcionários acima do limite podem pagar mais ao sistema de saúde.',
        link: 'https://www.workforce.com/news/new-japanese-law-requires-employers-to-combat-obesity-in-the-workforce',
      },
    },
    {
      id: 'gordura',
      texto: 'Piauí cria imposto extra sobre alimentos com mais de 2,3% de gordura saturada, como manteiga, queijo e carne. A cobrança começa em outubro.',
      origem: {
        texto: 'Em outubro de 2011, a Dinamarca criou um imposto sobre alimentos com mais de 2,3% de gordura saturada, como manteiga, queijo, carne e pizza. O fim foi anunciado em novembro de 2012, e o imposto acabou em 1º de janeiro de 2013.',
        link: 'https://eurohealthobservatory.who.int/monitors/health-systems-monitor/updates/hspm/denmark-2012/tax-on-saturated-fats-and-added-sugars-has-been-abolished',
      },
    },
    {
      id: 'onibus',
      texto: 'Prefeitura de Vila Nova reajusta a passagem de ônibus em 5% após aprovação da Câmara. O novo valor passa a valer no próximo mês.',
    },
    {
      id: 'cameras',
      texto: 'Câmara de Santa Aurora aprova a instalação de 30 câmeras de monitoramento no centro da cidade. As imagens ficarão com a guarda municipal.',
    },
  ];

  const api = { tecnicas, noticias };

  raiz.JogoConteudo = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
