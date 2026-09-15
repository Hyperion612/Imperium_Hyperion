import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://rahrutqeeuiubqhwumdr.supabase.co';

function getCredentials() {
  const url = localStorage.getItem('supabase_url') || DEFAULT_URL;
  const key = localStorage.getItem('supabase_key') || '';
  return { url, key };
}

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    const { url, key } = getCredentials();
    if (!key) {
      console.warn('Supabase key не настроен. Перейдите на /connect для подключения.');
    }
    client = createClient(url, key);
  }
  return client;
}

export function resetSupabase() {
  client = null;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    const currentClient = getSupabase();
    return (currentClient as unknown as Record<string, unknown>)[prop as string];
  }
});

export async function getState(): Promise<Record<string, unknown> | null> {
  try {
    const c = getSupabase();
    const result = await c
      .from('empire_state')
      .select('data')
      .eq('id', 'main')
      .single();
    
    if (result.error) {
      if (result.error.code === 'PGRST116') return null;
      throw result.error;
    }
    
    const row = result.data as Record<string, unknown> | null;
    return row?.data as Record<string, unknown> | null;
  } catch (err) {
    console.error('Ошибка получения состояния:', err);
    return null;
  }
}

export async function saveState(state: Record<string, unknown>): Promise<boolean> {
  try {
    const c = getSupabase();
    const result = await c
      .from('empire_state')
      .upsert({
        id: 'main',
        data: state,
        updated_at: new Date().toISOString()
      });
    
    if (result.error) throw result.error;
    return true;
  } catch (err) {
    console.error('Ошибка сохранения состояния:', err);
    return false;
  }
}

export function subscribeToChanges(callback: (data: Record<string, unknown>) => void) {
  const c = getSupabase();
  const channel = c
    .channel('empire-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'empire_state' },
      (payload) => {
        const payloadNew = payload.new as Record<string, unknown> | undefined;
        if (payloadNew?.data) {
          callback(payloadNew.data as Record<string, unknown>);
        }
      }
    )
    .subscribe();
  
  return () => {
    c.removeChannel(channel);
  };
}
