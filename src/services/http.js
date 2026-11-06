export class ApiError extends Error {
  constructor(message, { status, cause } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.cause = cause;
  }
}

/** GET JSON com timeout (evita a tela travar em conexoes ruins). */
export async function fetchJson(url, { timeoutMs = 10000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new ApiError(`Falha na API (HTTP ${response.status})`, { status: response.status });
    }
    return await response.json();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    const message = err?.name === 'AbortError' ? 'Tempo de resposta esgotado' : 'Sem conexao com a API';
    throw new ApiError(message, { cause: err });
  } finally {
    clearTimeout(timer);
  }
}
