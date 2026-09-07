/** Облачный реестр Империи: npoint.io — бесплатный JSON-хостинг без CORS-проблем. */
const API = "https://api.npoint.io";

export async function createCloud(data: unknown): Promise<string | null> {
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    const body = await res.json();
    return body.id || null;
  } catch {
    return null;
  }
}

export async function pullCloud(code: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`${API}/${code}`);
    if (!res.ok) return null;
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function pushCloud(code: string, data: unknown): Promise<boolean> {
  try {
    const res = await fetch(`${API}/${code}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Экспорт/импорт реестра одним кодом (работает без облака). */
export function encodeState(data: unknown): string {
  const json = JSON.stringify(data);
  const bytes = new TextEncoder().encode(json);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return "HYP2." + btoa(bin);
}

export function decodeState(code: string): Record<string, unknown> | null {
  try {
    const raw = code.trim();
    const b64 = raw.startsWith("HYP2.") ? raw.slice(5) : raw;
    const bin = atob(b64.replace(/\s+/g, ""));
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>;
  } catch {
    return null;
  }
}
