# Quem Conta um Conto

Protótipo de baixa fidelidade de um jogo de telefone sem fio da desinformação, feito para uma demonstração com colegas da residência. Ele mostra, na prática, como uma notícia política pequena vira desinformação em poucas mãos e como o algoritmo premia cada distorção.

## Como abrir

Dê um duplo clique em `index.html`. O jogo abre em qualquer navegador, sem instalação e sem internet. As fontes vêm do Google Fonts quando há conexão; sem ela, o navegador usa fontes do sistema.

## Como jogar

1. Cadastrem de 3 a 6 jogadores, na ordem em que vão jogar, e cliquem em "Começar".
2. Passem o computador de mão em mão. Na sua vez, você vê só a versão escrita por quem jogou antes, escolhe uma das 3 cartas de técnica e reescreve a notícia usando aquela técnica.
3. Depois de duas voltas, todos olham juntos a revelação: a notícia original, a final, o caminho entre elas, o alcance e quem o algoritmo mais premiou. A tela termina com três perguntas para a conversa.

Para jogar de novo, recarregue a página.

## Arquivos

- `index.html`: telas e estilo.
- `logica.js`: regras da partida, sem depender da tela.
- `conteudo.js`: cartas de técnica e notícias de partida.
- `testes/`: testes das regras e do conteúdo.

Para rodar os testes (Node 22 ou mais recente):

```bash
node --test "prototipos/jogo-distorcao-noticias/testes/*.test.js"
```

## As notícias e suas origens

Todas as notícias são fictícias e não citam políticos nem partidos reais. Três delas transplantam para o Brasil um fato que aconteceu em outro país. A revelação mostra a origem verdadeira, conferida nestas fontes:

- Proibição de chicletes em Singapura, em 3 de janeiro de 1992: https://en.wikipedia.org/wiki/Chewing_gum_sales_ban_in_Singapore
- "Lei Metabo" do Japão, de 2008, que mede a cintura de quem tem de 40 a 74 anos: https://www.workforce.com/news/new-japanese-law-requires-employers-to-combat-obesity-in-the-workforce
- Imposto sobre gordura saturada da Dinamarca, de outubro de 2011 a janeiro de 2013: https://eurohealthobservatory.who.int/monitors/health-systems-monitor/updates/hspm/denmark-2012/tax-on-saturated-fats-and-added-sugars-has-been-abolished
