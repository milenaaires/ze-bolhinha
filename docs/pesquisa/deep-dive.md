# Deep dive — fundamento, stakeholders, soluções e mercado

Este documento reúne o conteúdo do artefato **4. Deep dive (Sessão 5)**, registrado no Notion a partir do board “Imersão Inovação” do Miro. O material foi produzido em 26 e 27/09/2026 e extraído para o Notion em 30/09/2026.

O texto preserva as observações do grupo e separa dados verificados de hipóteses ou referências que ainda precisam de conferência. As classificações de soluções e a matriz são avaliações exploratórias do grupo, não uma auditoria independente.

## 1. Fundamentos do problema

O grupo pesquisou o uso de redes sociais para notícias, o contexto eleitoral, a regulação do impulsionamento e a medição de diversidade informacional.

| Registro do material | Leitura e situação da fonte |
|---|---|
| 81% dos usuários de internet no Brasil usaram redes sociais em 2024. | Confirmado na tabela C5 da [TIC Domicílios 2024, Cetic.br](https://cetic.br/pt/tics/domicilios/2024/individuos/C5/). A pesquisa mede usuários de internet, não toda a população brasileira. |
| Em 2025, 54% dos respondentes no Brasil usavam redes sociais para notícias semanalmente e 42% confiavam nas notícias em geral. | Confirmado no [Digital News Report 2025 — Brasil](https://reutersinstitute.politics.ox.ac.uk/digital-news-report/2025/brazil). São medidas de pesquisa por questionário, não uma avaliação objetiva da qualidade das notícias. |
| O uso de redes sociais para notícias continuou alto em 2026; a confiança geral nas notícias caiu para 36%. | O [Digital News Report 2026 — Brasil](https://reutersinstitute.politics.ox.ac.uk/digital-news-report/2026/brazil) informa que redes sociais ficaram 9 pontos percentuais à frente da TV como fonte semanal de notícias, confiança geral de 36% e uso semanal de chatbots de IA para notícias por 13% dos respondentes. Esse dado atualiza os números de 2025 do Miro. |
| Há regras para transparência de anúncios político-eleitorais impulsionados. | A [Resolução TSE nº 23.732/2024](https://www.tse.jus.br/legislacao/compilada/res/2024/resolucao-no-23-732-de-27-de-fevereiro-de-2024) prevê ferramenta de consulta e acesso a informações sobre valores, período, alcance, público atingido, critérios de segmentação, conteúdo e responsáveis pelo pagamento. O resumo do Miro simplificava esse dispositivo. |
| Um sistema que mostra e permite alterar interesses políticos inferidos pode aumentar a consciência sobre bolhas, mas seus efeitos variam entre usuários. | Compatível com os resultados do estudo de Liu et al. (2024), [How Does Empowering Users with Greater System Control Affect News Filter Bubbles?](https://ojs.aaai.org/index.php/ICWSM/article/view/31364). A interface reduziu a exposição a notícias extremas para a maioria, mas permitiu que alguns usuários fossem para posições mais extremas; em parte dos casos, a diversidade política dos artigos diminuiu. |
| Existem métodos para medir diversidade informacional. | O Miro cita um artigo de 2020 sobre métodos de diversidade. A referência indica uma linha de pesquisa útil, mas o grupo ainda precisa registrar qual métrica pretende usar e por que ela serve ao problema. [Referência indicada no Miro](https://www.sciencedirect.com/science/article/abs/pii/S1568494620307092). |

### Outros números anotados no Miro

O board também registra que 45,6% dos entrevistados pretendiam buscar informações sobre a eleição de 2026 em redes sociais e que 62,9% consideravam a propaganda eleitoral importante para decidir o voto, citando uma pesquisa CNT/MDA. A página da Agência CNT indicada no Miro não abriu durante esta conferência; os números ficam como **referência a validar no relatório original** antes de citação acadêmica.

## 2. Stakeholders

| Stakeholder | Papel descrito | Interesses registrados | Observações do grupo |
|---|---|---|---|
| Eleitor ou usuário | Consome as informações. | Liberdade de escolha, privacidade, acesso à informação, personalização e não ser manipulado. | O usuário pode escolher deliberadamente uma bolha. Uma hipótese é oferecer um modo opcional de diversidade informacional sem obrigá-lo a abandonar os conteúdos que escolheu. |
| Plataformas digitais (Meta, Google, TikTok) | Controlam sistemas de recomendação e distribuição de conteúdo. | Engajamento, retenção, receita, crescimento, experiência de uso e conformidade regulatória. | O grupo apontou como responsabilidades potenciais a transparência das recomendações, controles de personalização, mecanismos de diversidade, dados para auditoria e explicações sobre recomendações. |
| TSE e órgãos reguladores | Estabelecem regras e fiscalizam o ambiente eleitoral. | Integridade eleitoral, transparência, cumprimento das regras e proteção do processo democrático. | Possível atuação em requisitos de transparência e auditoria, sem determinar qual conteúdo político é correto. |
| Organizações de checagem, como Aos Fatos | Avaliam qualidade e veracidade do que circula. | O registro destaca apartidarismo e transparência de fontes, financiamento, metodologia e correções. | O grupo diferencia a decisão das plataformas sobre o que recomendar da avaliação de checadores sobre o que circula. |

**Limite do mapa:** a tarefa de aprofundamento também pedia pagadores, apoiadores, detratores, early adopters, tomadores de decisão e fluxo do dinheiro. Esses papéis não aparecem detalhados no artefato extraído da Sessão 5 e precisam ser completados.

## 3. Soluções existentes mapeadas

As descrições e avaliações abaixo reproduzem o levantamento exploratório registrado pelo grupo. Preços, cobertura, funcionalidades e eficácia podem mudar; não devem ser tratados como comparação atualizada sem nova checagem.

| Solução | Registro e observação do grupo |
|---|---|
| Feed sem algoritmo (Meta, X, YouTube) | Feed cronológico. O grupo anotou que poderia aumentar a exposição a fontes moderadas, mas também a conteúdo político e não confiável. |
| Ground News | Reúne coberturas do mesmo assunto por diferentes veículos. O Miro observou que exige busca ativa e anotou preço de US$ 100 por ano e foco fora do Brasil; preço e escopo precisam de conferência atual. |
| AllSides | Reúne notícias e classifica fontes por espectro político. O grupo anotou foco nos Estados Unidos e opção gratuita com planos pagos. |
| Projeto Comprova (Abraji) | Coalizão de veículos brasileiros voltada à investigação e ao combate à desinformação. |
| Radar Aos Fatos | Descrito no Miro como monitoramento de conteúdo potencialmente enganoso com pontuação, com atuação no Brasil e oferta gratuita e paga. |
| TSE: Fato ou Boato | Conteúdos verificados e materiais educativos, descritos como brasileiros e gratuitos. |
| Bots de IA | O grupo anotou o uso do Grok para perguntar se uma informação é verdadeira. |
| SIADE (TSE) | Sistema de Alertas de Desinformação Eleitoral para denúncias de conteúdo suspeito. O grupo o classificou como reativo. |
| Bad News | Jogo no qual a pessoa cria notícias falsas para aprender técnicas de manipulação. O Miro menciona estudo de 2019 e acesso gratuito, mas não registra a referência do estudo. |

O material da tarefa pedia uma análise de 3 a 5 soluções, incluindo funcionamento, eficácia, contexto de uso e custo. O board lista mais soluções, mas não apresenta fontes ou evidências suficientes para confirmar várias das avaliações acima.

## 4. Mercado e público

### Dados com fonte localizada

- O TSE registrou **158.745.463 eleitoras e eleitores aptos** para o primeiro turno de 2026. Fonte: [TSE — Eleições 2026 em números](https://www.tse.jus.br/comunicacao/noticias/2026/Julho/mais-de-158-milhoes-de-eleitores-estao-aptos-votar-nas-eleicoes-2026).
- No estudo de público jovem do Reuters Institute, a proporção de pessoas de 18 a 24 anos que indicava redes sociais como principal fonte de notícias passou de 21% em 2015 para 39% em 2025. Essa série reúne **nove mercados**, incluindo o Brasil; não é um número exclusivo do Brasil. Fonte: [Understanding young news audiences at a time of rapid change](https://reutersinstitute.politics.ox.ac.uk/understanding-young-news-audiences-time-rapid-change).
- A edição brasileira do Digital News Report 2026 informa que 13% dos respondentes usam chatbots de IA semanalmente para obter notícias. Fonte: [Reuters Institute — Brasil 2026](https://reutersinstitute.politics.ox.ac.uk/digital-news-report/2026/brazil).

### Números anotados no Miro sem referência suficiente

O documento original lista 78% de brasileiros se informando por fontes online; YouTube (37%), Instagram (37%) e WhatsApp (36%) como redes usadas para notícias; e 13% de uso de IA para buscar conteúdo informativo. As perguntas, o ano e as fontes dessas três primeiras medidas não estão claros no trecho extraído. O dado de 13% foi localizado no Digital News Report 2026, mas a formulação precisa ser específica: **uso semanal de chatbots de IA para notícias**.

O board inclui ainda links para relatórios de mercado de monitoramento de desinformação e detecção de deepfakes. Os dados citados estavam em imagens e não foram transcritos; por isso, não foram usados para estimar tamanho de mercado.

## 5. Matriz exploratória de lacunas

O grupo posicionou as soluções em uma matriz de **conveniência/acesso** e **efetividade**. Os eixos foram desenhados à mão e as posições são aproximadas; os critérios e a evidência de cada nota não estão registrados.

| Solução | Conveniência / acesso | Efetividade |
|---|---:|---:|
| Grok (“is it true?”) | Alta | Média |
| Projeto Comprova | Alta | Média |
| Feed sem algoritmo | Média | Baixa |
| Radar Aos Fatos | Média | Média |
| SIADE | Média-baixa | Média-baixa |
| Fato ou Boato | Média-baixa | Média |
| AllSides | Baixa | Baixa |
| Ground News | Baixa | Baixa |
| Bad News | Baixa | Média-baixa |

**Oportunidade formulada pelo grupo:** uma solução que combine efetividade alta com boa conveniência. Nenhuma das opções mapeadas aparece nesse quadrante no desenho original. Essa conclusão depende das avaliações exploratórias acima e precisa ser validada com critérios claros e evidências comparáveis.

## Implicações para a proposta

O mapa de stakeholders e a literatura levantam duas direções para investigar: dar transparência sobre como o diagnóstico é produzido e permitir que a pessoa escolha se quer ampliar a diversidade de fontes. A evidência sobre controles de recomendação mostra efeitos diferentes entre usuários, então o projeto deve testar impactos sem presumir que uma mesma intervenção funciona para todo mundo.

As limitações de acesso às recomendações das plataformas, a definição de uma métrica de diversidade, a verificação de notícias e a privacidade ainda precisam ser exploradas. O conceito de varredura do feed continua sendo uma hipótese de solução.

## Fontes e materiais de origem

- [4. Deep dive (Sessão 5) — Notion](https://app.notion.com/p/3eb939423932812599fad25846e96d6f)
- [Discovery — Imersão de Inovação — Notion](https://app.notion.com/p/3eb93942393281559916e513ee8ea3a6)
- [Board “Imersão Inovação” no Miro](https://miro.com/app/board/uXjVHiYsebg=/?moveToWidget=3458764684790535248)
- [TIC Domicílios 2024 — Cetic.br](https://cetic.br/pt/tics/domicilios/2024/individuos/C5/)
- [Digital News Report 2025 — Brasil](https://reutersinstitute.politics.ox.ac.uk/digital-news-report/2025/brazil)
- [Digital News Report 2026 — Brasil](https://reutersinstitute.politics.ox.ac.uk/digital-news-report/2026/brazil)
- [Resolução TSE nº 23.732/2024](https://www.tse.jus.br/legislacao/compilada/res/2024/resolucao-no-23-732-de-27-de-fevereiro-de-2024)
- [Pesquisa de público jovem — Reuters Institute, 2026](https://reutersinstitute.politics.ox.ac.uk/understanding-young-news-audiences-time-rapid-change)
- [Estudo sobre controle de sistemas de recomendação — ICWSM/AAAI, 2024](https://ojs.aaai.org/index.php/ICWSM/article/view/31364)

As descrições de produtos, a matriz e parte dos números permanecem como registro do que o grupo anotou no Miro. O próprio documento original recomenda conferir referências levantadas com apoio de IA antes de usá-las em pesquisa formal ou no TCC.

## Histórico de versões

| Versão | Data | Alteração | Responsável pela edição |
|---|---|---|---|
| 1.0 | 13/10/2026 | Conteúdo do deep dive da Sessão 5 organizado a partir do Notion, com fontes e limites de validação registrados. | Milena Aires |
