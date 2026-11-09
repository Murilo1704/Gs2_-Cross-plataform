import { colors } from '../theme';
import { mean, percentChange } from '../engine/statistics';
import { formatNumber, formatShortDate } from './format';

// Metadados de cada serie numerica do dataset (campo de cada dia).
export const FIELDS = {
  water: { key: 'water', label: 'Água', unit: 'L/hab/dia', digits: 0, color: colors.water, icon: 'water', model: 'water' },
  energy: { key: 'energy', label: 'Energia', unit: 'MWh/dia', digits: 0, color: colors.energy, icon: 'flash', model: 'energy' },
  waste: { key: 'waste', label: 'Resíduos', unit: 't/dia', digits: 0, color: colors.waste, icon: 'trash', model: 'waste' },
  services: {
    key: 'services',
    label: 'Atendimentos de saúde',
    shortLabel: 'Saúde',
    unit: 'atend./dia',
    digits: 0,
    color: colors.services,
    icon: 'medkit',
    model: 'services',
  },
  tmax: { key: 'tmax', label: 'Temperatura máxima', shortLabel: 'Calor', unit: '°C', digits: 1, color: colors.climate, icon: 'thermometer' },
  precip: { key: 'precip', label: 'Chuva', unit: 'mm', digits: 1, color: colors.rain, icon: 'rainy' },
};

export const FIELD_ORDER = ['water', 'energy', 'waste', 'services', 'tmax', 'precip'];

// Qual serie ilustra cada alerta (pela chave da regra em engine/alerts.js).
export const ALERT_FIELD = {
  agua: 'water',
  energia: 'energy',
  residuos: 'waste',
  servicos: 'services',
  calor: 'tmax',
  chuva: 'precip',
};

export const formatFieldValue = (fieldKey, value) => {
  const f = FIELDS[fieldKey];
  return `${formatNumber(value, f.digits)} ${f.unit}`;
};

/**
 * Junta historico observado + previsao em uma unica serie para os graficos.
 * Dias previstos trazem o intervalo de 95% (low/high) quando o modelo o calcula.
 */
export function buildSeries(dataset, fieldKey) {
  if (!dataset) return [];
  const toPoint = (d) => ({
    key: d.date,
    date: d.date,
    label: formatShortDate(d.date),
    value: d[fieldKey],
    low: d[`${fieldKey}Low`],
    high: d[`${fieldKey}High`],
    isForecast: !!d.isForecast,
  });
  return [...dataset.history.map(toPoint), ...dataset.forecast.map(toPoint)];
}

/** Estatisticas resumidas de uma serie (observado vs. previsto). */
export function seriesStats(series) {
  const observed = series.filter((p) => !p.isForecast).map((p) => p.value);
  const predicted = series.filter((p) => p.isForecast).map((p) => p.value);
  const lastWeek = observed.slice(-7);
  const meanObserved = mean(lastWeek);
  const meanPredicted = mean(predicted);
  return {
    meanObserved,
    meanPredicted,
    change: percentChange(meanObserved, meanPredicted),
    min: Math.min(...observed),
    max: Math.max(...observed),
    observedDays: observed.length,
    predictedDays: predicted.length,
  };
}
