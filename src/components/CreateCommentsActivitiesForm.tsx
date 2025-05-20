import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../supabase-client";

interface CommentsFormProps {
  tripId: string;
  onCommentAdded: () => void;
  editingComment: {
    id: number;
    content: string;
    activity_id: number;
    user_comment: string;
  } | null;
  setEditingComment: (comment: null) => void;
  selectedActivityId?: number | null;
}

interface Activity {
  id: number;
  title: string;
}

export const CommentsActivitieForm = ({ 
  tripId, 
  onCommentAdded, 
  editingComment, 
  setEditingComment,
  selectedActivityId
}: CommentsFormProps) => {
  const [comment, setComment] = useState("");
  const [userName, setUserName] = useState("");
  const [localActivityId, setLocalActivityId] = useState<number | "">("");
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

  // Récupération des activités disponibles
  const fetchActivities = async (): Promise<Activity[]> => {
    if (!tripId) return [];

    const { data, error } = await supabase
      .from("activities")
      .select("id, title")
      .order("datetime", { ascending: true });
      
    if (error) {
      console.error("Erreur lors de la récupération des activités:", error);
      return [];
    }
    
    return data || [];
  };

  const { data: activities } = useQuery<Activity[], Error>({
    queryKey: ["activities", tripId],
    queryFn: fetchActivities,
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
      setLocalActivityId(editingComment.activity_id);
    } else {
      setComment("");
      // Si un selectedActivityId est fourni, l'utiliser, sinon réinitialiser
      setLocalActivityId(selectedActivityId || "");
    }
  }, [editingComment, selectedActivityId]);

  // Si selectedActivityId change, mettre à jour localActivityId
  useEffect(() => {
    if (selectedActivityId && !editingComment) {
      setLocalActivityId(selectedActivityId);
    }
  }, [selectedActivityId, editingComment]);

  // Mutation pour ajouter ou mettre à jour un commentaire
  const addOrUpdateCommentMutation = useMutation({
    mutationFn: async (newComment: { 
      content: string; 
      activity_id: number; 
      user_comment: string;
      id?: number 
    }) => {
      if (editingComment) {
        // Mettre à jour un commentaire existant
        const { data, error } = await supabase
          .from("comments_activities")
          .update({ 
            content: newComment.content,
            activity_id: newComment.activity_id 
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
          .from("comments_activities")
          .insert([
            { 
              content: newComment.content, 
              activity_id: newComment.activity_id,
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
      queryClient.invalidateQueries({ queryKey: ["comments", variables.activity_id] });
      onCommentAdded();
      
      // Réinitialiser le formulaire
      setComment("");
      if (!selectedActivityId) {
        setLocalActivityId("");
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
    
    if (!comment.trim() || !localActivityId) return;
    
    setIsSubmitting(true);
    
    try {
      if (editingComment) {
        // Mise à jour d'un commentaire existant
        addOrUpdateCommentMutation.mutate({ 
          content: comment, 
          activity_id: Number(localActivityId),
          user_comment: editingComment.user_comment,
          id: editingComment.id 
        });
      } else {
        // Ajout d'un nouveau commentaire
        addOrUpdateCommentMutation.mutate({
          content: comment, 
          activity_id: Number(localActivityId),
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
    if (!selectedActivityId) {
      setLocalActivityId("");
    }
    if (editingComment) {
      setEditingComment(null);
    }
  };

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
              value={localActivityId}
              onChange={(e) => setLocalActivityId(e.target.value ? Number(e.target.value) : "")}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white mb-4"
              required
              disabled={!!editingComment} // Désactiver en mode édition
            >
              <option value="">Sélectionner une activité</option>
              {activities && activities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.title}
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
          disabled={isSubmitting || !localActivityId}
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