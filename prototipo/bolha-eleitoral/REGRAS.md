# Bolha Eleitoral — Regras do jogo

## Em uma frase

Dois times, **Quadrados ■** e **Triângulos ▲**, disputam uma eleição usando notícias verdadeiras e falsas. Um quinto jogador, **o Algoritmo 🤖**, decide quais notícias viralizam.

---

## 1. Quem joga

O jogo é sempre para **5 pessoas**, no mesmo computador.

| Papel | Quantas pessoas | O que quer |
|---|---|---|
| ■ Quadrados | 2 | Ganhar a eleição com o colega de time |
| ▲ Triângulos | 2 | Ganhar a eleição com o colega de time |
| 🤖 Algoritmo | 1 | Cumprir a própria missão secreta (não torce para ninguém) |

### Os candidatos

Cada time tem dois candidatos com estilos diferentes. Os dois times têm exatamente os mesmos estilos.

| Estilo | Candidatos | Vantagem |
|---|---|---|
| **Palanque** | Dona Quitéria Esquadro ■ · Seu Tonho Vértice ▲ | Cartas de rua que miram uma região dão +1 de apoio. Começa com R$ 6. |
| **Viral** | Kiko Quina ■ · Tati Triangulina ▲ | Suas notícias têm +1 de viralidade. Segura até 6 cartas na mão (os outros seguram 5). Começa com R$ 5. |

---

## 2. Como se ganha

- **Eleição (vitória do time):** depois de **6 semanas**, ganha o time com mais **votos válidos no país inteiro**.
- **Missão secreta (vitória individual):** cada jogador recebe uma missão que só ele vê. Cumprir a missão dá pontos mesmo que o time perca. O Algoritmo vence se cumprir a dele.

Ou seja, a partida pode ter mais de um vencedor: o time que ganhou a eleição, quem cumpriu a missão e o Algoritmo.

---

## 3. O mapa

O Brasil é dividido em 5 regiões. Cada região mostra:

- **■ apoio dos Quadrados**, **▲ apoio dos Triângulos** e **? indecisos**. Os três somam 100.
- **Peso nos votos**: Sudeste 43%, Nordeste 27%, Sul 15%, Norte 8%, Centro-Oeste 7%.
- **Pauta** (💰 🏥 🚨 📚 🌳): o assunto que a região mais valoriza.
- **🛡 Resistência à desinformação** (1 a 3): quanto maior, mais fácil a população perceber uma fake.
- **🫧 Bolha**, quando existe: indica que a região só está ouvindo um dos lados.

> A pauta e a resistência de cada região são **sorteadas** a cada partida. Elas não representam dados reais.

**Controlar uma região:** o time com **5 ou mais pontos de vantagem** controla a região. A região fica pintada com a cor e a forma do time; se a diferença for menor, aparece listrada (em disputa).

Controlar regiões rende dinheiro extra a cada turno:

- 2 ou mais regiões: +R$ 1.
- 4 ou mais regiões: +R$ 2.

> **Importante:** quem decide a eleição é o **voto popular**, como no Brasil de verdade. Dá para controlar 4 regiões e perder, se o adversário ganhar com folga no Sudeste.

### Como o apoio muda

- **Ganhar apoio:** os pontos saem primeiro dos **indecisos**. Se não houver indecisos, metade do que sobrar é tirada do adversário, mas só enquanto a polarização estiver abaixo de 6.
- **Atacar:** tira apoio do adversário. Esses pontos voltam a ser indecisos.

---

## 4. Uma semana (rodada)

Cada semana tem 6 fases. Os títulos e os botões da tela mostram em que fase vocês estão.

### Fase 1 — Evento 📅 (todos veem)

Uma carta de evento muda o cenário. Exemplos: crise econômica, debate na TV, final do campeonato. A primeira semana e a última têm eventos fixos.

### Fase 2 — Assunto do momento 🔥 (Algoritmo escolhe, todos veem)

