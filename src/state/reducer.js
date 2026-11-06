import { DEFAULT_TERRITORY_ID } from '../data/territories';

export const DEFAULT_SETTINGS = {
  largeText: false, // aumenta a fonte de todo o app
  highContrast: false, // reforca bordas e contraste
  showLimitations: true, // exibe limitacoes junto dos alertas
  anonymousDecisions: false, // registra decisoes sem o nome do gestor
};

export const initialState = {
  hydrated: false, // dados locais ja foram carregados?
  territoryId: DEFAULT_TERRITORY_ID,
  settings: DEFAULT_SETTINGS,
  status: 'idle', // idle | loading | ready | error
  error: null,
  dataset: null,
  alerts: [],
  decisions: [], // decisoes humanas registradas sobre os alertas
};

export function appReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return {
        ...state,
        hydrated: true,
        territoryId: action.territoryId ?? state.territoryId,
        settings: { ...DEFAULT_SETTINGS, ...action.settings },
        decisions: action.decisions ?? [],
      };
    case 'LOAD_START':
      return { ...state, status: 'loading', error: null };
    case 'LOAD_SUCCESS':
      return { ...state, status: 'ready', dataset: action.dataset, alerts: action.alerts, error: null };
    case 'LOAD_ERROR':
      return { ...state, status: 'error', error: action.error };
    case 'SET_TERRITORY':
      if (action.territoryId === state.territoryId) return state;
      return { ...state, territoryId: action.territoryId, dataset: null, alerts: [] };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } };
    case 'ADD_DECISION':
      return { ...state, decisions: [action.decision, ...state.decisions] };
    case 'REMOVE_DECISION':
      return { ...state, decisions: state.decisions.filter((d) => d.id !== action.id) };
    case 'RESET':
      return { ...initialState, hydrated: true };
    default:
      return state;
  }
}
