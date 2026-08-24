/** Облачный реестр Империи: бесплатный JSON-хостинг без регистрации (jsonblob.com). */
const API = "https://jsonblob.com/api/jsonBlob";

export async function createCloud(data: unknown): Promise<string | null> {
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok && res.status !== 201) return null;
    const loc = res.headers.get("Location") || res.headers.get("location") || "";
    const fromLoc = loc.split("/").filter(Boolean).pop();
    if (fromLoc && /^\d{6,}$/.test(fromLoc)) return fromLoc;
    // запасной путь: id может прийти в теле ответа
    try {
      const body = (await res.clone().json()) as Record<string, unknown>;
      for (const key of ["id", "blobId", "uri", "url"]) {
        const v = String(body[key] ?? "");
        const m = v.match(/(\d{6,})\s*$/);
        if (m) return m[1];
      }
    } catch {
      /* тело не JSON */
    }
    return null;
  } catch {
    return null;
  }
}

export async function pullCloud(code: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`${API}/${code}`, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function pushCloud(code: string, data: unknown): Promise<boolean> {
  try {
    const res = await fetch(`${API}/${code}`, {
      method: "PUT",
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
