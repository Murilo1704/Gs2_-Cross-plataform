# Território Vivo: Painel de Inteligência Territorial

Aplicativo mobile em **React Native (Expo)** que funciona como a central de decisões de um gestor público. O app
reúne dados de clima, consumo de água e energia, resíduos e demanda por serviços de saúde para **antecipar
problemas** que afetam a qualidade de vida de um território (cidade, bairro ou comunidade rural). Ele **apoia a
decisão humana, sem automatizar decisões de alto impacto**.

> Global Solution 2026.2 · FIAP · Ciência da Computação (2º ano, turma de fevereiro)
> Disciplina: Cross-Platform Application Development

## Integrantes

| Nome completo | RM |
|---|---|
| _Nome do integrante 1_ | _RM00000_ |
| _Nome do integrante 2_ | _RM00000_ |
| _Nome do integrante 3_ | _RM00000_ |

## O problema

Calor extremo, chuva forte, aumento no consumo de água e energia e filas nas unidades de saúde costumam ser
percebidos só **depois** que já afetam a população. O gestor público raramente tem, num só lugar, os sinais que
permitiriam agir antes. O Território Vivo junta esses sinais, projeta os próximos 7 dias e explica **por que**
cada alerta foi gerado, **quanto** se pode confiar nele e **quando não** confiar. A decisão final fica sempre com
uma pessoa.

**Cidadão beneficiado:** moradores de áreas urbanas densas, periferias e comunidades rurais, em especial idosos,
crianças e trabalhadores ao ar livre, os mais afetados por calor, enchentes e sobrecarga dos serviços.

### Objetivos de Desenvolvimento Sustentável (ODS)

- **ODS 11: Cidades e comunidades sustentáveis.** Planejamento de serviços urbanos com base em dados.
- **ODS 3: Saúde e bem-estar.** Antecipação da demanda na rede de saúde e alertas de calor.
- **ODS 13: Ação contra a mudança global do clima.** Preparação para ondas de calor e chuvas extremas.
- **ODS 10: Redução das desigualdades.** Territórios urbanos, periurbanos e rurais monitorados lado a lado.

## Funcionalidades

| Requisito da GS | Como foi atendido |
|---|---|
| Dashboards com gráficos e indicadores | **Painel:** resumo de risco, KPIs semanais com variação e gráfico de demanda de saúde x capacidade. **Tendências:** série de 14 dias observados + 7 previstos por tema, com intervalo de 95%. |
| Alertas preditivos com justificativa, confiança e limitações | **Alertas:** 6 temas avaliados (água, energia, calor, chuva, resíduos, saúde). No detalhe aparecem evidências numéricas, nível de confiança decomposto em fatores, lista de limitações, ações sugeridas, modelo e fontes. |
| Apoio à decisão sem automatizar decisões de alto impacto | O app só **sugere** ações e nada é executado automaticamente. Alertas de risco alto são marcados como "alto impacto: exige decisão humana". A aba **Decisões** lista os alertas que aguardam avaliação e o histórico de decisões registradas por um gestor, com justificativa. |

### Telas

1. **Painel:** visão geral do território, alertas pendentes de decisão e indicadores.
2. **Tendências:** gráfico e estatísticas por tema, com explicação do modelo.
3. **Alertas:** lista filtrável por nível de risco. Ao tocar em um alerta, abre o **Detalhe**.
4. **Detalhe do alerta:** evidência, gráfico, justificativa, confiança, limitações, ações sugeridas e decisões.
5. **Registrar decisão** (formulário): encaminhar ação, manter em monitoramento ou descartar.
6. **Decisões:** alertas aguardando avaliação e histórico (com exclusão).
7. **Ajustes:** acessibilidade, privacidade e exclusão de dados.

## Requisitos técnicos

| Requisito | Implementação |
|---|---|
| React Native | Expo SDK 58 + React Native 0.88, roda em Android, iOS e web |
| Navegação entre telas | `expo-router`: abas (`src/app/(tabs)`) + pilha para detalhe e formulário modal |
| Gerenciamento de estado | Context API + `useReducer` (`src/state`) |
| Consumo de APIs | Open-Meteo (`src/services/weatherService.js`) com timeout e fallback para cache e depois para dados sintéticos |
| Persistência de dados | AsyncStorage (`src/services/storage.js`): território, ajustes, decisões e último clima (uso offline) |
| Formulários com validação | Registro de decisão (`src/app/decisao/[alertId].js` + `src/utils/validation.js`) |
| Componentes reutilizáveis com identidade visual | 23 componentes em `src/components` + tema em `src/theme` (verde território + laranja cidade) |
| Acessibilidade e privacidade | Ver seções abaixo |

### Validações do formulário de decisão

- Tipo de decisão obrigatório. Ao encaminhar, é obrigatório escolher qual ação sugerida.
- Justificativa entre 20 e 500 caracteres, **sem dados pessoais**: CPF, e-mail e telefone são bloqueados.
- Nome do gestor obrigatório, só com letras (dispensado no modo de decisões anônimas).
- Data de reavaliação no formato `dd/mm/aaaa`, com máscara, sem datas passadas e no máximo 90 dias à frente.
  Obrigatória quando a decisão é "manter em monitoramento".
