/**
 * Интеграция с мессенджером Imperium Link
 * https://hyperion612.github.io/Messenger_Imperium-Link/
 */

const MESSENGER_API = "https://hyperion612.github.io/Messenger_Imperium-Link/api";

export interface CitizenSyncData {
  id: string;
  name: string;
  rank: string;
  light: number;
  hyper: number;
  province: string;
  passportIssuedAt?: number;
}

/**
 * Получить данные гражданина из мессенджера
 */
export async function fetchCitizenFromMessenger(citizenId: string): Promise<CitizenSyncData | null> {
  try {
    const response = await fetch(`${MESSENGER_API}/citizen/${citizenId}`);
    if (!response.ok) {
      console.warn(`Мессенджер вернул ${response.status} для ${citizenId}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Ошибка получения данных из мессенджера:", error);
    return null;
  }
}

/**
 * Синхронизировать данные с мессенджером
 */
export async function syncToMessenger(citizen: CitizenSyncData): Promise<boolean> {
  try {
    const response = await fetch(`${MESSENGER_API}/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(citizen),
    });
    return response.ok;
  } catch (error) {
    console.error("Ошибка синхронизации с мессенджером:", error);
    return false;
  }
}

/**
 * Обновить баланс HYPER в мессенджере
 */
export async function updateHyperBalance(citizenId: string, hyper: number): Promise<boolean> {
  try {
    const response = await fetch(`${MESSENGER_API}/citizen/${citizenId}/balance`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hyper }),
    });
    return response.ok;
  } catch (error) {
    console.error("Ошибка обновления баланса:", error);
    return false;
  }
}

/**
 * Обновить Уровень Света в мессенджере
 */
export async function updateLightLevel(citizenId: string, light: number): Promise<boolean> {
  try {
    const response = await fetch(`${MESSENGER_API}/citizen/${citizenId}/light`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ light }),
    });
    return response.ok;
  } catch (error) {
    console.error("Ошибка обновления Уровня Света:", error);
    return false;
  }
}

/**
 * Проверить доступность API мессенджера
 */
export async function checkMessengerConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${MESSENGER_API}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