O Algoritmo escolhe entre duas pautas. Durante a semana, notícias dessa pauta ganham +1 de viralidade e +1 de efeito.

### Fase 3 — Campanha (cada candidato, em segredo)

A tela pede para **passar o computador**. Só quem está na vez clica em **"Sou eu, pode mostrar"**.

Ao começar a vez, você recebe:

- **Verba:** R$ 3, mais o bônus por regiões controladas. O máximo é R$ 12.
- **Cartas:** você compra até completar a mão.

Na sua vez, você pode:

- **Jogar até 2 cartas**, pagando o custo de cada uma (R$ no canto da carta).
- **Panfletar** uma vez, de graça: +1 de apoio numa região.
- **Trocar 1 carta** por R$ 1.
- Ver a sua **🕵️ Missão secreta** e o progresso dela.

Quando terminar, clique em **Encerrar turno**.

A ordem dos candidatos muda toda semana e sempre alterna os times (■ ▲ ■ ▲).

Toda semana também aparecem **2 posts de "Simpatizantes"**, um de cada time. Eles caem no Feed sozinhos, sem ninguém jogar.

### Fase 4 — Distribuição 🤖 (Algoritmo, em segredo)

O Algoritmo vê todas as manchetes do Feed e decide o **alcance** de cada uma:

| Alcance | Nome | Custo |
|---|---|---|
| 0 | Enterrar (ninguém vê) | 1 ponto |
| 1 | Normal | grátis |
| 2 | Impulsionar | 1 ponto |
| 3 | Viralizar | 2 pontos |
| 4 | Explodir | 3 pontos |

Ele tem **6 pontos por semana**. O Algoritmo também pode jogar **1 carta** própria por semana.

> O Algoritmo **não sabe se a notícia é verdadeira ou falsa**. Ele só vê a manchete e quanto ela engaja.

### Fase 5 — Reação da população 👥 (todos veem)

As notícias são reveladas uma a uma, com um carimbo:

- **FAKE NEWS**
- **ENGANOSA**
- **SENSACIONALISTA**
- **VERDADEIRA**

O apoio muda no mapa na hora. Cada revelação explica **por que** a notícia é o que é.

### Fase 6 — Consequências ⚖️ (automático)

O jogo atualiza a polarização e a confiança, e aplica as punições ao Algoritmo (seção 8). Depois, começa a próxima semana.

---

## 5. As cartas dos candidatos

Os dois times compram do **mesmo baralho**. Todo mundo pode mentir, e todo mundo pode checar.

### 📰 Notícias: vão para o Feed

Na mão, você vê se a notícia é verdadeira ou falsa. Quando ela vai para o Feed, os outros só veem a manchete. Você escolhe a região que ela vai mirar.

| Tipo | Custo | Força | O que acontece |
|---|---|---|---|
| **Falsa** | R$ 1 | forte | Pode colar e dar muito apoio. Também pode ser desmascarada e dar prejuízo. |
| **Enganosa** (fora de contexto, montagem) | R$ 1 | média | Mais difícil de pegar que a falsa. |
| **Sensacionalista** | R$ 1 | fraca, mas muito viral | É verdade, mas exagerada. Não é removida, mas aumenta a polarização. |
| **Verdadeira** | R$ 1–2 | média, pouco viral | Nunca dá errado. Se for checada, ganha selo ✔ (+1). |

Cada notícia tem:

- **💪 efeito:** quanto apoio ela move.
- **🔥 viralidade:** quanto ela engaja.
- **Modo:**
  - **⬆ promove:** seu time ganha apoio.
  - **⬇ ataca:** o adversário perde apoio.
  - **✖ protesto:** os dois times perdem apoio.

As cartas marcadas **📚 Fato histórico** são notícias reais e absurdas, com fonte. Exemplos: o rinoceronte Cacareco e o Macaco Tião, que receberam votos de protesto.

### 📣 Rua: efeito na hora, sem Algoritmo

