import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ActivityFormData, activityService } from "../services/activityService";

export const useActivities = (tripId: string) => {
  const queryClient = useQueryClient();

  // Query pour récupérer les activités
  const activitiesQuery = useQuery({
    queryKey: ["activities", tripId],
    queryFn: () => activityService.fetchActivities(tripId)
  });

  // Query pour récupérer les destinations
  const destinationsQuery = useQuery({
    queryKey: ["destinations", tripId],
    queryFn: () => activityService.fetchDestinations(tripId)
  });

  // Mutation pour créer/modifier une activité
  const activityMutation = useMutation({
    mutationFn: async ({ 
      activityId, 
      data 
    }: { 
      activityId?: string; 
      data: ActivityFormData 
    }) => {
      if (activityId) {
        return activityService.updateActivity(activityId, data);
      } else {
        return activityService.createActivity(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities", tripId] });
    }
  });

  // Mutation pour supprimer une activité
  const deleteActivityMutation = useMutation({
    mutationFn: activityService.deleteActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities", tripId] });
    }
  });

  return {
    activities: activitiesQuery.data,
    destinations: destinationsQuery.data,
    isLoading: activitiesQuery.isLoading,
    error: activitiesQuery.error,
    createOrUpdateActivity: activityMutation.mutate,
    deleteActivity: deleteActivityMutation.mutate,
    isSubmitting: activityMutation.isPending,
    isDeletingActivity: deleteActivityMutation.isPending
  };
};