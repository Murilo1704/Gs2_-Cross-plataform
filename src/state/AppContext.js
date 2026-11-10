import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { getTerritory } from '../data/territories';
import { isActiveAlert } from '../engine/alerts';
import { loadTerritoryData } from '../services/territoryService';
import { clearAllAppData, getJSON, KEYS, setJSON } from '../services/storage';
import { appReducer, DEFAULT_SETTINGS, initialState } from './reducer';

const AppContext = createContext(null);

// Gerenciamento de estado global: Context API + useReducer.
// Persistencia: territorio escolhido, configuracoes e decisoes sao salvos
// no AsyncStorage sempre que mudam e restaurados ao abrir o app.
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const requestId = useRef(0);

  // 1. Restaura os dados locais
  useEffect(() => {
    (async () => {
      const [territoryId, settings, decisions] = await Promise.all([
        getJSON(KEYS.territory),
        getJSON(KEYS.settings, {}),
        getJSON(KEYS.decisions, []),
      ]);
      dispatch({ type: 'HYDRATE', territoryId, settings, decisions });
    })();
  }, []);

  // 2. Salva quando mudar (somente apos restaurar, para nao sobrescrever)
  useEffect(() => {
    if (state.hydrated) setJSON(KEYS.territory, state.territoryId);
  }, [state.hydrated, state.territoryId]);
  useEffect(() => {
    if (state.hydrated) setJSON(KEYS.settings, state.settings);
  }, [state.hydrated, state.settings]);
  useEffect(() => {
    if (state.hydrated) setJSON(KEYS.decisions, state.decisions);
  }, [state.hydrated, state.decisions]);

  // 3. Carrega os dados do territorio (consumo de API + modelos)
  const refresh = useCallback(async () => {
    const id = ++requestId.current;
    dispatch({ type: 'LOAD_START' });
    try {
      const result = await loadTerritoryData(getTerritory(state.territoryId));
      // Ignora respostas antigas se o usuario trocou de territorio no meio
      if (id === requestId.current) dispatch({ type: 'LOAD_SUCCESS', ...result });
    } catch (err) {
      if (id === requestId.current) dispatch({ type: 'LOAD_ERROR', error: err?.message ?? 'Erro desconhecido' });
    }
  }, [state.territoryId]);

  // resetCount forca um novo carregamento depois de "Apagar todos os dados",
  // mesmo quando o territorio padrao ja era o selecionado.
  const [resetCount, setResetCount] = useState(0);
  useEffect(() => {
    if (state.hydrated) refresh();
  }, [state.hydrated, refresh, resetCount]);

  const actions = useMemo(
    () => ({
      refresh,
      setTerritory: (territoryId) => dispatch({ type: 'SET_TERRITORY', territoryId }),
      updateSettings: (settings) => dispatch({ type: 'UPDATE_SETTINGS', settings }),
      addDecision: (decision) =>
        dispatch({
          type: 'ADD_DECISION',
          decision: { id: `${Date.now()}`, createdAt: new Date().toISOString(), ...decision },
        }),
      removeDecision: (id) => dispatch({ type: 'REMOVE_DECISION', id }),
      clearAllData: async () => {
        await clearAllAppData();
        dispatch({ type: 'RESET' });
        setResetCount((n) => n + 1);
      },
    }),
    [refresh]
  );

  const value = useMemo(() => {
    const territory = getTerritory(state.territoryId);
    const activeAlerts = state.alerts.filter(isActiveAlert);
    return { state, territory, activeAlerts, ...actions };
  }, [state, actions]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * Ajustes de acessibilidade para os componentes visuais.
 * Seguro fora do provider (retorna os padroes).
 */
export function useSettings() {
  const ctx = useContext(AppContext);
  return ctx?.state.settings ?? DEFAULT_SETTINGS;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de <AppProvider>');
  return ctx;
}