| Carta | Custo | Efeito |
|---|---|---|
| Chuva de Santinhos | R$ 1 | +2 na região |
| Comício na Praça | R$ 3 | +4 na região |
| Entrevista na Rádio Comunitária | R$ 2 | +3 na região e +1 de reputação |
| Jingle Chiclete | R$ 2 | +2 na região e +1 em cada região vizinha |
| Caravana da Expansão | R$ 2 | +4 numa região **vizinha** de uma que seu time controla |
| Horário Eleitoral Gratuito | R$ 4 | +1 em todas as regiões |
| Promessa Mirabolante | R$ 1 | +4 agora. Na semana seguinte: −2 na região e −1 de reputação |
| Marqueteiro de Grife | R$ 2 | +2 de reputação |
| Boca de Urna | R$ 2 | Só na última semana. +3 na região, mas com 1 ou 2 no dado você é pego: efeito anulado e −2 de reputação |

### 📱 Zap & Redes: por fora do Algoritmo

| Carta | Custo | Efeito |
|---|---|---|
| Tia do Zap | R$ 1 | Sua **próxima notícia neste turno** vai pelo WhatsApp: o Algoritmo não controla, ela chega com alcance 2 e é mais difícil de desmentir |
| Corrente “Repasse pra 10 grupos” | R$ 2 | Igual à Tia do Zap, e a notícia também se espalha para as regiões vizinhas com metade do efeito |
| Disparo em Massa | R$ 4 | +2 em todas as regiões. Com 1 ou 2 no dado, é pego: anulado e −3 de reputação. A confiança cai 1 de qualquer jeito |
| Influenciador Contratado | R$ 3 | Suas notícias da semana ganham +1 de alcance **depois** da decisão do Algoritmo e nunca ficam abaixo de 1 |
| Fazenda de Robôs | R$ 2 | Suas notícias parecem +2 mais virais para o Algoritmo. Se ele usar Detecção de Bots, você perde 2 de reputação |

> Para usar a Tia do Zap ou a Corrente, você precisa ter uma notícia na mão e ainda ter uma jogada sobrando no turno.

### 🔎 Checagem: contra a desinformação

| Carta | Custo | Efeito |
|---|---|---|
| Checagem de Fatos | R$ 1 | Escolha um post do Feed. Se for falso ou enganoso, ele é removido, o autor perde 2 de reputação e você ganha 1. Se for verdadeiro, ganha selo ✔ |
| Jornalismo Investigativo | R$ 3 | Remove todos os posts falsos ou enganosos que miram uma região |
| Educação Midiática | R$ 2 | Resistência da região +1, polarização −1, reputação +1 |
| Debate Construtivo | R$ 2 | Polarização −2, os **dois** times ganham +1 na região, reputação +1 |
| Contextualização | R$ 1 | Bolha da região −2 |
| Fontes Confiáveis | R$ 1 | Confiança +1, desinformação −1, reputação +1 |

> Checar não é só "jogar limpo": derrubar uma fake do adversário tira o apoio que ele ganharia e ainda custa reputação a ele.

---

## 6. Quando uma notícia é revelada

### Se for falsa ou enganosa, rola o dado da população

```
dado (1 a 6) + resistência da região + bônus  →  precisa chegar a 7 (falsa) ou 8 (enganosa)
```

Bônus que somam ou subtraem:

- +1 se a notícia viralizou (alcance 3 ou mais): mais gente vê, mais gente checa.
- +1 se a confiança pública está em 7 ou mais.
- +2 na semana do evento "Investigação jornalística".
- −1 se a notícia veio pelo Zap.

O resultado:

- **Pegaram a mentira:** tiro pela culatra. O time perde 2 de apoio na região e o autor perde 2 de reputação.
- **Ninguém percebeu:** a notícia faz efeito completo. Em troca, a desinformação sobe e a confiança pública cai.

### Quanto apoio a notícia dá