- Confirmação obrigatória de que o gestor leu a justificativa, a confiança e as limitações.
- Erros aparecem ao sair do campo ou ao enviar, com ícone + texto, e são anunciados pelo leitor de tela.

### Acessibilidade

- Rótulos, papéis (`button`, `radio`, `checkbox`, `progressbar`, `header`) e estados para TalkBack e VoiceOver.
- Cada gráfico tem um resumo falado e uma **tabela de dados** alternativa.
- O risco é indicado por **cor + ícone + texto**, nunca só por cor. A paleta dos gráficos foi validada para
  contraste (≥ 3:1) e daltonismo.
- Áreas de toque de no mínimo 48 dp. O texto respeita a fonte do sistema.
- Ajustes de **texto ampliado** (+20%) e **alto contraste**.

### Privacidade (LGPD)

- Todos os dados são **agregados por território**: nada aponta ruas, domicílios ou pessoas.
- Sem login, sem localização do aparelho, sem rastreamento. A API recebe apenas as coordenadas do território.
- Decisões e preferências ficam **somente no aparelho**. Há opção de **decisões anônimas** e de **apagar todos
  os dados** (direito de exclusão).

## Fontes de dados

| Dado | Fonte | Tipo |
|---|---|---|
| Temperatura máxima/mínima e chuva (14 dias passados + 7 de previsão) | [Open-Meteo Forecast API](https://open-meteo.com/), pública e sem chave | **Real** |
| Consumo de água (L/hab/dia), energia (MWh/dia), resíduos (t/dia) e atendimentos de saúde | Gerador próprio (`src/data/syntheticData.js`) a partir do clima real e de um perfil por território | **Sintético** |
| População aproximada e coordenadas dos territórios | Valores aproximados de domínio público | Referência |

**Por que dados sintéticos?** Não existe API pública, aberta e diária de consumo de água e energia ou de
atendimentos por bairro. Os valores são simulados de forma **determinística** (mesmo território e mesma data geram
sempre o mesmo valor) e respondem ao clima real, o que torna a demonstração reproduzível e coerente. O app avisa
na interface sempre que um dado é sintético.

### Territórios de exemplo

| Território | Tipo |
|---|---|
| Sé, Centro de São Paulo | Urbano denso |
| Parelheiros, Zona Sul de São Paulo | Periurbano e rural |
| Ibiúna (SP) | Rural |

Novos territórios podem ser adicionados em `src/data/territories.js`.

## Como os alertas são calculados

1. **Clima:** Open-Meteo. Sem conexão, o app usa o último clima salvo. Sem cache, usa clima simulado.
2. **Modelos:** regressão linear múltipla (mínimos quadrados, implementada em `src/engine/statistics.js`)
   ajustada com 14 dias de histórico, usando variáveis explicáveis (temperatura, chuva, fim de semana,
   tendência).
3. **Previsão:** 7 dias à frente, com intervalo de 95% que cresce com o horizonte.
4. **Regras de alerta** (`src/engine/alerts.js`): limiares explícitos por tema (ex.: 3 dias ou mais ≥ 32 °C =
   risco alto de calor).
5. **Confiança** (`src/engine/confidence.js`): combina ajuste do modelo (R²), tamanho da amostra, horizonte e
   qualidade da fonte. Fica limitada a 95%, porque nenhuma previsão é tratada como certeza.

## Limitações

- Os dados de consumo, resíduos e atendimentos são **sintéticos** e não representam medições reais.
- Os modelos usam só **14 dias** de histórico: não captam sazonalidade anual, feriados nem eventos
  excepcionais (vazamentos, apagões, surtos de dengue ou gripe).
- A regressão linear é simples por escolha (explicabilidade). Relações não lineares não são modeladas.
- A previsão do tempo perde precisão a partir do 3º ou 4º dia, e a chuva é a variável mais incerta.
- Os alertas valem para o **território inteiro**: não consideram drenagem local, histórico de alagamento por
  rua nem diferenças internas do bairro.
- A capacidade da rede de saúde é um valor fixo de referência (não considera férias ou unidades fechadas).
- O "nível de confiança" é uma heurística explicável, não uma probabilidade calibrada.
- As decisões ficam só no aparelho: não há sincronização entre gestores nem trilha de auditoria em servidor.

## Como executar

Pré-requisitos: Node.js 20+ e o app **Expo Go** no celular (ou um emulador Android/iOS).

```bash
npm install
npm start          # abre o Expo; escaneie o QR code com o Expo Go
npm run android    # emulador Android
npm run web        # navegador
```

## Estrutura do projeto

```
src/
├── app/              # Telas e navegação (expo-router)
│   ├── (tabs)/       # Painel, Tendências, Alertas, Decisões, Ajustes
│   ├── alerta/[id]   # Detalhe do alerta
│   └── decisao/[alertId]  # Formulário de decisão
├── components/       # Componentes reutilizáveis (identidade visual)
├── data/             # Territórios, temas e gerador de dados sintéticos
├── engine/           # Estatística, modelos, confiança e regras de alerta
├── services/         # API Open-Meteo, HTTP e persistência
├── state/            # Context + reducer (estado global)
├── theme/            # Cores, tipografia, espaçamentos
└── utils/            # Formatação, séries, validação, decisões
```

## Licença

MIT (ver [LICENSE](LICENSE)).
