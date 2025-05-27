import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CommentActivityFormData, commentActivityService } from "../services/commentActivityService";

export const useCommentActivities = (tripId: string, selectedActivityId?: number | null) => {
  const queryClient = useQueryClient();

  // Query pour récupérer les activités
  const activitiesQuery = useQuery({
    queryKey: ["activities", tripId],
    queryFn: commentActivityService.fetchActivities,
    enabled: !!tripId
  });

  // Query pour récupérer les commentaires d'une activité spécifique
  const commentsQuery = useQuery({
    queryKey: ["comments", selectedActivityId],
    queryFn: () => commentActivityService.fetchComments(selectedActivityId!),
    enabled: !!selectedActivityId
  });

  // Query pour récupérer le profil utilisateur
  const userProfileQuery = useQuery({
    queryKey: ["userProfile"],
    queryFn: commentActivityService.fetchUserProfile
  });

  // Mutation pour créer un commentaire
  const createCommentMutation = useMutation({
    mutationFn: commentActivityService.createComment,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.activity_id] });
    }
  });

  // Mutation pour mettre à jour un commentaire
  const updateCommentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CommentActivityFormData> }) =>
      commentActivityService.updateComment(id, data),
    onSuccess: (updatedComment) => {
      queryClient.invalidateQueries({ queryKey: ["comments", updatedComment.activity_id] });
    }
  });

  // Mutation pour supprimer un commentaire
  const deleteCommentMutation = useMutation({
    mutationFn: commentActivityService.deleteComment,
    onSuccess: () => {
      if (selectedActivityId) {
        queryClient.invalidateQueries({ queryKey: ["comments", selectedActivityId] });
      }
    }
  });

  // Fonction helper pour créer ou mettre à jour un commentaire
  const createOrUpdateComment = (
    data: CommentActivityFormData,
    editingCommentId?: number,
    callbacks?: {
      onSuccess?: () => void;
      onError?: (error: any) => void;
    }
  ) => {
    if (editingCommentId) {
      updateCommentMutation.mutate(
        { id: editingCommentId, data },
        {
          onSuccess: callbacks?.onSuccess,
          onError: callbacks?.onError
        }
      );
    } else {
      createCommentMutation.mutate(data, {
        onSuccess: callbacks?.onSuccess,
        onError: callbacks?.onError
      });
    }
  };

  return {
    // Data
    activities: activitiesQuery.data,
    comments: commentsQuery.data,
    userProfile: userProfileQuery.data,
    
    // Loading states
    isLoadingActivities: activitiesQuery.isLoading,
    isLoadingComments: commentsQuery.isLoading,
    isLoadingUserProfile: userProfileQuery.isLoading,
    
    // Error states
    activitiesError: activitiesQuery.error,
    commentsError: commentsQuery.error,
    
    // Actions
    createOrUpdateComment,
    deleteComment: deleteCommentMutation.mutate,
    refetchComments: commentsQuery.refetch,
    
    // Mutation states
    isSubmitting: createCommentMutation.isPending || updateCommentMutation.isPending,
    isDeleting: deleteCommentMutation.isPending
  };
};