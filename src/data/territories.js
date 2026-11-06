// Territorios disponiveis. Coordenadas reais (usadas na API de clima).
// Populacao aproximada; perfis de consumo sao parametros do gerador sintetico.

export const TERRITORIES = [
  {
    id: 'sp-se',
    name: 'Sé – Centro de São Paulo',
    shortName: 'Centro SP',
    type: 'Urbano denso',
    latitude: -23.5505,
    longitude: -46.6333,
    population: 431000,
    serviceCapacity: 3000, // atendimentos/dia na rede basica de saude
    profile: {
      water: { base: 168, heat: 2.4, trend: 1.3, noise: 7 }, // L/hab/dia
      energy: { base: 410, heat: 0.03, trend: 0.4, noise: 18 }, // MWh/dia
      waste: { base: 520, growth: 0.002, noise: 30 }, // t/dia
      services: { base: 2450, heat: 0.012, rain: 0.002, growth: 0.004, noise: 170 }, // atend./dia
    },
  },
  {
    id: 'sp-parelheiros',
    name: 'Parelheiros – Zona Sul de SP',
    shortName: 'Parelheiros',
    type: 'Periurbano e rural',
    latitude: -23.8297,
    longitude: -46.7286,
    population: 139000,
    serviceCapacity: 950,
    profile: {
      water: { base: 124, heat: 1.8, trend: 0.2, noise: 6 },
      energy: { base: 96, heat: 0.025, trend: 0.05, noise: 4.5 },
      waste: { base: 118, growth: 0.003, noise: 7 },
      services: { base: 830, heat: 0.015, rain: 0.004, growth: 0.009, noise: 55 },
    },
  },
  {
    id: 'ibiuna',
    name: 'Ibiúna – Comunidades rurais',
    shortName: 'Ibiúna',
    type: 'Rural',
    latitude: -23.6567,
    longitude: -47.2225,
    population: 79000,
    serviceCapacity: 520,
    profile: {
      water: { base: 108, heat: 2.1, trend: 0.1, noise: 6 },
      energy: { base: 48, heat: 0.02, trend: 0.02, noise: 2.4 },
      waste: { base: 54, growth: 0.014, noise: 3 },
      services: { base: 360, heat: 0.01, rain: 0.003, growth: 0.002, noise: 28 },
    },
  },
];

export const DEFAULT_TERRITORY_ID = TERRITORIES[0].id;

export const getTerritory = (id) => TERRITORIES.find((t) => t.id === id) ?? TERRITORIES[0];
