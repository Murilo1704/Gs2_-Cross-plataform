import { computeConfidence } from './confidence';
import { mean, percentChange } from './statistics';
import { formatDateTime, formatNumber, formatPercent, formatSigned, formatWeekdayDate } from '../utils/format';

// Motor de alertas preditivos.
//
// Principio central: o app APOIA a decisao humana. Cada alerta traz
//   - justificativa (evidencias numericas que levaram ao alerta)
//   - nivel de confianca (com os fatores que o compoem)
//   - limitacoes (quando NAO confiar na previsao)
//   - acoes SUGERIDAS, que nunca sao executadas automaticamente.
// Alertas de nivel alto sao marcados como "alto impacto" e exigem
// registro de decisao por um gestor.

const LEVEL_ORDER = { alto: 0, medio: 1, baixo: 2 };

const BASE_ACTION = 'Manter monitoramento de rotina.';

function commonLimitations({ weatherSource, weatherFetchedAt, usesSyntheticMetric }) {
  const list = [];
  if (usesSyntheticMetric) {
    list.push(
      'Os dados de consumo e demanda são SINTÉTICOS (simulados para demonstração) e não representam medições reais do território.'
    );
  }
  if (weatherSource === 'cache') {
    list.push(
      `Sem conexão: a previsão do clima usada é a última salva (${formatDateTime(weatherFetchedAt)}) e pode estar desatualizada.`
    );
  }
  if (weatherSource === 'sintetico') {
    list.push('A API de clima está indisponível e o clima também foi simulado. Use este alerta apenas como exemplo.');
  }
  list.push('Os dados são agregados para o território inteiro: o alerta não aponta ruas, domicílios ou pessoas específicas.');
  return list;
}

function regressionLimitations(model) {
  const list = [
    'Modelo de regressão linear simples, ajustado com apenas 14 dias de histórico: não captura sazonalidade anual, feriados ou eventos excepcionais (vazamentos, apagões, surtos).',
  ];
  if (model.r2 < 0.5) {
    list.push(`O modelo explica só ${formatPercent(model.r2)} da variação histórica (R² baixo): trate a previsão com cautela.`);
  }
  return list;
}

function coef(model, featureName) {
  const idx = model.featureNames.indexOf(featureName);
  return idx >= 0 ? model.coefficients[idx + 1] : 0;
}

function buildAlert(ctx, a) {
  return {
    id: `${ctx.territory.id}:${a.key}:${ctx.generatedAt.slice(0, 10)}`,
    territoryId: ctx.territory.id,
    generatedAt: ctx.generatedAt,
    highImpact: a.level === 'alto',
    requiresHumanDecision: a.level !== 'baixo',
    ...a,
  };
}

// ---------- Regras por tema ----------

function waterAlert(ctx) {
  const { history, forecast, models } = ctx;
  const m = models.water;
  const last7 = mean(history.slice(-7).map((d) => d.water));
  const next7 = mean(forecast.map((d) => d.water));
  const change = percentChange(last7, next7);
  const rain = forecast.reduce((acc, d) => acc + d.precip, 0);
  const tNext = mean(forecast.map((d) => d.tmax));
  const tLast = mean(history.slice(-7).map((d) => d.tmax));

  const level = change >= 10 || (change >= 6 && rain < 5) ? 'alto' : change >= 4 ? 'medio' : 'baixo';
  const actions = [BASE_ACTION];
  if (level !== 'baixo') {
    actions.push('Intensificar campanha de uso consciente de água no território.');
    actions.push('Solicitar à concessionária dados de pressão e vazamentos na rede local.');
  }
  if (level === 'alto') {
    actions.push(
      'Avaliar, com a concessionária e a população, medidas de contingência no abastecimento. Decisão de alto impacto: exige validação humana.'
    );
  }

  return buildAlert(ctx, {
    key: 'agua',
    domain: 'agua',
    level,
    title: level === 'baixo' ? 'Consumo de água estável' : 'Aumento previsto no consumo de água',
    summary: `Consumo previsto de ${formatNumber(next7, 0)} L/hab/dia (${formatSigned(change)}% vs. última semana).`,
    justification: [
      `Média prevista para os próximos 7 dias: ${formatNumber(next7, 1)} L/hab/dia, contra ${formatNumber(last7, 1)} nos últimos 7 dias (${formatSigned(change)}%).`,
      `Temperatura máxima média prevista: ${formatNumber(tNext, 1)} °C (última semana: ${formatNumber(tLast, 1)} °C). No modelo, cada +1 °C soma ${formatSigned(coef(m, 'temperatura máxima'))} L/hab/dia.`,
      `Chuva prevista na semana: ${formatNumber(rain, 1)} mm.${rain < 5 ? ' Pouca chuva tende a pressionar os reservatórios.' : ''}`,
      `O modelo explica ${formatPercent(m.r2)} da variação histórica (R²).`,
    ],
    evidence: { current: last7, predicted: next7, unit: 'L/hab/dia', changePct: change },
    confidence: computeConfidence({ r2: m.r2, n: m.n, horizonDays: 4, synthetic: true, weatherSource: ctx.weatherSource }),
    limitations: [...regressionLimitations(m), ...commonLimitations({ ...ctx, usesSyntheticMetric: true })],
    actions,
    model: m.explain,
    sources: ['Open-Meteo (temperatura e chuva)', 'Consumo de água: dados sintéticos'],
  });
}

