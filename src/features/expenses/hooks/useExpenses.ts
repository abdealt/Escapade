import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExpenseFormData, expenseService } from "../services/expenseService";

export const useExpenses = (tripId: string) => {
  const queryClient = useQueryClient();

  // Query pour récupérer les dépenses
  const expensesQuery = useQuery({
    queryKey: ["expenses", tripId],
    queryFn: () => expenseService.fetchExpenses(tripId)
  });

  // Query pour récupérer les activités
  const activitiesQuery = useQuery({
    queryKey: ["activities", tripId],
    queryFn: () => expenseService.fetchActivities(tripId),
    enabled: !!tripId
  });

  // Mutation pour créer/modifier une dépense
  const expenseMutation = useMutation({
    mutationFn: async ({ 
      expenseId, 
      data 
    }: { 
      expenseId?: string; 
      data: ExpenseFormData 
    }) => {
      if (expenseId) {
        return expenseService.updateExpense(expenseId, data);
      } else {
        return expenseService.createExpense(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", tripId] });
    }
  });

  // Mutation pour supprimer une dépense
  const deleteExpenseMutation = useMutation({
    mutationFn: expenseService.deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", tripId] });
    }
  });

  return {
    expenses: expensesQuery.data,
    activities: activitiesQuery.data,
    isLoading: expensesQuery.isLoading,
    error: expensesQuery.error,
    createOrUpdateExpense: expenseMutation.mutate,
    deleteExpense: deleteExpenseMutation.mutate,
    isSubmitting: expenseMutation.isPending,
    isDeletingExpense: deleteExpenseMutation.isPending
  };
};