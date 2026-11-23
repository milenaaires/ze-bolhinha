# Bolha Eleitoral — protótipo jogável

Jogo de cartas e controle territorial para **exatamente 5 pessoas no mesmo computador**: 2 Quadrados ■, 2 Triângulos ▲ e 1 Algoritmo 🤖. A campanha dura 6 semanas e acontece num mapa do Brasil dividido em 5 regiões. A disputa é por influência, com notícias (verdadeiras, falsas, enganosas e sensacionalistas), campanha de rua, WhatsApp e checagem de fatos. O Algoritmo decide o que viraliza.

Protótipo do projeto Zé Bolhinha. Grupos, candidatos e notícias são fictícios, exceto as cartas marcadas como **📚 Fato histórico**, que trazem a fonte.

**Regras completas para jogadores:** [REGRAS.md](REGRAS.md).

## Como rodar

**Online:** [milenaaires.github.io/ze-bolhinha/jogo/](https://milenaaires.github.io/ze-bolhinha/jogo/). O GitHub Pages publica esta pasta (sem `tools/`) a cada envio para `main` que altere algo aqui.

**Local:** abra `index.html` direto no navegador (Chrome, Edge ou Firefox). Não precisa de servidor nem de instalação. Sem internet, o jogo funciona com fontes do sistema.

A partida é salva automaticamente no navegador. A tela inicial mostra **Continuar partida** se houver uma em andamento.

## Estrutura

| Arquivo | O que tem |
|---|---|
| `index.html` | Página única. Carrega os scripts em ordem, sem módulos, para funcionar via `file://`. |
| `css/style.css` | Identidade visual: mesa de papel kraft, cartas tipo santinho/jornal e o painel escuro do Algoritmo. |
| `js/data.js` | Conteúdo: regiões, candidatos, cartas, eventos e missões. **Para adicionar cartas, mexa só aqui.** |
| `js/engine.js` | Regras puras, sem DOM. Recebe e devolve estado. |
| `js/map.js` | Mapa do Brasil em SVG (contornos simplificados) com placas de cada região. |
| `js/ui.js` | Telas, mesa, mão privada, painel do Algoritmo, revelação, apuração. |
| `tools/sim.js` | Simulador de balanceamento: `node tools/sim.js 2000`. |

## Design

### Os três interesses

1. **Quadrados** querem vencer a eleição (vitória coletiva dos dois candidatos).
2. **Triângulos**, idem.
3. **Algoritmo** quer cumprir a própria missão secreta. Não disputa a eleição.

Cada candidato tem ainda uma **missão secreta individual** que vale pontos mesmo se o grupo perder. Nenhuma missão impede a cooperação dentro do grupo, mas algumas (Fenômeno das Urnas, Dono do Feed) criam rivalidade com o colega.

**Placar final:** grupo vencedor +6, missão +5, metade da reputação. Algoritmo: missão +9, +1 a cada 40 de engajamento. Se a confiança pública chegar a 0, a eleição é **contestada** e todo mundo perde 2 pontos.

### Neutralidade entre Quadrados e Triângulos

- Os dois grupos compram do **mesmo baralho**: qualquer um pode usar desinformação ou checagem.
- Cada grupo tem um candidato **Palanque** (bônus em rua) e um **Viral** (bônus em notícias), com números idênticos.
- Todas as regiões começam 30 × 30 com 40% de indecisos.
- **Pauta** e **resistência à desinformação** das regiões são sorteadas a cada partida, para não sugerir que alguma região real seja mais "enganável".
- A ordem dos turnos gira a cada semana e alterna os grupos (■ ▲ ■ ▲).
- Cores (roxo e verde-água) foram escolhidas por terem pouca associação partidária. A identidade principal é a forma.
- A polarização não favorece nenhum grupo: favorece **quem já lidera** cada região.

### Fluxo de uma semana

| Fase | Quem age | O que acontece |
|---|---|---|
| 1. Evento | todos (público) | Uma carta de evento muda o cenário (crise, debate na TV, final do campeonato…). |
| 2. Assunto do momento | Algoritmo (público) | Escolhe entre 2 pautas: notícias dessa pauta ganham +1 de viralidade e +1 de efeito. |
| 3. Campanha | cada candidato, em privado | Recebe verba, joga até 2 cartas, panfleta (+1 grátis) e pode trocar 1 carta. Notícias entram no Feed com a manchete visível e a veracidade escondida. |
| 4. Distribuição | Algoritmo, em privado | Distribui pontos de alcance (0 a 4) entre os posts e pode jogar 1 carta própria. Vê o quanto cada post engaja, **não se é verdadeiro**. |
| 5. Reação | todos (público) | Cada post é revelado. Falsos e enganosos rolam o dado da checagem popular. O efeito é aplicado no mapa. |
| 6. Consequências | automático | Desinformação → polarização; radicalização; escândalo de viés; CPI das plataformas. |

Antes de cada fase privada aparece uma tela de **"passe o computador"**. Só a pessoa da vez clica para revelar a mão e a missão.

### Mapa e território (inspiração War/Risk)

- Cada região tem apoio ■, apoio ▲ e indecisos. Com **5+ pontos de vantagem**, o grupo **controla** a região.
- Controlar 2 ou mais regiões dá +R$ 1 por turno (4 ou mais: +R$ 2).
- **Caravana da Expansão** só avança para regiões vizinhas do seu território.
- O resultado é por **voto popular nacional**, com peso de cada região ≈ distribuição do eleitorado (TSE, 2022: SE 43%, NE 27%, S 15%, N 8%, CO 7%). Dá para controlar 4 regiões e perder a eleição. O jogo avisa isso na apuração, porque é assim que funciona de verdade.

### Como o Algoritmo ensina

- **Engajamento = alcance × viralidade.** Fakes e sensacionalismo têm viralidade alta; conteúdo verdadeiro e útil, baixa.
- O Algoritmo **não vê a veracidade**. Para saber, precisa gastar uma carta (Moderação) e perder engajamento.
- Impulsionar um grupo numa região faz crescer uma **bolha**: conteúdo do mesmo lado ganha força, o do outro lado perde (viés de confirmação).
- Dar mais alcance a um grupo que ao outro acumula **viés**. Em ±6, estoura um escândalo (−8 de engajamento, −2 de alcance).
- Se a confiança pública cai para 3 ou menos, abre-se a **CPI das plataformas**: −2 de alcance. Maximizar engajamento a qualquer custo prejudica o próprio Algoritmo.
- Mensagens pelo **Zap** fogem do controle do Algoritmo e são mais difíceis de checar, como no WhatsApp real.

### Polarização (0–10)

Sobe com sensacionalismo impulsionado, ataques virais, desinformação acumulada e bolhas fechadas. Efeitos:

- **6+**: ninguém converte eleitor adversário, só os indecisos se movem.
- **7+**: radicalização. Indecisos migram para quem já domina cada região.
- **8+**: apelos ao diálogo valem 1 a menos e a mentira ganha +2 de viralidade.

Desce com Debate Construtivo, Educação Midiática, Contextualização e alguns eventos.

### Notícias e veracidade

- **Falsas**: baratas (R$ 1) e fortes. Ao circular, rolam d6 + resistência da região (+ bônus) contra 7. Se forem pegas, o tiro sai pela culatra: o grupo perde apoio e o autor perde reputação.
- **Enganosas** (fora de contexto, montagem, gráfico manipulado): mais difíceis de pegar (precisa de 8).
- **Sensacionalistas**: verdadeiras, mas exageradas. Não são removidas, mas polarizam.
- **Verdadeiras**: mais caras e menos virais, mas nunca dão errado e podem ganhar selo ✔.
- **Fatos históricos** com fonte: Cacareco (SP, 1959), Macaco Tião (RJ, 1988), urna eletrônica (desde 1996), Lei da Ficha Limpa (LC 135/2010). São "notícias absurdas porém verdadeiras".

Toda revelação mostra **por que** a notícia é falsa, enganosa ou verdadeira.

## Balanceamento (simulação)

`node tools/sim.js 2000` roda partidas com robôs que jogam cartas aleatórias. Resultados da última calibração:

| Cenário | Vitórias ■ / ▲ | Eleições contestadas |
|---|---|---|
| Todos mistos, Algoritmo aleatório | 48,6% / 51,4% | 15% |
| Todos mistos, Algoritmo caça-engajamento | 51,1% / 48,9% | 32% |
| Todos mistos, Algoritmo neutro | 50,5% / 49,5% | 32% |
| ■ honestos × ▲ só fake | 45,9% / 54,1% | 8% |
| ■ só fake × ▲ honestos | 54,7% / 45,3% | 9% |

- **Os grupos estão equilibrados** (~50/50 com estratégias iguais).
- **Desinformação dá uma vantagem eleitoral pequena (~4–5 pontos)**, mas não decisiva. Isso é intencional: o jogo mostra que a mentira funciona no curto prazo, mas custa reputação, confiança pública e as missões Ficha Limpa e Pacificador. Vale observar nos playtests se essa margem parece justa.
- O Algoritmo que só persegue engajamento derruba a confiança (média final 3,5) e dobra as eleições contestadas.
- Taxas de missão com robôs vão de ~5% a ~50%. Robôs não perseguem missões, então pessoas de verdade devem cumprir bem mais. **Onipresente**, **Treta Rende** e **Pacificador** são as mais difíceis e são as primeiras candidatas a ajuste depois dos playtests.

## O que validar nos playtests

- O Algoritmo se diverte? Ele tem decisões reais toda semana (assunto do momento + distribuição + carta)?
- As pessoas entendem por que um post "deu tiro pela culatra"?
- Alguém usou checagem por estratégia (e não só por ética)?
- A duração (6 semanas × 5 turnos) cabe numa aula? Estimativa: 60–90 min.
- A margem de vantagem da desinformação parece certa?

## Limitações conhecidas

- Mapa com contornos simplificados, sem estados.
- Não há segundo turno: com dois grupos, a apuração é direta.
- Não há negociação formal entre colegas de grupo; a conversa é livre na mesa.
- Sem som e sem modo online. Tudo roda num computador só.
- O Algoritmo escolhe o assunto do momento em público. Dá para tornar isso privado numa próxima versão.

## Próximos passos sugeridos

- Cartas de evento com escolha (dilemas para o Algoritmo ou para os candidatos).
- Mais fatos históricos verificáveis, com link de fonte.
- Estados dentro das regiões para uma disputa territorial mais granular.
- Modo "facilitador" para sala de aula, com pausa para discussão a cada revelação.
