import { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useCommentActivities } from "../hooks/useCommentActivities";
import { CommentActivity } from "../services/commentActivityService";
import { CommentsActivitieForm } from "./CommentsActivitiesForm";

interface CommentsListProps {
  tripId: string;
  activityId?: number; // Optionnel, si on veut préfiltrer pour une activité spécifique
}

export const CommentsActivitiesList = ({ tripId, activityId }: CommentsListProps) => {
  const [editingComment, setEditingComment] = useState<CommentActivity | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(activityId || null);

  const {
    activities,
    comments,
    isLoadingActivities,
    isLoadingComments,
    activitiesError,
    commentsError,
    deleteComment,
    refetchComments,
    isDeleting
  } = useCommentActivities(tripId, selectedActivityId);

  const handleActivityChange = (activityId: number | null) => {
    setSelectedActivityId(activityId);
    setEditingComment(null);
  };

  const handleEdit = (comment: CommentActivity) => {
    setEditingComment(comment);
  };

  const handleDelete = async () => {
    if (commentToDelete) {
      try {
        await deleteComment(commentToDelete);
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

  // Trouver le titre de l'activité à partir de son ID
  const getActivityTitle = (activityId: number) => {
    const activity = activities?.find(a => a.id === activityId);
    return activity ? activity.title : 'Activité inconnue';
  };

  if (isLoadingActivities) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (activitiesError) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Erreur: </strong>
        <span className="block sm:inline">{activitiesError.message}</span>
      </div>
    );
  }

  return (
    <div>
      {/* Sélecteur d'activité */}
      <div className="bg-gray-700 p-4 rounded-lg mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Sélectionner une activité
        </label>
        <select
          value={selectedActivityId || ""}
          onChange={(e) => handleActivityChange(e.target.value ? parseInt(e.target.value) : null)}
          className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
        >
          <option value="">Sélectionner une activité</option>
          {activities && activities.map((activity) => (
            <option key={activity.id} value={activity.id}>
              {activity.title}
            </option>
          ))}
        </select>
      </div>

      {/* Afficher le formulaire de commentaires uniquement si une activité est sélectionnée */}
      {selectedActivityId && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">
            Ajouter un commentaire pour "{getActivityTitle(selectedActivityId)}"
          </h3>
          <CommentsActivitieForm 
            tripId={tripId} 
            onCommentAdded={() => refetchComments()} 
            editingComment={editingComment} 
            setEditingComment={setEditingComment}
            selectedActivityId={selectedActivityId}
          />
        </div>
      )}

      {/* Liste des commentaires */}
      <div className="mt-6 space-y-4">
        {!selectedActivityId ? (
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-300">Veuillez sélectionner une activité pour voir les commentaires.</p>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-medium">
              Commentaires pour "{getActivityTitle(selectedActivityId)}"
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
                        disabled={isDeleting}
                      >
                        <FaEdit className="text-white text-sm" />
                      </button>
                      <button 
                        onClick={() => confirmDelete(comment.id)}
                        className="p-1.5 bg-red-500 rounded-full hover:bg-red-600 transition"
                        title="Supprimer ce commentaire"
                        disabled={isDeleting}
                      >
                        <FaTrash className="text-white text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-300">Aucun commentaire pour cette activité.</p>
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
                disabled={isDeleting}
              >
                Annuler
              </button>
              <button 
                onClick={handleDelete} 
                className={`px-4 py-2 bg-red-600 rounded hover:bg-red-700 ${
                  isDeleting ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isDeleting}
              >
                {isDeleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};