import { generateSyntheticHistory } from '../data/syntheticData';
import { generateAlerts } from '../engine/alerts';
import { fitModels, forecastMetrics } from '../engine/models';
import { mean, percentChange } from '../engine/statistics';
import { getWeather } from './weatherService';

/** Indicadores-resumo: media da ultima semana e variacao vs. semana anterior. */
export function buildIndicators(history, forecast) {
  const last = history.slice(-7);
  const prev = history.slice(-14, -7);
  const indicator = (field) => {
    const value = mean(last.map((d) => d[field]));
    return { value, trend: prev.length ? percentChange(mean(prev.map((d) => d[field])), value) : null };
  };
  return {
    water: indicator('water'),
    energy: indicator('energy'),
    waste: indicator('waste'),
    services: indicator('services'),
    tmaxNext: Math.max(...forecast.map((d) => d.tmax)),
    rainNext: forecast.reduce((acc, d) => acc + d.precip, 0),
  };
}

/**
 * Pipeline completo de um territorio:
 * clima (API/cache/sintetico) -> historico sintetico -> modelos -> previsao -> alertas.
 */
export async function loadTerritoryData(territory) {
  const weather = await getWeather(territory);
  const observed = weather.days.filter((d) => !d.isForecast);
  const upcoming = weather.days.filter((d) => d.isForecast);

  const history = generateSyntheticHistory(territory, observed);
  const models = fitModels(history);
  const forecast = forecastMetrics(models, upcoming, history.length);
  const generatedAt = new Date().toISOString();

  const alerts = generateAlerts({
    territory,
    history,
    forecast,
    models,
    weatherSource: weather.source,
    weatherFetchedAt: weather.fetchedAt,
    generatedAt,
  });

  return {
    dataset: {
      territoryId: territory.id,
      history,
      forecast,
      indicators: buildIndicators(history, forecast),
      modelQuality: Object.fromEntries(Object.entries(models).map(([k, m]) => [k, { r2: m.r2, n: m.n }])),
      weatherSource: weather.source,
      weatherFetchedAt: weather.fetchedAt,
      weatherError: weather.error,
      generatedAt,
    },
    alerts,
  };
}