- O **alcance** multiplica o efeito: ×1 (normal), ×1,5, ×2 ou ×2,5 (explodir). Com alcance 0, nada acontece.
- **+1** se a pauta da notícia é a pauta da região.
- **+1** se a pauta é o assunto do momento.
- **Bolha:** se a região está numa bolha do seu time, você ganha + o nível da bolha. Se a bolha é do outro time, você perde.
- Notícias **verdadeiras** perdem 1 se a confiança pública estiver em 3 ou menos, ou se o autor tiver reputação abaixo de 3.

---

## 7. Os indicadores

Ficam no topo da tela.

### ⚡ Polarização (0 a 10) — começa em 3

**Sobe quando:**

- uma notícia sensacionalista é impulsionada;
- um ataque viraliza;
- a desinformação acumula (4 ou mais);
- uma bolha chega ao nível 3.

**Desce com:** Debate Construtivo, Educação Midiática, Contextualização e alguns eventos.

| Nível | O que acontece |
|---|---|
| **6+** | Ninguém muda de lado. Só os indecisos se movem. |
| **7+** | **Radicalização:** a cada semana, indecisos vão para quem já lidera cada região. |
| **8+** | Apelos ao diálogo valem 1 a menos, e fake e sensacionalismo ficam ainda mais virais. |

> A polarização não favorece nenhum time. Ela favorece **quem já está na frente**.

### 🤝 Confiança pública (0 a 10) — começa em 6

**Cai quando:** fakes e conteúdos enganosos circulam sem ser pegos, há disparo em massa ou a desinformação acumula.

**Sobe com:** checagem, fontes confiáveis e informação verdadeira viralizando.

| Nível | O que acontece |
|---|---|
| **7+** | A população desconfia mais: +1 para desmascarar fakes. |
| **3 ou menos** | Ninguém acredita nem no que é verdade: notícias verdadeiras perdem 1. Abre-se a **CPI das plataformas**: o Algoritmo perde 2 pontos de alcance na semana seguinte. |
| **0 no fim do jogo** | **Eleição contestada:** todos perdem 2 pontos. |

### 🦠 Desinformação (0 a 10) — começa em 2

Mede quanta mentira está circulando. Diminui 1 sozinha a cada semana.

- **4 ou mais:** polarização +1 por semana.
- **5 ou mais:** confiança −1 por semana.

### 📈 Engajamento

É o "lucro" do Algoritmo. Cada post rende:

```
engajamento = alcance × viralidade
```

Posts enviados pelo Zap não rendem engajamento para o Algoritmo.

### ⭐ Reputação de cada candidato (0 a 10) — começa em 6

- **Cai** quando você é pego mentindo ou fazendo algo ilegal.
- **Sobe** com checagem, debate e transparência.
- **Abaixo de 3:** suas cartas de rua e suas notícias verdadeiras perdem 1 de efeito.
- Também serve de desempate na eleição.

### 👥 Popularidade de cada candidato

Quanto apoio você gerou com as suas jogadas. Só serve para as missões.

---

## 8. Regras do Algoritmo

### Bolhas 🫧

Quando o Algoritmo **impulsiona** (alcance 2 ou mais) um post de um time numa região, a bolha daquela região cresce para esse time, até o nível 3.

Dentro da bolha, o conteúdo do mesmo time ganha força e o do outro perde. É o viés de confirmação: as pessoas acreditam no que já pensam.

### Viés ⚖️

O jogo soma quanto alcance extra cada time recebeu. Se o Algoritmo favorecer um lado e o saldo chegar a **±6**, estoura um **escândalo**:

- −8 de engajamento;
- −1 de confiança pública;
- −2 de alcance na semana seguinte.

O medidor de viés aparece no cartão do Algoritmo, visível para todos. Sem escândalo, o viés volta 1 ponto em direção ao zero a cada semana.

### Cartas do Algoritmo

Ele começa com 2 cartas, compra 1 por semana (no máximo 4 na mão) e joga no máximo 1 por semana.

