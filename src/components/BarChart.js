import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import AppText from './AppText';
import { colors, radius, spacing } from '../theme';
import { formatNumber, formatWeekdayDate } from '../utils/format';

// Arredonda o topo do eixo para um valor "redondo" (1, 2, 2.5, 5 x 10^n).
function niceCeil(value) {
  if (value <= 0) return 1;
  const exp = 10 ** Math.floor(Math.log10(value));
  const f = value / exp;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nice * exp;
}

/**
 * Grafico de barras feito apenas com Views (sem bibliotecas nativas),
 * funcionando igual em Android, iOS e web.
 *
 * - Barras solidas = dados observados; barras claras = previsao.
 * - Previsoes mostram o intervalo de 95% como uma linha vertical.
 * - `reference` desenha uma linha horizontal (ex.: capacidade).
 * - Toque em uma barra para ler o valor exato.
 * - Acessibilidade: resumo falado pelo leitor de tela + tabela de dados.
 *
 * data: [{ key, date, label, value, low?, high?, isForecast? }]
 */
export default function BarChart({
  data,
  title,
  color = colors.primary,
  unit = '',
  digits = 0,
  height = 160,
  reference,
}) {
  const [selected, setSelected] = useState(null);
  const [showTable, setShowTable] = useState(false);

  if (!data?.length) return null;

  const fmt = (v) => formatNumber(v, digits);
  const top = niceCeil(Math.max(...data.map((d) => d.high ?? d.value), reference?.value ?? 0) * 1.05);
  const pct = (v) => `${Math.max(0, Math.min(100, (v / top) * 100))}%`;
  const firstForecast = data.findIndex((d) => d.isForecast);
  const observed = data.filter((d) => !d.isForecast);
  const predicted = data.filter((d) => d.isForecast);
  const avg = (list) => list.reduce((acc, d) => acc + d.value, 0) / list.length;

  const summary = [
    `${title}.`,
    observed.length ? `${observed.length} dias observados, média de ${fmt(avg(observed))} ${unit}.` : '',
    predicted.length ? `${predicted.length} dias de previsão, média de ${fmt(avg(predicted))} ${unit}.` : '',
    reference ? `${reference.label}: ${fmt(reference.value)} ${unit}.` : '',
  ].join(' ');

  const point = selected != null ? data[selected] : null;
  const xLabels = [0, firstForecast > 0 ? firstForecast : null, data.length - 1].filter((i) => i != null);

  return (
    <View>
      {/* Leitura do ponto selecionado */}
      <View style={styles.readout} accessibilityLiveRegion="polite">
        {point ? (
          <AppText variant="caption">
            <AppText variant="caption" style={styles.bold}>
              {formatWeekdayDate(point.date)}
            </AppText>
            {` · ${fmt(point.value)} ${unit}`}
            {point.isForecast ? ' (previsão' : ''}
            {point.isForecast && point.low != null ? `, 95%: ${fmt(point.low)} a ${fmt(point.high)}` : ''}
            {point.isForecast ? ')' : ''}
          </AppText>
        ) : (
          <AppText variant="caption" color={colors.textMuted}>
            Toque em uma barra para ver o valor.
          </AppText>
        )}
      </View>

      <View style={styles.plotRow} accessible accessibilityRole="image" accessibilityLabel={summary}>
        {/* Eixo Y: 0, metade e topo */}
        <View style={[styles.yAxis, { height }]} importantForAccessibility="no-hide-descendants">
          <AppText variant="caption" color={colors.textMuted} style={styles.yLabel}>
            {fmt(top)}
          </AppText>
          <AppText variant="caption" color={colors.textMuted} style={styles.yLabel}>
            {fmt(top / 2)}
          </AppText>
          <AppText variant="caption" color={colors.textMuted} style={styles.yLabel}>
            0
          </AppText>
        </View>

        <View style={[styles.plot, { height }]}>
          {/* Grade horizontal discreta */}
          {[0, 50, 100].map((g) => (
            <View key={g} style={[styles.gridLine, { bottom: `${g}%` }]} />
          ))}

          {/* Separador observado | previsao */}
          {firstForecast > 0 ? (
            <View style={[styles.todayLine, { left: `${(firstForecast / data.length) * 100}%` }]} />
          ) : null}

          {/* Linha de referencia */}
          {reference ? (
            <View style={[styles.refLine, { bottom: pct(reference.value) }]}>
              <AppText variant="caption" color={colors.text} style={styles.refLabel}>
                {reference.label}
              </AppText>
            </View>
          ) : null}

          <View style={styles.bars}>
            {data.map((d, i) => {
              const isSel = i === selected;
              return (
                <Pressable
                  key={d.key ?? i}
                  onPress={() => setSelected(isSel ? null : i)}
                  style={styles.slot}
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                >
                  {d.isForecast && d.low != null && d.high != null ? (
                    <View
                      style={[
                        styles.whisker,
                        { bottom: pct(d.low), height: `${((d.high - d.low) / top) * 100}%`, backgroundColor: colors.text },
                      ]}
                    />
                  ) : null}
                  <View
                    style={[
                      styles.bar,
                      { height: pct(d.value), backgroundColor: color },
                      d.isForecast && styles.forecastBar,
                      d.isForecast && { borderColor: color },
                      isSel && styles.selectedBar,
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* Eixo X: inicio, primeiro dia previsto e fim */}
      <View style={styles.xAxis} importantForAccessibility="no-hide-descendants">
        {xLabels.map((i) => (
          <AppText
            key={i}
            variant="caption"
            color={colors.textMuted}
            style={[styles.xLabel, { left: `${((i + 0.5) / data.length) * 100}%` }]}
          >
            {data[i].label}
          </AppText>
        ))}
      </View>

      {/* Legenda: observado x previsao (diferenca nao depende so de cor) */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.swatch, { backgroundColor: color }]} />
          <AppText variant="caption" color={colors.textMuted}>
            Observado
          </AppText>
        </View>
        {predicted.length ? (
          <View style={styles.legendItem}>
            <View style={[styles.swatch, styles.forecastBar, { backgroundColor: color, borderColor: color }]} />
            <AppText variant="caption" color={colors.textMuted}>
              Previsão {predicted.some((d) => d.low != null) ? '(linha = intervalo 95%)' : ''}
            </AppText>
          </View>
        ) : null}
      </View>

      <Pressable
        onPress={() => setShowTable((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded: showTable }}
        style={styles.tableToggle}
      >
        <AppText variant="label" color={colors.primary}>
          {showTable ? 'Ocultar tabela de dados' : 'Ver dados em tabela'}
        </AppText>
      </Pressable>

      {showTable ? (
        <View style={styles.table}>
          {data.map((d) => (
            <View
              key={d.key}
              style={styles.tableRow}
              accessible
              accessibilityLabel={`${formatWeekdayDate(d.date)}: ${fmt(d.value)} ${unit}${d.isForecast ? ', previsão' : ''}`}
            >
              <AppText variant="caption" style={styles.tableCell}>
                {formatWeekdayDate(d.date)}
              </AppText>
              <AppText variant="caption" style={[styles.tableCell, styles.right]}>
                {fmt(d.value)} {unit}
              </AppText>
              <AppText variant="caption" color={colors.textMuted} style={[styles.tableCell, styles.right]}>
                {d.isForecast ? 'previsão' : 'observado'}
              </AppText>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  readout: { minHeight: 20, marginBottom: spacing.sm },
  bold: { fontWeight: '700' },
  plotRow: { flexDirection: 'row' },
  yAxis: { width: 44, justifyContent: 'space-between', marginTop: -9, marginBottom: -9 },
  yLabel: { textAlign: 'right', paddingRight: spacing.xs, fontSize: 11 },
  plot: { flex: 1, position: 'relative' },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: colors.chartGrid },
  todayLine: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: colors.chartAxis },
  refLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.text,
    zIndex: 2,
  },
  refLabel: { position: 'absolute', right: 0, bottom: 2, fontSize: 11, backgroundColor: colors.surface, paddingHorizontal: 2 },
  bars: { ...StyleSheet.absoluteFillObject, flexDirection: 'row', alignItems: 'flex-end' },
  slot: { flex: 1, height: '100%', justifyContent: 'flex-end', marginHorizontal: 1 },
  bar: { width: '100%', borderTopLeftRadius: 4, borderTopRightRadius: 4, minHeight: 2 },
  forecastBar: { opacity: 0.45, borderWidth: 1, borderStyle: 'dashed' },
  selectedBar: { opacity: 1, borderWidth: 2, borderColor: colors.text },
  whisker: { position: 'absolute', alignSelf: 'center', width: 2, zIndex: 1 },
  xAxis: { height: 20, marginLeft: 44, marginTop: spacing.xs, position: 'relative' },
  xLabel: { position: 'absolute', width: 48, marginLeft: -24, textAlign: 'center', fontSize: 11 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  swatch: { width: 12, height: 12, borderRadius: 3, marginRight: spacing.xs },
  tableToggle: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  table: { borderTopWidth: 1, borderColor: colors.border, borderRadius: radius.sm },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderColor: colors.chartGrid,
  },
  tableCell: { flex: 1 },
  right: { textAlign: 'right' },
});
