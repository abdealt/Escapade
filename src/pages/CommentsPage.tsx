import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "../supabase-client";

// Types
interface BaseComment {
  id: string;
  user_id: string;
  content: string;
  created_at: string; // ISO string
  user_comment: string;
}

interface ActivityComment extends BaseComment {
  activity_id: string;
  target_id: string;
}

// Fonction API
const fetchActivityComments = async (userId: string): Promise<ActivityComment[]> => {
  const { data, error } = await supabase
    .from("comments_activities")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as ActivityComment[];
};

export function CommentsList() {
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  // Récupération utilisateur au montage
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        setError("Erreur lors de la récupération de l'utilisateur.");
        return;
      }
      setUserId(data.user.id);
    };
    getUser();
  }, []);

  // Requête des commentaires
  const {
    data: activityComments,
    isLoading,
    isError,
    error: fetchError,
  } = useQuery<ActivityComment[], Error>({
    queryKey: ["activityComments", userId],
    queryFn: () => fetchActivityComments(userId!),
    enabled: !!userId,
  });

  useEffect(() => {
    if (fetchError) {
      setError(fetchError.message);
    }
  }, [fetchError]);

  return (
    <div className="max-w-2xl mx-auto mt-6">
      <h2 className="text-2xl font-bold text-gray-700 mb-4">Mes commentaires</h2>

      {isLoading && (
        <div className="text-gray-500 text-center">Chargement des commentaires...</div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center">
          {error}
        </div>
      )}

      {!isLoading && activityComments?.length === 0 && (
        <div className="text-gray-500 text-center">Aucun commentaire trouvé.</div>
      )}

      <div className="space-y-4">
        {activityComments?.map((comment) => (
          <div
            key={comment.id}
            className="bg-white shadow-sm p-4 rounded-lg border border-gray-200"
          >
            <div className="text-sm text-gray-500 mb-1">
              Posté le {new Date(comment.created_at).toLocaleDateString()} par {comment.user_comment}
            </div>
            <p className="text-gray-800">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
