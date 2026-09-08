import { createClient } from '@supabase/supabase-js';

// ВАЖНО: Замените эти значения на ваши credentials из Supabase
// 1. Зайдите на https://supabase.com и создайте проект
// 2. Скопируйте URL и anon key из Settings -> API
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
  console.warn('⚠️ Supabase credentials не настроены. Следуйте инструкции в README.md');
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
