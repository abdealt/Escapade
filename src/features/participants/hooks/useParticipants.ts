// src/features/participants/hooks/useParticipants.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Participant, ParticipantsService } from '../services/participantsService';

export const useParticipants = (tripId: string) => {
  return useQuery({
    queryKey: ["participants", tripId],
    queryFn: () => ParticipantsService.fetchParticipants(tripId),
    enabled: !!tripId,
  });
};

export const useDeleteParticipant = (tripId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ParticipantsService.deleteParticipant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["participants", tripId] });
    },
    onError: (error) => {
      console.error("Erreur lors de la suppression:", error);
    },
  });
};

export const useAddParticipant = (tripId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId }: { userId: string }) => 
      ParticipantsService.addParticipant(tripId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["participants", tripId] });
    },
    onError: (error) => {
      console.error("Erreur lors de l'ajout:", error);
    },
  });
};

export const useUpdateParticipant = (tripId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ participantId, updates }: { 
      participantId: string; 
      updates: Partial<Participant> 
    }) => ParticipantsService.updateParticipant(participantId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["participants", tripId] });
    },
    onError: (error) => {
      console.error("Erreur lors de la mise à jour:", error);
    },
  });
};