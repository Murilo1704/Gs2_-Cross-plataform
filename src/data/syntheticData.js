import { round, seededRandom } from '../engine/statistics';

// Gerador de dados SINTETICOS de consumo e demanda.
//
// Nao existe API publica diaria e aberta de consumo de agua/energia por
// bairro, entao os valores sao simulados a partir do clima REAL do
// territorio (Open-Meteo) + perfil do territorio + ruido deterministico.
// O mesmo territorio e data sempre geram o mesmo valor (seed fixa),
// o que torna a demonstracao reproduzivel.

export const dayOfWeek = (isoDate) => new Date(`${isoDate}T12:00:00`).getDay();
export const isWeekend = (isoDate) => [0, 6].includes(dayOfWeek(isoDate));

const noise = (rand, amplitude) => (rand() * 2 - 1) * amplitude;

/**
 * @param territory  territorio (src/data/territories.js)
 * @param weatherDays dias observados [{ date, tmax, tmin, precip }]
 * @returns dias com water, energy, waste e services
 */
export function generateSyntheticHistory(territory, weatherDays) {
  const p = territory.profile;
  return weatherDays.map((day, i) => {
    const rand = seededRandom(`${territory.id}:${day.date}`);
    const weekend = isWeekend(day.date);
    const monday = dayOfWeek(day.date) === 1;
    const heat = day.tmax - 24; // graus acima de 24C

    const water = p.water.base + p.water.heat * heat + p.water.trend * i + (weekend ? 5 : 0) + noise(rand, p.water.noise);

    const energy =
      p.energy.base * (1 + p.energy.heat * heat) +
      p.energy.trend * i -
      (weekend ? p.energy.base * 0.08 : 0) +
      noise(rand, p.energy.noise);

    const waste = p.waste.base * (1 + p.waste.growth * i) * (monday ? 1.12 : 1) + noise(rand, p.waste.noise);

    const services =
      p.services.base *
        (1 + p.services.heat * heat + p.services.rain * day.precip + p.services.growth * i) *
        (weekend ? 0.55 : 1) +
      noise(rand, p.services.noise);

    return {
      ...day,
      isForecast: false,
      water: round(Math.max(0, water), 1),
      energy: round(Math.max(0, energy), 1),
      waste: round(Math.max(0, waste), 1),
      services: Math.max(0, Math.round(services)),
    };
  });
}

/**
 * Clima sintetico usado SOMENTE se a API falhar e nao houver cache.
 * Gera 14 dias passados + 7 de previsao a partir de hoje.
 */
export function generateSyntheticWeather(territory, pastDays = 14, forecastDays = 7) {
  const today = new Date();
  const days = [];
  for (let offset = -pastDays; offset < forecastDays; offset++) {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    const date = d.toISOString().slice(0, 10);
    const rand = seededRandom(`weather:${territory.id}:${date}`);
    const tmax = 25 + Math.sin(offset / 3) * 3 + noise(rand, 2);
    days.push({
      date,
      tmax: round(tmax, 1),
      tmin: round(tmax - 8 - rand() * 2, 1),
      precip: rand() > 0.7 ? round(rand() * 25, 1) : 0,
      isForecast: offset >= 0,
    });
  }
  return days;
}
