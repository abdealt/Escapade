import { useCommentActivities } from "../hooks/useCommentActivities";
import { useCommentActivityForm } from "../hooks/useCommentActivityForm";
import { CommentActivity } from "../services/commentActivityService";

interface CommentsFormProps {
  tripId: string;
  onCommentAdded: () => void;
  editingComment: CommentActivity | null;
  setEditingComment: (comment: null) => void;
  selectedActivityId?: number | null;
}

export const CommentsActivitieForm = ({ 
  tripId, 
  onCommentAdded, 
  editingComment, 
  setEditingComment,
  selectedActivityId
}: CommentsFormProps) => {
  const {
    activities,
    userProfile,
    isLoadingUserProfile,
    createOrUpdateComment,
    isSubmitting
  } = useCommentActivities(tripId, selectedActivityId);

  const {
    formData,
    formErrors,
    isEditMode,
    handleChange,
    handleSubmit,
    handleCancel,
    setSubmitError
  } = useCommentActivityForm({
    editingComment,
    selectedActivityId,
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
        {/* Ne montrer le sélecteur d'activité que si aucun selectedActivityId n'est passé de l'extérieur */}
        {!selectedActivityId && (
          <>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Activité
            </label>
            <select
              name="activity_id"
              value={formData.activity_id}
              onChange={handleChange}
              className={`w-full p-3 bg-gray-800 border rounded text-white mb-4 ${
                formErrors.activity_id ? "border-red-500" : "border-gray-600"
              }`}
              required
              disabled={isEditMode} // Désactiver en mode édition
            >
              <option value="">Sélectionner une activité</option>
              {activities && activities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.title}
                </option>
              ))}
            </select>
            {formErrors.activity_id && (
              <p className="text-red-500 text-sm mt-1 mb-4">{formErrors.activity_id}</p>
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
          disabled={isSubmitting || !formData.activity_id}
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