| Carta | Efeito |
|---|---|
| Bolha de Filtro | Aumenta a bolha de uma região para um time (conta +2 de viés) |
| Assunto do Momento | Uma pauta ganha +2 de viralidade na semana |
| Shadowban | Um post fica com alcance 0, sem gastar pontos |
| Moderação de Conteúdo | Revela, só para o Algoritmo, a veracidade dos 2 posts mais virais. Custa −3 de engajamento |
| Rótulo “Contexto Adicionado” | Fakes da semana têm efeito e engajamento pela metade. Confiança +1 |
| Detecção de Bots | Anula as Fazendas de Robôs da semana. Confiança +1 |
| Recomendação em Cascata | Um post também chega às regiões vizinhas com metade do efeito |
| Câmara de Eco | Numa região, posts do time dono da bolha têm efeito dobrado. Polarização +1 |
| “Você está há 3h no app” | Polarização −1, confiança +1, engajamento −5 |
| Atualização do Algoritmo | Todas as bolhas −1, viés reduzido em 3 |
| Monetização Agressiva | +3 pontos de alcance na semana. Confiança −1 |

---

## 9. Missões secretas

### Dos candidatos

Cada candidato recebe uma missão sorteada:

| Missão | Para cumprir |
|---|---|
| Corredor Norte–Nordeste | Seu time controla o Norte e o Nordeste no fim |
| Eixo Sul–Centro-Oeste | Seu time controla o Sul e o Centro-Oeste no fim |
| Coração do Eleitorado | Seu time lidera o Sudeste por 8 pontos ou mais |
| Ficha Limpa | Terminar com reputação 8+ sem nunca ter publicado fake ou conteúdo enganoso |
| Fenômeno das Urnas | Ser o candidato mais popular, mesmo que o time perca |
| Caça-Boatos | Desmascarar 2 ou mais conteúdos falsos com cartas de checagem |
| Voto Consciente | Seu time controla as regiões que começaram com resistência 3 |
| Crise Fabricada | Os dois adversários terminam com reputação 4 ou menos |
| Dono do Feed | Ter mais engajamento que qualquer outro candidato, com 5 ou mais notícias publicadas |
| Pacificador(a) | Polarização 5 ou menos no fim, e seu time controla 2 ou mais regiões |

### Do Algoritmo

Ele recebe uma missão sorteada:

| Missão | Para cumprir |
|---|---|
| Máquina de Cliques | Engajamento 190+ e confiança final 3 ou mais |
| Treta Rende | Polarização 6+ em pelo menos 3 semanas, sem nunca chegar a 10 |
| Guardião da Confiança | Confiança final 7+ e engajamento 95+ |
| Onipresente | Todas as regiões com alcance acumulado 6+, viés final entre −3 e +3, e nenhum escândalo |
| Final de Novela | Diferença final de 6 pontos ou menos entre os times, e engajamento 150+ |

---

## 10. Fim de jogo e placar

Depois da semana 6, as urnas abrem. A tela final mostra:

- quem venceu a eleição;
- o resultado de cada região;
- todas as missões reveladas;
- o **Raio-X da desinformação**: quantas fakes circularam, quantas foram pegas e quanto do apoio veio de mentira.

**Desempate:** se a eleição empatar, ganha o time com mais reputação somada.

### Placar individual

| Jogador | Pontos |
|---|---|
| Candidato | +6 se o time venceu · +5 se cumpriu a missão · + metade da reputação |
| Algoritmo | +9 se cumpriu a missão · +1 a cada 40 de engajamento |
| Todos | −2 se a eleição foi contestada (confiança 0) |

---

## 11. Dicas para a primeira partida

- **Candidatos:** comecem com cartas de rua e notícias verdadeiras, para sentir o mapa. Guardem a Checagem para quando aparecer uma manchete suspeita do adversário.
- **Algoritmo:** olhe a sua missão antes de tudo. Ela diz se você quer engajamento, confiança ou equilíbrio. E fique de olho no medidor de viés.
- **Todos:** depois de cada revelação, leiam o quadro **"📚 Por que é…"**. É ali que o jogo ensina.
- Na dúvida, o botão **?** no topo da tela mostra um resumo das regras.