function energyAlert(ctx) {
  const { history, forecast, models } = ctx;
  const m = models.energy;
  const last7 = mean(history.slice(-7).map((d) => d.energy));
  const next7 = mean(forecast.map((d) => d.energy));
  const change = percentChange(last7, next7);
  const histMax = Math.max(...history.map((d) => d.energy));
  const peakDay = forecast.reduce((a, b) => (b.energy > a.energy ? b : a));

  const level =
    change >= 8 || peakDay.energy > histMax * 1.05 ? 'alto' : change >= 4 || peakDay.energy > histMax ? 'medio' : 'baixo';
  const actions = [BASE_ACTION];
  if (level !== 'baixo') {
    actions.push('Comunicar à distribuidora a previsão de pico para planejamento de carga.');
    actions.push('Revisar o consumo de prédios públicos nos horários de pico.');
  }
  if (level === 'alto') {
    actions.push('Avaliar plano de contingência para equipamentos críticos (UBS, escolas). Exige validação humana.');
  }

  return buildAlert(ctx, {
    key: 'energia',
    domain: 'energia',
    level,
    title: level === 'baixo' ? 'Demanda de energia dentro do esperado' : 'Pico de demanda de energia previsto',
    summary: `Pico de ${formatNumber(peakDay.energy, 0)} MWh em ${formatWeekdayDate(peakDay.date)} (${formatSigned(change)}% na média semanal).`,
    justification: [
      `Média prevista: ${formatNumber(next7, 1)} MWh/dia, contra ${formatNumber(last7, 1)} na última semana (${formatSigned(change)}%).`,
      `Maior valor previsto: ${formatNumber(peakDay.energy, 1)} MWh em ${formatWeekdayDate(peakDay.date)}. Maior valor dos últimos 14 dias: ${formatNumber(histMax, 1)} MWh.`,
      `No modelo, cada +1 °C soma ${formatSigned(coef(m, 'temperatura máxima'))} MWh/dia (uso de ventilação e refrigeração).`,
      `O modelo explica ${formatPercent(m.r2)} da variação histórica (R²).`,
    ],
    evidence: { current: last7, predicted: next7, unit: 'MWh/dia', changePct: change },
    confidence: computeConfidence({
      r2: m.r2,
      n: m.n,
      horizonDays: peakDay.horizon,
      synthetic: true,
      weatherSource: ctx.weatherSource,
    }),
    limitations: [...regressionLimitations(m), ...commonLimitations({ ...ctx, usesSyntheticMetric: true })],
    actions,
    model: m.explain,
    sources: ['Open-Meteo (temperatura)', 'Consumo de energia: dados sintéticos'],
  });
}

// Previsao meteorologica direta (sem regressao propria). A "qualidade do
// modelo" usa 0.85 como estimativa da habilidade de previsao de curto prazo.
const WEATHER_SKILL = 0.85;

