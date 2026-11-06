import AsyncStorage from '@react-native-async-storage/async-storage';

// Persistencia local (no aparelho). Nenhum dado e enviado para servidores.
const PREFIX = '@territorio-vivo:';

export const KEYS = {
  territory: `${PREFIX}territory`,
  settings: `${PREFIX}settings`,
  decisions: `${PREFIX}decisions`,
  weatherCache: (territoryId) => `${PREFIX}weather:${territoryId}`,
};

export async function getJSON(key, fallback = null) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export async function setJSON(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Falha de escrita nao deve derrubar o app; o estado em memoria continua valido.
  }
}

/** Apaga TODOS os dados do app salvos no aparelho (direito de exclusao - LGPD). */
export async function clearAllAppData() {
  const keys = await AsyncStorage.getAllKeys();
  const ours = keys.filter((k) => k.startsWith(PREFIX));
  if (ours.length) await AsyncStorage.multiRemove(ours);
}
