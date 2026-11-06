// Funcoes estatisticas puras (sem dependencias) usadas pelos modelos preditivos.

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export const round = (v, digits = 1) => {
  const f = 10 ** digits;
  return Math.round(v * f) / f;
};

export function mean(xs) {
  if (!xs.length) return NaN;
  return xs.reduce((acc, x) => acc + x, 0) / xs.length;
}

export function stdDev(xs) {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(xs.reduce((acc, x) => acc + (x - m) ** 2, 0) / (xs.length - 1));
}

export function percentChange(from, to) {
  if (!from) return 0;
  return ((to - from) / from) * 100;
}

/** Resolve A x = b por eliminacao de Gauss com pivotamento parcial. */
function solveLinearSystem(A, b) {
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
    }
    [M[col], M[pivot]] = [M[pivot], M[col]];
    const p = M[col][col] || 1e-12;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = M[r][col] / p;
      for (let c = col; c <= n; c++) M[r][c] -= factor * M[col][c];
    }
  }
  return M.map((row, i) => row[n] / (M[i][i] || 1e-12));
}

/**
 * Regressao linear multipla por minimos quadrados (equacoes normais).
 * X: matriz [n][k] de variaveis explicativas (sem intercepto).
 * Retorna coeficientes, R2, desvio padrao do residuo e funcao predict.
 * Usa uma regularizacao minima (ridge 1e-6) para evitar matriz singular,
 * por exemplo quando nao choveu nenhum dia (coluna toda zero).
 */
export function linearRegression(X, y) {
  const n = y.length;
  const rows = X.map((r) => [1, ...r]);
  const k = rows[0].length;

  const XtX = Array.from({ length: k }, () => Array(k).fill(0));
  const Xty = Array(k).fill(0);
  for (let i = 0; i < n; i++) {
    for (let a = 0; a < k; a++) {
      Xty[a] += rows[i][a] * y[i];
      for (let b = 0; b < k; b++) XtX[a][b] += rows[i][a] * rows[i][b];
    }
  }
  for (let a = 1; a < k; a++) XtX[a][a] += 1e-6;

  const beta = solveLinearSystem(XtX, Xty);
  const predict = (features) => beta[0] + features.reduce((acc, x, i) => acc + x * beta[i + 1], 0);

  const my = mean(y);
  let ssRes = 0;
  let ssTot = 0;
  for (let i = 0; i < n; i++) {
    const e = y[i] - predict(X[i]);
    ssRes += e * e;
    ssTot += (y[i] - my) ** 2;
  }
  const r2 = ssTot === 0 ? 0 : clamp(1 - ssRes / ssTot, 0, 1);
  const residualStd = Math.sqrt(ssRes / Math.max(1, n - k));

  return { coefficients: beta, r2, residualStd, n, predict };
}

/** Gerador pseudoaleatorio deterministico (mulberry32) a partir de uma string. */
export function seededRandom(seedText) {
  let h = 1779033703 ^ seedText.length;
  for (let i = 0; i < seedText.length; i++) {
    h = Math.imul(h ^ seedText.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
