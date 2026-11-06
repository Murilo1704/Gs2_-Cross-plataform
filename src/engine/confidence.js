import { clamp } from './statistics';

/**
 * Nivel de confianca de um alerta (0 a 1), combinando fatores explicaveis:
 *  - ajuste do modelo (R2)           -> modelo explica bem os dados?
 *  - tamanho da amostra             -> poucos dias = menos confianca
 *  - horizonte da previsao          -> quanto mais longe, menos confiavel
 *  - origem dos dados               -> sintetico/cache reduzem a confianca
 * O valor e limitado a 95%: nenhuma previsao e tratada como certeza.
 */
export function computeConfidence({ r2 = 0.5, n = 14, horizonDays = 1, synthetic = false, weatherSource = 'api' }) {
  const fit = 0.35 + 0.65 * clamp(r2, 0, 1);
  const sample = clamp(n / 14, 0.3, 1);
  const horizon = clamp(1 - 0.05 * (horizonDays - 1), 0.6, 1);
  const sourceFactor = weatherSource === 'api' ? 1 : weatherSource === 'cache' ? 0.85 : 0.6;
  const dataFactor = synthetic ? 0.85 : 1;

  const value = clamp(fit * sample * horizon * sourceFactor * dataFactor, 0.05, 0.95);
  return {
    value,
    label: value >= 0.75 ? 'alta' : value >= 0.5 ? 'moderada' : 'baixa',
    factors: [
      { name: 'Ajuste do modelo (R²)', value: clamp(r2, 0, 1) },
      { name: 'Tamanho da amostra', value: sample },
      { name: 'Horizonte da previsão', value: horizon },
      { name: 'Qualidade da fonte', value: sourceFactor * dataFactor },
    ],
  };
}
