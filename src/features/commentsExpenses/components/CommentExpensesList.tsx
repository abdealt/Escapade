import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { supabase } from "../../../supabase-client";
import { CommentsExpenseForm } from "./CommentsExpensesForm";

interface Comment {
  id: number;
  user_id: string;
  content: string;
  expense_id: number;
  created_at: string;
  user_comment: string;
}

interface Expense {
  id: number;
  title: string;
}

interface CommentListProps {
  tripId: string;
  expenseId?: number; // Optionnel, si on veut préfiltrer pour une dépense spécifique
}

export const CommentExpensesList = ({ tripId, expenseId }: CommentListProps) => {
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
  const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(expenseId || null);

  // Fonction pour récupérer les dépenses disponibles
  const fetchExpenses = async (): Promise<Expense[]> => {
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

  // Récupérer la liste des dépenses
  const { data: expenses } = useQuery<Expense[], Error>({
    queryKey: ["expenses", tripId],
    queryFn: fetchExpenses,
    enabled: !!tripId
  });

  // Fonction pour récupérer les commentaires d'une dépense
  const fetchComments = async (): Promise<Comment[]> => {
    if (!selectedExpenseId) return [];

    const { data, error } = await supabase
      .from("comments_expenses")
      .select("*")
      .eq("expense_id", selectedExpenseId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }
    return data as Comment[];
  };

  const { 
    data: comments, 
    error: commentsError, 
    isLoading: isLoadingComments, 
    refetch: refetchComments 
  } = useQuery<Comment[], Error>({
    queryKey: ["comments_expenses", selectedExpenseId],
    queryFn: fetchComments,
    enabled: !!selectedExpenseId
  });

  const handleExpenseChange = (expenseId: number | null) => {
    setSelectedExpenseId(expenseId);
    setEditingComment(null);
  };

  const handleEdit = (comment: Comment) => {
    setEditingComment(comment);
  };

  const handleDelete = async () => {
    if (commentToDelete) {
      try {
        await supabase
          .from("comments_expenses")
          .delete()
          .eq("id", commentToDelete);
        refetchComments();
        setShowDeleteModal(false);
        setCommentToDelete(null);
      } catch (err) {
        console.error("Erreur lors de la suppression:", err);
      }
    }
  };

  const confirmDelete = (commentId: number) => {
    setCommentToDelete(commentId);
    setShowDeleteModal(true);
  };

  // Formatage de la date
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Trouver le titre de la dépense à partir de son ID
  const getExpenseTitle = (expenseId: number) => {
    const expense = expenses?.find(e => e.id === expenseId);
    return expense ? expense.title : 'Dépense inconnue';
  };

  return (
    <div>
      {/* Sélecteur de dépense */}
      <div className="bg-gray-700 p-4 rounded-lg mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Sélectionner une dépense
        </label>
        <select
          value={selectedExpenseId || ""}
          onChange={(e) => handleExpenseChange(e.target.value ? parseInt(e.target.value) : null)}
          className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
        >
          <option value="">Sélectionner une dépense</option>
          {expenses && expenses.map((expense) => (
            <option key={expense.id} value={expense.id}>
              {expense.title}
            </option>
          ))}
        </select>
      </div>

      {/* Afficher le formulaire de commentaires uniquement si une dépense est sélectionnée */}
      {selectedExpenseId && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">
            Ajouter un commentaire pour "{getExpenseTitle(selectedExpenseId)}"
          </h3>
          <CommentsExpenseForm 
            tripId={tripId} 
            onCommentAdded={refetchComments} 
            editingComment={editingComment} 
            setEditingComment={setEditingComment}
            selectedExpenseId={selectedExpenseId}
          />
        </div>
      )}

      {/* Liste des commentaires */}
      <div className="mt-6 space-y-4">
        {!selectedExpenseId ? (
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-300">Veuillez sélectionner une dépense pour voir les commentaires.</p>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-medium">
              Commentaires pour "{getExpenseTitle(selectedExpenseId)}"
            </h3>

            {isLoadingComments && (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}

            {commentsError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Erreur: </strong>
                <span className="block sm:inline">{commentsError.message}</span>
              </div>
            )}

            {comments && comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="mb-1 text-sm text-blue-300">
                        {comment.user_comment}
                      </div>
                      <p className="text-gray-300 mb-2">{comment.content}</p>
                      <p className="text-sm text-gray-400">
                        Le {formatDate(comment.created_at)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(comment)}
                        className="p-1.5 bg-blue-500 rounded-full hover:bg-blue-600 transition"
                        title="Modifier ce commentaire"
                      >
                        <FaEdit className="text-white text-sm" />
                      </button>
                      <button 
                        onClick={() => confirmDelete(comment.id)}
                        className="p-1.5 bg-red-500 rounded-full hover:bg-red-600 transition"
                        title="Supprimer ce commentaire"
                      >
                        <FaTrash className="text-white text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-300">Aucun commentaire pour cette dépense.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirmer la suppression</h3>
            <p className="mb-6">Êtes-vous sûr de vouloir supprimer ce commentaire ? Cette action est irréversible.</p>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
              >
                Annuler
              </button>
              <button 
                onClick={handleDelete} 
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};