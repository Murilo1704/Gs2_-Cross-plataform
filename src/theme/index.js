// Identidade visual do "Território Vivo".
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

  // Series dos graficos. Paleta validada (contraste >= 3:1 sobre a superficie,
  // separacao para daltonismo deltaE >= 8 entre cores vizinhas).
  water: '#1E6FA8',
  energy: '#A87300',
  waste: '#6B4E9B',
  services: '#0E8064',
  climate: '#C4501A',
  rain: '#1E6FA8',

  // Elementos de apoio dos graficos (eixos e grades discretos)
  chartGrid: '#E6E9E3',
  chartAxis: '#8A938D',
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
  lg: 16,
  xl: 24,
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
  medio: { label: 'Risco médio', color: colors.riskMedium, bg: colors.riskMediumBg, icon: 'alert-circle' },
  alto: { label: 'Risco alto', color: colors.riskHigh, bg: colors.riskHighBg, icon: 'warning' },
};

// Sombra suave das superficies (cartoes). Android usa elevation; iOS/web usam shadow*.
export const shadow = {
  card: {
    shadowColor: '#143F31',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
};

// Ajustes de acessibilidade escolhidos pelo usuario (tela Ajustes).
export const LARGE_TEXT_SCALE = 1.2;
export const highContrast = {
  border: '#1B1F1D',
  textMuted: '#1B1F1D',
};

export const theme = { colors, spacing, radius, typography, risk, shadow, MIN_TOUCH };
export default theme;
