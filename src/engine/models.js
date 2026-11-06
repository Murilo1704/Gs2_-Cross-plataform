import { dayOfWeek, isWeekend } from '../data/syntheticData';
import { linearRegression, round } from './statistics';

// Cada modelo e uma regressao linear multipla com variaveis explicaveis.
// `features` recebe (dia, indiceDoDia) e devolve o vetor de entrada.
// `explain` descreve o modelo em linguagem simples para o gestor.
export const MODEL_SPECS = {
  water: {
    features: (d, i) => [d.tmax, i],
    featureNames: ['temperatura máxima', 'tendência diária'],
    explain: 'Regressão linear: consumo de água em função da temperatura máxima e da tendência dos últimos dias.',
  },
  energy: {
    features: (d, i) => [d.tmax, isWeekend(d.date) ? 1 : 0, i],
    featureNames: ['temperatura máxima', 'fim de semana', 'tendência diária'],
    explain: 'Regressão linear: consumo de energia em função da temperatura, do dia da semana e da tendência.',
  },
  waste: {
    features: (d, i) => [i, dayOfWeek(d.date) === 1 ? 1 : 0],
    featureNames: ['tendência diária', 'segunda-feira (acúmulo do fim de semana)'],
    explain: 'Regressão linear: geração de resíduos em função da tendência e do acúmulo de segunda-feira.',
  },
  services: {
    features: (d, i) => [d.tmax, d.precip, isWeekend(d.date) ? 1 : 0, i],
    featureNames: ['temperatura máxima', 'chuva', 'fim de semana', 'tendência diária'],
    explain:
      'Regressão linear: atendimentos na rede de saúde em função de temperatura, chuva, dia da semana e tendência.',
  },
};

export const METRICS = Object.keys(MODEL_SPECS);

/** Ajusta um modelo por metrica usando o historico observado. */
export function fitModels(history) {
  const models = {};
  for (const metric of METRICS) {
    const spec = MODEL_SPECS[metric];
    const X = history.map((d, i) => spec.features(d, i));
    const y = history.map((d) => d[metric]);
    const reg = linearRegression(X, y);
    models[metric] = { ...reg, metric, explain: spec.explain, featureNames: spec.featureNames };
  }
  return models;
}

/**
 * Projeta as metricas para os dias de previsao do clima.
 * Inclui intervalo aproximado de 95% (+-1.96 x desvio do residuo),
 * que aumenta com o horizonte para refletir a incerteza crescente.
 */
export function forecastMetrics(models, forecastWeather, historyLength) {
  return forecastWeather.map((day, k) => {
    const index = historyLength + k;
    const horizon = k + 1;
    const out = { ...day, isForecast: true, horizon };
    for (const metric of METRICS) {
      const m = models[metric];
      const value = Math.max(0, m.predict(MODEL_SPECS[metric].features(day, index)));
      const margin = 1.96 * m.residualStd * Math.sqrt(1 + horizon / 7);
      out[metric] = round(value, 1);
      out[`${metric}Low`] = round(Math.max(0, value - margin), 1);
      out[`${metric}High`] = round(value + margin, 1);
    }
    return out;
  });
}
