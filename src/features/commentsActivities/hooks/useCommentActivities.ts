import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CommentActivityFormData, commentActivityService } from "../services/commentActivityService";

export const useCommentActivities = (tripId: string, selectedActivityId?: number | null) => {
  const queryClient = useQueryClient();

  // Query pour récupérer les activités
  const activitiesQuery = useQuery({
    queryKey: ["activities", tripId],
    queryFn: () => commentActivityService.fetchActivities(tripId),
    enabled: !!tripId
  });

  // Query pour récupérer tous les commentaires
  const commentsQuery = useQuery({
    queryKey: ["tripComments", tripId],
    queryFn: () => Promise.all(
      (activitiesQuery.data || []).map(activity =>
        commentActivityService.fetchComments(activity.id)
      )
    ).then(results => results.flat()),
    enabled: !!tripId && !!activitiesQuery.data
  });

  // Query pour récupérer le profil utilisateur
  const userProfileQuery = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => commentActivityService.fetchUserProfile()
  });

  // Mutation pour créer un commentaire
  const createCommentMutation = useMutation({
    mutationFn: (data: CommentActivityFormData) => commentActivityService.createComment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tripComments", tripId] });
    }
  });

  // Mutation pour mettre à jour un commentaire
  const updateCommentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CommentActivityFormData> }) =>
      commentActivityService.updateComment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tripComments", tripId] });
    }
  });

  // Mutation pour supprimer un commentaire
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => commentActivityService.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tripComments", tripId] });
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
    comments: commentsQuery.data?.filter(comment => 
      !selectedActivityId || comment.activity_id === selectedActivityId
    ),
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
    deleteComment: (commentId: number) => deleteCommentMutation.mutate(commentId),
    refetchComments: () => commentsQuery.refetch(),
    
    // Mutation states
    isSubmitting: createCommentMutation.isPending || updateCommentMutation.isPending,
    isDeleting: deleteCommentMutation.isPending
  };
};