import { supabase, requireUserId } from '../api/supabase';

export async function getNotes() {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createNote({ title, body, tags = [], photos = [] }) {
  const user_id = await requireUserId();
  const { data, error } = await supabase
    .from('notes')
    .insert({ user_id, title, body, tags, photos })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateNote(id, { title, body, tags, photos }) {
  const { data, error } = await supabase
    .from('notes')
    .update({ title, body, tags, photos, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteNote(id) {
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) throw error;
}
