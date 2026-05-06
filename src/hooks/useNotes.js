import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as notesService from '../services/notes';
import { useAuth } from './useAuth';

export const noteKeys = {
  all: ['notes'],
  lists: () => [...noteKeys.all, 'list'],
};

export function useNotes() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: noteKeys.lists(),
    queryFn: notesService.getNotes,
    enabled: isAuthenticated,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notesService.createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }) => notesService.updateNote(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notesService.deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
    },
  });
}
