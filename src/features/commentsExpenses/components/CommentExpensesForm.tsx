import { useCommentExpenseForm } from "../hooks/useCommentExpenseForm";
import { useCommentExpenses } from "../hooks/useCommentExpenses";
import { CommentExpense } from "../services/commentExpenseService";

interface CommentsExpenseFormProps {
  tripId: string;
  onCommentAdded: () => void;
  editingComment: CommentExpense | null;
  setEditingComment: (comment: null) => void;
  selectedExpenseId?: number | null;
}

export const CommentsExpenseForm = ({ 
  tripId, 
  onCommentAdded, 
  editingComment, 
  setEditingComment,
  selectedExpenseId
}: CommentsExpenseFormProps) => {
  const {
    expenses,
    userProfile,
    isLoadingUserProfile,
    createOrUpdateComment,
    isSubmitting
  } = useCommentExpenses(tripId, selectedExpenseId);

  const {
    formData,
    formErrors,
    isEditMode,
    handleChange,
    handleSubmit,
    handleCancel,
    setSubmitError
  } = useCommentExpenseForm({
    editingComment,
    selectedExpenseId,
    userName: userProfile || "Utilisateur",
    onSubmit: (data, editingCommentId) => {
      createOrUpdateComment(data, editingCommentId, {
        onSuccess: () => {
          onCommentAdded();
          if (editingComment) {
            setEditingComment(null);
          }
        },
        onError: (error) => {
          console.error("Erreur lors de l'ajout/mise à jour du commentaire:", error);
          setSubmitError("Une erreur est survenue lors de l'enregistrement du commentaire.");
        }
      });
    },
    onCancel: () => {
      if (editingComment) {
        setEditingComment(null);
      }
    }
  });

  if (isLoadingUserProfile) {
    return (
      <div className="bg-gray-700 p-4 rounded-lg">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

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
              name="expense_id"
              value={formData.expense_id}
              onChange={handleChange}
              className={`w-full p-3 bg-gray-800 border rounded text-white mb-4 ${
                formErrors.expense_id ? "border-red-500" : "border-gray-600"
              }`}
              required
              disabled={isEditMode} // Désactiver en mode édition
            >
              <option value="">Sélectionner une dépense</option>
              {expenses && expenses.map((expense) => (
                <option key={expense.id} value={expense.id}>
                  {expense.title}
                </option>
              ))}
            </select>
            {formErrors.expense_id && (
              <p className="text-red-500 text-sm mt-1 mb-4">{formErrors.expense_id}</p>
            )}
          </>
        )}

        <label className="block text-sm font-medium text-gray-300 mb-2">
          Commentaire
        </label>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="Ajouter un commentaire..."
          className={`w-full p-3 bg-gray-800 border rounded text-white resize-none ${
            formErrors.content ? "border-red-500" : "border-gray-600"
          }`}
          rows={3}
          required
        />
        {formErrors.content && (
          <p className="text-red-500 text-sm mt-1">{formErrors.content}</p>
        )}
      </div>

      {/* Message d'erreur général */}
      {formErrors.submit && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{formErrors.submit}</span>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        {isEditMode && (
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
          disabled={isSubmitting || !formData.expense_id}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
              {isEditMode ? "Mise à jour..." : "Envoi..."}
            </span>
          ) : (
            isEditMode ? "Mettre à jour" : "Ajouter"
          )}
        </button>
      </div>
    </form>
  );
};