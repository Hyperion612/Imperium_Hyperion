import { createClient } from '@supabase/supabase-js';

// Получаем credentials из переменных окружения
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://rahrutqeeuiubqhwumdr.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase anon key не настроен. Создайте файл .env и добавьте VITE_SUPABASE_ANON_KEY. См. README.md');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Типы для таблицы empire_state
export interface EmpireStateRow {
  id: string;
  data: unknown;
  updated_at: string;
}

// Получить состояние из Supabase
export async function getState(): Promise<unknown | null> {
  try {
    const { data, error } = await supabase
      .from('empire_state')
      .select('data')
      .eq('id', 'main')
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Запись не найдена
      throw error;
    }
    
    return data?.data || null;
  } catch (err) {
    console.error('Ошибка получения состояния из Supabase:', err);
    return null;
  }
}

// Сохранить состояние в Supabase
export async function saveState(state: unknown): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('empire_state')
      .upsert({
        id: 'main',
        data: state,
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Ошибка сохранения состояния в Supabase:', err);
    return false;
  }
}

// Подписка на изменения в реальном времени
export function subscribeToChanges(callback: (data: unknown) => void) {
  const channel = supabase
    .channel('empire-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'empire_state' },
      (payload: { new?: { data?: unknown } }) => {
        if (payload.new?.data) {
          callback(payload.new.data);
        }
      }
    )
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
}
