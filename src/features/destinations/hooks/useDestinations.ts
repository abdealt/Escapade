import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DestinationFormData, destinationService } from "../services/destinationService";

export const useDestinations = (tripId: string) => {
  const queryClient = useQueryClient();

  // Query pour récupérer les destinations
  const destinationsQuery = useQuery({
    queryKey: ["destinations", tripId],
    queryFn: () => destinationService.fetchDestinations(tripId)
  });

  // Query pour récupérer les détails du voyage
  const tripQuery = useQuery({
    queryKey: ["trip", tripId],
    queryFn: () => destinationService.fetchTripDetails(tripId),
    enabled: !!tripId
  });

  // Mutation pour créer/modifier une destination
  const destinationMutation = useMutation({
    mutationFn: async ({ 
      destinationId, 
      data 
    }: { 
      destinationId?: string; 
      data: DestinationFormData 
    }) => {
      if (destinationId) {
        return destinationService.updateDestination(destinationId, data);
      } else {
        return destinationService.createDestination(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destinations", tripId] });
    }
  });

  // Mutation pour supprimer une destination
  const deleteDestinationMutation = useMutation({
    mutationFn: destinationService.deleteDestination,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destinations", tripId] });
    }
  });

  return {
    destinations: destinationsQuery.data,
    trip: tripQuery.data,
    isLoading: destinationsQuery.isLoading || tripQuery.isLoading,
    error: destinationsQuery.error || tripQuery.error,
    createOrUpdateDestination: destinationMutation.mutate,
    deleteDestination: deleteDestinationMutation.mutate,
    isSubmitting: destinationMutation.isPending,
    isDeletingDestination: deleteDestinationMutation.isPending
  };
};