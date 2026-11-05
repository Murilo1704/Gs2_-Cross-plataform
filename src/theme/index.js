// Identidade visual do "Territorio Vivo".
// Paleta inspirada no tema CitizenTech (verde campo + laranja cidade),
// com contraste AA verificado para texto sobre as superficies principais.

export const colors = {
  primary: '#1F5F4A', // verde territorio (texto branco: contraste 7.6:1)
  primaryDark: '#143F31',
  primaryLight: '#E3F0EA',
  accent: '#C4501A', // laranja cidade (texto branco: contraste 4.9:1)
  accentLight: '#FBE9DF',

  background: '#F5F6F2',
  surface: '#FFFFFF',
  border: '#D9DDD5',

  text: '#1B1F1D',
  textMuted: '#4F5853',
  textOnPrimary: '#FFFFFF',

  // Niveis de risco dos alertas (sempre acompanhados de texto + icone,
  // nunca apenas cor, para nao excluir pessoas daltonicas).
  riskLow: '#2E7D4F',
  riskLowBg: '#E2F2E8',
  riskMedium: '#8A6100',
  riskMediumBg: '#FFF3D6',
  riskHigh: '#B3261E',
  riskHighBg: '#FBE4E2',

  // Series dos graficos
  water: '#1E6FA8',
  energy: '#C98A00',
  waste: '#6B4E9B',
  services: '#1F5F4A',
  climate: '#C4501A',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
};

export const typography = {
  title: { fontSize: 26, fontWeight: '700', lineHeight: 32 },
  subtitle: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  label: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  number: { fontSize: 28, fontWeight: '700', lineHeight: 34 },
};

// Area minima de toque recomendada (WCAG / Material: 48dp)
export const MIN_TOUCH = 48;

export const risk = {
  baixo: { label: 'Risco baixo', color: colors.riskLow, bg: colors.riskLowBg, icon: 'checkmark-circle' },
  medio: { label: 'Risco medio', color: colors.riskMedium, bg: colors.riskMediumBg, icon: 'alert-circle' },
  alto: { label: 'Risco alto', color: colors.riskHigh, bg: colors.riskHighBg, icon: 'warning' },
};

export const theme = { colors, spacing, radius, typography, risk, MIN_TOUCH };
export default theme;
