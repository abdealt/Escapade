import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CommentExpenseFormData, commentExpenseService } from "../services/commentExpenseService";

export const useCommentExpenses = (tripId: string, selectedExpenseId?: number | null) => {
  const queryClient = useQueryClient();

  // Query pour récupérer les dépenses
  const expensesQuery = useQuery({
    queryKey: ["expenses", tripId],
    queryFn: () => commentExpenseService.fetchExpenses(tripId),
    enabled: !!tripId
  });

  // Query pour récupérer les commentaires d'une dépense spécifique
  const commentsQuery = useQuery({
    queryKey: ["comments_expenses", selectedExpenseId],
    queryFn: () => commentExpenseService.fetchComments(selectedExpenseId!),
    enabled: !!selectedExpenseId
  });

  // Query pour récupérer le profil utilisateur
  const userProfileQuery = useQuery({
    queryKey: ["userProfile"],
    queryFn: commentExpenseService.fetchUserProfile
  });

  // Mutation pour créer un commentaire
  const createCommentMutation = useMutation({
    mutationFn: commentExpenseService.createComment,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments_expenses", variables.expense_id] });
    }
  });

  // Mutation pour mettre à jour un commentaire
  const updateCommentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CommentExpenseFormData> }) =>
      commentExpenseService.updateComment(id, data),
    onSuccess: (updatedComment) => {
      queryClient.invalidateQueries({ queryKey: ["comments_expenses", updatedComment.expense_id] });
    }
  });

  // Mutation pour supprimer un commentaire
  const deleteCommentMutation = useMutation({
    mutationFn: commentExpenseService.deleteComment,
    onSuccess: () => {
      if (selectedExpenseId) {
        queryClient.invalidateQueries({ queryKey: ["comments_expenses", selectedExpenseId] });
      }
    }
  });

  // Fonction helper pour créer ou mettre à jour un commentaire
  const createOrUpdateComment = (
    data: CommentExpenseFormData,
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
    expenses: expensesQuery.data,
    comments: commentsQuery.data,
    userProfile: userProfileQuery.data,
    
    // Loading states
    isLoadingExpenses: expensesQuery.isLoading,
    isLoadingComments: commentsQuery.isLoading,
    isLoadingUserProfile: userProfileQuery.isLoading,
    
    // Error states
    expensesError: expensesQuery.error,
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