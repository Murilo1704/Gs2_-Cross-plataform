import { colors } from '../theme';

// Temas monitorados pelo painel.
export const DOMAINS = {
  agua: { key: 'agua', label: 'Água', icon: 'water', color: colors.water, unit: 'L/hab/dia' },
  energia: { key: 'energia', label: 'Energia', icon: 'flash', color: colors.energy, unit: 'MWh/dia' },
  clima: { key: 'clima', label: 'Clima', icon: 'thermometer', color: colors.climate, unit: '°C' },
  residuos: { key: 'residuos', label: 'Resíduos', icon: 'trash', color: colors.waste, unit: 't/dia' },
  servicos: { key: 'servicos', label: 'Serviços de saúde', icon: 'medkit', color: colors.services, unit: 'atend./dia' },
};

// Mapeia o domínio para o campo numérico de cada dia do dataset.
export const METRIC_FIELD = {
  agua: 'water',
  energia: 'energy',
  residuos: 'waste',
  servicos: 'services',
  clima: 'tmax',
};
