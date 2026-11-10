// Validacao do formulario de decisao do gestor.
// Funcoes puras: recebem os valores e devolvem um objeto { campo: mensagem }.

export const LIMITS = {
  justificationMin: 20,
  justificationMax: 500,
  nameMin: 3,
  nameMax: 60,
  roleMax: 60,
  reviewMaxDays: 90,
};

// Privacidade: o registro e sobre o TERRITORIO, nunca sobre cidadaos.
// Bloqueia padroes comuns de dados pessoais na justificativa.
const PERSONAL_DATA_PATTERNS = [
  { re: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/, what: 'CPF' },
  { re: /[\w.+-]+@[\w-]+\.[\w.]+/, what: 'e-mail' },
  { re: /\(?\b\d{2}\)?\s?9?\d{4}-?\d{4}\b/, what: 'telefone' },
];

export function findPersonalData(text = '') {
  const hit = PERSONAL_DATA_PATTERNS.find((p) => p.re.test(text));
  return hit ? hit.what : null;
}

const NAME_RE = /^[A-Za-zÀ-ÖØ-öø-ÿ' .-]+$/;

/** 'dd/mm/aaaa' -> Date (meio-dia local) ou null se invalida. */
export function parseBrDate(text = '') {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text.trim());
  if (!m) return null;
  const [, dd, mm, yyyy] = m.map(Number);
  const date = new Date(yyyy, mm - 1, dd, 12);
  const valid = date.getFullYear() === yyyy && date.getMonth() === mm - 1 && date.getDate() === dd;
  return valid ? date : null;
}

/** Mascara de digitacao: '05112026' -> '05/11/2026'. */
export function maskBrDate(text = '') {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/**
 * @param values  { decision, action, justification, responsible, role, reviewDate, confirmed }
 * @param options { anonymous, today }
 */
export function validateDecision(values, { anonymous = false, today = new Date() } = {}) {
  const errors = {};
  const justification = values.justification?.trim() ?? '';
  const responsible = values.responsible?.trim() ?? '';
  const role = values.role?.trim() ?? '';

  if (!values.decision) errors.decision = 'Escolha o tipo de decisão.';

  if (values.decision === 'encaminhar' && !values.action) {
    errors.action = 'Escolha qual ação sugerida será encaminhada.';
  }

  if (!justification) {
    errors.justification = 'Explique o motivo da decisão.';
  } else if (justification.length < LIMITS.justificationMin) {
    errors.justification = `Escreva pelo menos ${LIMITS.justificationMin} caracteres (faltam ${
      LIMITS.justificationMin - justification.length
    }).`;
  } else if (justification.length > LIMITS.justificationMax) {
    errors.justification = `Use no máximo ${LIMITS.justificationMax} caracteres.`;
  } else {
    const personal = findPersonalData(justification);
    if (personal) {
      errors.justification = `Parece haver um ${personal} no texto. Não registre dados pessoais de cidadãos.`;
    }
  }

  if (!anonymous) {
    if (!responsible) errors.responsible = 'Informe o nome do gestor responsável.';
    else if (responsible.length < LIMITS.nameMin) errors.responsible = `Use pelo menos ${LIMITS.nameMin} letras.`;
    else if (responsible.length > LIMITS.nameMax) errors.responsible = `Use no máximo ${LIMITS.nameMax} caracteres.`;
    else if (!NAME_RE.test(responsible)) errors.responsible = 'Use apenas letras, espaços, ponto, hífen ou apóstrofo.';
  }

  if (role.length > LIMITS.roleMax) errors.role = `Use no máximo ${LIMITS.roleMax} caracteres.`;

  const reviewText = values.reviewDate?.trim() ?? '';
  if (values.decision === 'monitorar' && !reviewText) {
    errors.reviewDate = 'Informe quando o alerta será reavaliado.';
  } else if (reviewText) {
    const date = parseBrDate(reviewText);
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const max = new Date(start);
    max.setDate(max.getDate() + LIMITS.reviewMaxDays);
    if (!date) errors.reviewDate = 'Use uma data válida no formato dd/mm/aaaa.';
    else if (date < start) errors.reviewDate = 'A data de reavaliação não pode estar no passado.';
    else if (date > max) errors.reviewDate = `Escolha uma data em até ${LIMITS.reviewMaxDays} dias.`;
  }

  if (!values.confirmed) {
    errors.confirmed = 'Confirme que avaliou a justificativa, a confiança e as limitações.';
  }

  return errors;
}
