import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../../../supabase-client";

interface CommentsExpenseFormProps {
  tripId: string;
  onCommentAdded: () => void;
  editingComment: {
    id: number;
    content: string;
    expense_id: number;
    user_comment: string;
  } | null;
  setEditingComment: (comment: null) => void;
  selectedExpenseId?: number | null;
}

interface Expense {
  id: number;
  title: string;
}

export const CommentsExpenseForm = ({ 
  tripId, 
  onCommentAdded, 
  editingComment, 
  setEditingComment,
  selectedExpenseId
}: CommentsExpenseFormProps) => {
  const [comment, setComment] = useState("");
  const [userName, setUserName] = useState("");
  const [localExpenseId, setLocalExpenseId] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Récupération du profil utilisateur
  const fetchUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // D'abord, vérifions le display_name dans la table users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('display_name')
        .eq('id', user.id)
        .single();

      if (!userError && userData?.display_name) {
        return userData.display_name;
      }

      // Si pas de display_name, on utilise le nom du provider
      if (user.user_metadata && user.user_metadata.full_name) {
        return user.user_metadata.full_name;
      }

      // En dernier recours, on vérifie dans la table profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error("Erreur lors de la récupération du profil:", error);
        return user.email || "Utilisateur";
      }
      
      return data?.full_name || user.email || "Utilisateur";
    }
    return "Utilisateur";
  };

  // Récupération des dépenses disponibles
  const fetchExpenses = async (): Promise<Expense[]> => {
    if (!tripId) return [];

    const { data, error } = await supabase
      .from("expenses")
      .select("id, title")
      .eq("trip_id", tripId)
      .order("date", { ascending: true });

    if (error) {
      console.error("Erreur lors de la récupération des dépenses:", error);
      return [];
    }
    return data || [];
  };

  const { data: expenses } = useQuery<Expense[], Error>({
    queryKey: ["expenses", tripId],
    queryFn: fetchExpenses,
    enabled: !!tripId
  });

  // Récupérer le nom d'utilisateur au chargement
  useEffect(() => {
    const getUserName = async () => {
      const name = await fetchUserProfile();
      setUserName(name);
    };
    getUserName();
  }, []);

  // Mettre à jour le formulaire si un commentaire est en cours d'édition
  useEffect(() => {
    if (editingComment) {
      setComment(editingComment.content);
      setLocalExpenseId(editingComment.expense_id);
    } else {
      setComment("");
      // Si un selectedExpenseId est fourni, l'utiliser, sinon réinitialiser
      setLocalExpenseId(selectedExpenseId || "");
    }
  }, [editingComment, selectedExpenseId]);

  // Si selectedExpenseId change, mettre à jour localExpenseId
  useEffect(() => {
    if (selectedExpenseId && !editingComment) {
      setLocalExpenseId(selectedExpenseId);
    }
  }, [selectedExpenseId, editingComment]);

  // Mutation pour ajouter ou mettre à jour un commentaire
  const addOrUpdateCommentMutation = useMutation({
    mutationFn: async (newComment: { 
      content: string; 
      expense_id: number; 
      user_comment: string;
      id?: number 
    }) => {
      if (editingComment) {
        // Mettre à jour un commentaire existant
        const { data, error } = await supabase
          .from("comments_expenses")
          .update({ 
            content: newComment.content,
            expense_id: newComment.expense_id 
            // Ne pas mettre à jour user_comment pour garder l'auteur original
          })
          .eq("id", editingComment.id)
          .select();

        if (error) throw error;
        return data;
      } else {
        // Ajouter un nouveau commentaire
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;

        const { data, error } = await supabase
          .from("comments_expenses")
          .insert([
            { 
              content: newComment.content, 
              expense_id: newComment.expense_id,
              user_comment: newComment.user_comment,
              user_id: userId
            }
          ])
          .select();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      // Invalider et récupérer à nouveau les commentaires
      queryClient.invalidateQueries({ queryKey: ["comments_expenses", variables.expense_id] });
      onCommentAdded();

      // Réinitialiser le formulaire
      setComment("");
      if (!selectedExpenseId) {
        setLocalExpenseId("");
      }
      if (editingComment) {
        setEditingComment(null);
      }
    },
    onError: (error) => {
      console.error("Erreur lors de l'ajout/mise à jour du commentaire:", error);
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !localExpenseId) return;

    setIsSubmitting(true);

    try {
      if (editingComment) {
        // Mise à jour d'un commentaire existant
        addOrUpdateCommentMutation.mutate({ 
          content: comment, 
          expense_id: Number(localExpenseId),
          user_comment: editingComment.user_comment,
          id: editingComment.id 
        });
      } else {
        // Ajout d'un nouveau commentaire
        addOrUpdateCommentMutation.mutate({
          content: comment, 
          expense_id: Number(localExpenseId),
          user_comment: userName
        });
      }
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setComment("");
    if (!selectedExpenseId) {
      setLocalExpenseId("");
    }
    if (editingComment) {
      setEditingComment(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-700 p-4 rounded-lg">
      <div className="mb-4">
        {/* Ne montrer le sélecteur de dépense que si aucun selectedExpenseId n'est passé de l'extérieur */}
        {!selectedExpenseId && (
          <>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Dépense
            </label>
            <select
              value={localExpenseId}
              onChange={(e) => setLocalExpenseId(e.target.value ? Number(e.target.value) : "")}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white mb-4"
              required
              disabled={!!editingComment} // Désactiver en mode édition
            >
              <option value="">Sélectionner une dépense</option>
              {expenses && expenses.map((expense) => (
                <option key={expense.id} value={expense.id}>
                  {expense.title}
                </option>
              ))}
            </select>
          </>
        )}

        <label className="block text-sm font-medium text-gray-300 mb-2">
          Commentaire
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Ajouter un commentaire..."
          className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white resize-none"
          rows={3}
          required
        />
      </div>
      <div className="flex justify-end space-x-3">
        {editingComment && (
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition"
            disabled={isSubmitting}
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          className={`px-4 py-2 ${
            isSubmitting ? "bg-blue-700" : "bg-blue-600 hover:bg-blue-500"
          } text-white rounded transition`}
          disabled={isSubmitting || !localExpenseId}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
              {editingComment ? "Mise à jour..." : "Envoi..."}
            </span>
          ) : (
            editingComment ? "Mettre à jour" : "Ajouter"
          )}
        </button>
      </div>
    </form>
  );
};