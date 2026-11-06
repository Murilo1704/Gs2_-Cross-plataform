import { fetchJson } from './http';
import { getJSON, KEYS, setJSON } from './storage';
import { generateSyntheticWeather } from '../data/syntheticData';

// API publica e gratuita, sem chave: https://open-meteo.com
const BASE_URL = 'https://api.open-meteo.com/v1/forecast';
export const PAST_DAYS = 14;
export const FORECAST_DAYS = 7;

function buildUrl({ latitude, longitude }) {
  const params = [
    `latitude=${latitude}`,
    `longitude=${longitude}`,
    'daily=temperature_2m_max,temperature_2m_min,precipitation_sum',
    `past_days=${PAST_DAYS}`,
    `forecast_days=${FORECAST_DAYS}`,
    'timezone=America%2FSao_Paulo',
  ];
  return `${BASE_URL}?${params.join('&')}`;
}

/** Converte a resposta da Open-Meteo em uma lista de dias. */
export function parseOpenMeteo(json) {
  const d = json?.daily;
  if (!d?.time?.length) throw new Error('Resposta da API sem dados diarios');
  return d.time.map((date, i) => ({
    date,
    tmax: d.temperature_2m_max[i] ?? 0,
    tmin: d.temperature_2m_min[i] ?? 0,
    precip: d.precipitation_sum[i] ?? 0,
    // Os PAST_DAYS primeiros sao observados; a partir de hoje e previsao.
    isForecast: i >= PAST_DAYS,
  }));
}

/**
 * Busca o clima com estrategia de fallback:
 *   1. API Open-Meteo (dado real)        -> source 'api'
 *   2. ultimo resultado salvo no aparelho -> source 'cache'
 *   3. clima sintetico                    -> source 'sintetico'
 * A origem e informada ao motor de alertas, que reduz a confianca.
 */
export async function getWeather(territory) {
  try {
    const json = await fetchJson(buildUrl(territory));
    const days = parseOpenMeteo(json);
    const fetchedAt = new Date().toISOString();
    await setJSON(KEYS.weatherCache(territory.id), { days, fetchedAt });
    return { days, source: 'api', fetchedAt, error: null };
  } catch (error) {
    const cached = await getJSON(KEYS.weatherCache(territory.id));
    if (cached?.days?.length) {
      return { days: cached.days, source: 'cache', fetchedAt: cached.fetchedAt, error: error.message };
    }
    return {
      days: generateSyntheticWeather(territory, PAST_DAYS, FORECAST_DAYS),
      source: 'sintetico',
      fetchedAt: new Date().toISOString(),
      error: error.message,
    };
  }
}
