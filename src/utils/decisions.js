import { colors } from '../theme';

// Tipos de decisao que o gestor pode registrar sobre um alerta.
// O app apenas REGISTRA a decisao humana; nada e executado automaticamente.
export const DECISION_TYPES = {
  encaminhar: {
    value: 'encaminhar',
    label: 'Encaminhar ação',
    description: 'Aprovar uma das ações sugeridas para a equipe responsável executar.',
    icon: 'send',
    color: colors.primary,
  },
  monitorar: {
    value: 'monitorar',
    label: 'Manter em monitoramento',
    description: 'Acompanhar a evolução e reavaliar em uma data definida.',
    icon: 'eye',
    color: colors.riskMedium,
  },
  descartar: {
    value: 'descartar',
    label: 'Descartar alerta',
    description: 'Considerar o alerta improcedente (ex.: o conhecimento local contradiz os dados).',
    icon: 'close-circle',
    color: colors.textMuted,
  },
};

export const DECISION_OPTIONS = Object.values(DECISION_TYPES);
