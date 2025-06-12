import { supabase } from "../../../supabase-client";

export interface CommentActivity {
  id: number;
  user_id: string;
  content: string;
  activity_id: number;
  created_at: string;
  user_comment: string;
}

export interface Activity {
  id: number;
  title: string;
}

export interface CommentActivityFormData {
  content: string;
  activity_id: number;
  user_comment: string;
}

export const commentActivityService = {
  // Récupérer les activités disponibles
  async fetchActivities(tripId: string): Promise<Activity[]> {
    const { data: destinations, error: destError } = await supabase
      .from("destinations")
      .select("id")
      .eq("trip_id", tripId);
    
    if (destError) {
      throw new Error(destError.message);
    }

    if (!destinations || destinations.length === 0) {
      return [];
    }

    const destinationIds = destinations.map(dest => dest.id);

    const { data, error } = await supabase
      .from("activities")
      .select("id, title")
      .in("destination_id", destinationIds)
      .order("datetime", { ascending: true });
      
    if (error) {
      throw new Error(error.message);
    }
    
    return data || [];
  },

  // Récupérer les commentaires d'une activité
  async fetchComments(activityId: number): Promise<CommentActivity[]> {
    const { data, error } = await supabase
      .from("comments_activities")
      .select("*")
      .eq("activity_id", activityId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data as CommentActivity[];
  },

  // Créer un nouveau commentaire
  async createComment(data: CommentActivityFormData): Promise<CommentActivity> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    const { data: newComment, error } = await supabase
      .from("comments_activities")
      .insert([
        { 
          ...data,
          user_id: userId
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return newComment;
  },

  // Mettre à jour un commentaire existant
  async updateComment(id: number, data: Partial<CommentActivityFormData>): Promise<CommentActivity> {
    const { data: updatedComment, error } = await supabase
      .from("comments_activities")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return updatedComment;
  },

  // Supprimer un commentaire
  async deleteComment(commentId: number): Promise<void> {
    const { error } = await supabase
      .from("comments_activities")
      .delete()
      .eq("id", commentId);
    
    if (error) {
      throw new Error(error.message);
    }
  },

  // Récupérer le profil utilisateur
  async fetchUserProfile(): Promise<string> {
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
  }
};