function heatAlert(ctx) {
  const { forecast } = ctx;
  const hot = forecast.filter((d) => d.tmax >= 32);
  const warm = forecast.filter((d) => d.tmax >= 30);
  const hottest = forecast.reduce((a, b) => (b.tmax > a.tmax ? b : a));
  const level = hot.length >= 3 ? 'alto' : hot.length >= 1 || warm.length >= 3 ? 'medio' : 'baixo';
  const firstAffected = (hot[0] ?? warm[0] ?? hottest).horizon;

  const actions = [BASE_ACTION];
  if (level !== 'baixo') {
    actions.push('Divulgar orientações de hidratação, com foco em idosos, crianças e trabalhadores ao ar livre.');
    actions.push('Verificar o funcionamento de bebedouros e espaços climatizados públicos.');
  }
  if (level === 'alto') {
    actions.push('Avaliar a abertura de pontos de acolhimento climatizados. Exige decisão do gestor.');
  }

  return buildAlert(ctx, {
    key: 'calor',
    domain: 'clima',
    level,
    title: level === 'alto' ? 'Possível onda de calor' : level === 'medio' ? 'Dias quentes previstos' : 'Temperaturas sem extremos',
    summary: `Máxima de ${formatNumber(hottest.tmax, 1)} °C em ${formatWeekdayDate(hottest.date)}; ${hot.length} dia(s) ≥ 32 °C.`,
    justification: [
      `Dias com máxima ≥ 32 °C nos próximos 7 dias: ${hot.length}. Dias ≥ 30 °C: ${warm.length}.`,
      `Dia mais quente previsto: ${formatWeekdayDate(hottest.date)}, com ${formatNumber(hottest.tmax, 1)} °C.`,
      'Critério: 3 ou mais dias ≥ 32 °C = risco alto; ao menos 1 dia ≥ 32 °C ou 3 dias ≥ 30 °C = risco médio.',
    ],
    evidence: { current: null, predicted: hottest.tmax, unit: '°C' },
    confidence: computeConfidence({
      r2: WEATHER_SKILL,
      n: 14,
      horizonDays: firstAffected,
      synthetic: false,
      weatherSource: ctx.weatherSource,
    }),
    limitations: [
      'A previsão do tempo perde precisão a partir do 3º ou 4º dia.',
      'A confiança considera o horizonte da previsão. Não é um erro medido do modelo meteorológico.',
      'A sensação térmica, que inclui umidade e vento, não está incluída.',
      ...commonLimitations({ ...ctx, usesSyntheticMetric: false }),
    ],
    actions,
    model: 'Previsão meteorológica Open-Meteo com regras de limiar de temperatura.',
    sources: ['Open-Meteo (previsão de temperatura)'],
  });
}

function rainAlert(ctx) {
  const { forecast } = ctx;
  const wettest = forecast.reduce((a, b) => (b.precip > a.precip ? b : a));
  const total = forecast.reduce((acc, d) => acc + d.precip, 0);
  const level = wettest.precip >= 50 || total >= 120 ? 'alto' : wettest.precip >= 25 || total >= 60 ? 'medio' : 'baixo';

  const actions = [BASE_ACTION];
  if (level !== 'baixo') {
    actions.push('Verificar a limpeza de bueiros e galerias nas áreas com histórico de alagamento.');
  }
  if (level === 'alto') {
    actions.push('Articular com a Defesa Civil o monitoramento de áreas de risco de alagamento e deslizamento.');
    actions.push('Avaliar o envio de alerta à população pelos canais oficiais. Exige decisão humana.');
  }

  return buildAlert(ctx, {
    key: 'chuva',
    domain: 'clima',
    level,
    title: level === 'baixo' ? 'Sem chuva forte prevista' : 'Chuva forte prevista',
    summary: `Até ${formatNumber(wettest.precip, 1)} mm em ${formatWeekdayDate(wettest.date)}; ${formatNumber(total, 0)} mm na semana.`,
    justification: [
      `Maior volume diário previsto: ${formatNumber(wettest.precip, 1)} mm em ${formatWeekdayDate(wettest.date)}.`,
      `Total previsto para 7 dias: ${formatNumber(total, 1)} mm.`,
      'Critério: ≥ 50 mm em um dia ou ≥ 120 mm na semana = risco alto; ≥ 25 mm em um dia ou ≥ 60 mm na semana = risco médio.',
    ],
    evidence: { current: null, predicted: wettest.precip, unit: 'mm' },
    confidence: computeConfidence({
      r2: WEATHER_SKILL - 0.1, // chuva e mais dificil de prever que temperatura
      n: 14,
      horizonDays: wettest.horizon,
      synthetic: false,
      weatherSource: ctx.weatherSource,
    }),
    limitations: [
      'Chuva é a variável meteorológica mais difícil de prever, sobretudo pancadas isoladas de verão.',
      'O alerta não considera a drenagem local nem o histórico de alagamentos de cada rua.',
      ...commonLimitations({ ...ctx, usesSyntheticMetric: false }),
    ],
    actions,
    model: 'Previsão meteorológica Open-Meteo com regras de limiar de chuva.',
    sources: ['Open-Meteo (previsão de precipitação)'],
  });
}

