import { supabase, requireUserId } from '../api/supabase';
import { deletePlantPhotos } from './storage';

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
  const { data: previous, error: fetchError } = await supabase
    .from('notes')
    .select('photos')
    .eq('id', id)
    .single();
  if (fetchError) throw fetchError;

  const { data, error } = await supabase
    .from('notes')
    .update({ title, body, tags, photos, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  const newUrls = new Set(data.photos || []);
  const removedUrls = (previous?.photos || []).filter((url) => !newUrls.has(url));
  if (removedUrls.length > 0) {
    try {
      await deletePlantPhotos(removedUrls);
    } catch (err) {
      console.error('Failed to delete replaced note photo(s) from storage:', err);
    }
  }

  return data;
}

export async function deleteNote(id) {
  const { data: note, error: fetchError } = await supabase
    .from('notes')
    .select('photos')
    .eq('id', id)
    .single();
  if (fetchError) throw fetchError;

  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) throw error;

  if (note?.photos?.length > 0) {
    try {
      await deletePlantPhotos(note.photos);
    } catch (err) {
      console.error('Failed to delete note photo(s) from storage:', err);
    }
  }
}