function wasteAlert(ctx) {
  const { history, models } = ctx;
  const m = models.waste;
  const avg = mean(history.map((d) => d.waste));
  const weekly = coef(m, 'tendência diária') * 7;
  const weeklyPct = (weekly / avg) * 100;
  const monday = coef(m, 'segunda-feira (acúmulo do fim de semana)');
  const level = weeklyPct >= 8 ? 'alto' : weeklyPct >= 4 ? 'medio' : 'baixo';

  const actions = [BASE_ACTION];
  if (level !== 'baixo') actions.push('Revisar o roteiro e a frequência de coleta.');
  if (level === 'alto') {
    actions.push('Avaliar reforço temporário da coleta e novos pontos de entrega voluntária.');
    actions.push('Investigar a causa do aumento (eventos, obras, descarte irregular).');
  }

  return buildAlert(ctx, {
    key: 'residuos',
    domain: 'residuos',
    level,
    title: level === 'baixo' ? 'Geração de resíduos estável' : 'Crescimento na geração de resíduos',
    summary: `Tendência de ${formatSigned(weeklyPct)}% por semana (${formatSigned(weekly)} t).`,
    justification: [
      `Geração média nos últimos 14 dias: ${formatNumber(avg, 1)} t/dia.`,
      `Tendência estimada: ${formatSigned(weekly)} t/dia a cada semana (${formatSigned(weeklyPct)}%).`,
      `Às segundas-feiras são coletadas em média ${formatSigned(monday)} t a mais (acúmulo do fim de semana).`,
      `O modelo explica ${formatPercent(m.r2)} da variação histórica (R²).`,
    ],
    evidence: { current: avg, predicted: avg + weekly, unit: 't/dia', changePct: weeklyPct },
    confidence: computeConfidence({ r2: m.r2, n: m.n, horizonDays: 7, synthetic: true, weatherSource: 'api' }),
    limitations: [
      ...regressionLimitations(m),
      'Uma tendência de 2 semanas pode ser só uma oscilação temporária, não uma mudança permanente.',
      ...commonLimitations({ ...ctx, weatherSource: 'api', usesSyntheticMetric: true }),
    ],
    actions,
    model: m.explain,
    sources: ['Geração de resíduos: dados sintéticos'],
  });
}

function servicesAlert(ctx) {
  const { forecast, models, territory } = ctx;
  const m = models.services;
  const peak = forecast.reduce((a, b) => (b.services > a.services ? b : a));
  const util = peak.services / territory.serviceCapacity;
  const level = util >= 1 ? 'alto' : util >= 0.85 ? 'medio' : 'baixo';

  const actions = [BASE_ACTION];
  if (level !== 'baixo') {
    actions.push('Avaliar o remanejamento de equipes entre unidades de saúde.');
    actions.push('Reforçar a orientação à população sobre teleatendimento e canais de triagem.');
  }
  if (level === 'alto') {
    actions.push('Avaliar a ampliação temporária do horário de atendimento. Exige aprovação do gestor.');
  }

  return buildAlert(ctx, {
    key: 'servicos',
    domain: 'servicos',
    level,
    title:
      level === 'alto'
        ? 'Demanda de saúde acima da capacidade'
        : level === 'medio'
          ? 'Demanda de saúde próxima do limite'
          : 'Demanda de saúde dentro da capacidade',
    summary: `Pico de ${formatNumber(peak.services)} atendimentos (${formatPercent(util)} da capacidade) em ${formatWeekdayDate(peak.date)}.`,
    justification: [
      `Maior demanda prevista: ${formatNumber(peak.services)} atendimentos em ${formatWeekdayDate(peak.date)}. Intervalo de 95%: ${formatNumber(peak.servicesLow)} a ${formatNumber(peak.servicesHigh)}.`,
      `Capacidade de referência do território: ${formatNumber(territory.serviceCapacity)} atendimentos/dia (${formatPercent(util)} de ocupação no pico).`,
      `No modelo, cada +1 °C soma ${formatSigned(coef(m, 'temperatura máxima'), 0)} atendimentos e cada +10 mm de chuva soma ${formatSigned(coef(m, 'chuva') * 10, 0)}.`,
      `O modelo explica ${formatPercent(m.r2)} da variação histórica (R²).`,
    ],
    evidence: { current: territory.serviceCapacity, predicted: peak.services, unit: 'atend./dia', changePct: (util - 1) * 100 },
    confidence: computeConfidence({
      r2: m.r2,
      n: m.n,
      horizonDays: peak.horizon,
      synthetic: true,
      weatherSource: ctx.weatherSource,
    }),
    limitations: [
      ...regressionLimitations(m),
      'A capacidade de referência é fixa e não considera férias de equipes ou unidades fechadas.',
      'Surtos epidemiológicos, como dengue e gripe, não estão no modelo.',
      ...commonLimitations({ ...ctx, usesSyntheticMetric: true }),
    ],
    actions,
    model: m.explain,
    sources: ['Open-Meteo (temperatura e chuva)', 'Atendimentos: dados sintéticos'],
  });
}

/** Gera uma avaliacao por tema, ordenada por risco e confianca. */
export function generateAlerts(ctx) {
  const all = [waterAlert, energyAlert, heatAlert, rainAlert, wasteAlert, servicesAlert].map((rule) => rule(ctx));
  return all.sort(
    (a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level] || b.confidence.value - a.confidence.value
  );
}

export const isActiveAlert = (alert) => alert.level !== 'baixo';
