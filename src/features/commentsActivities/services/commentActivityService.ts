// src/features/commentsActivities/services/commentActivityService.ts
import { apiClient } from "../../../lib/api-client";

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
    // D'abord récupérer les destinations du voyage
    const destinations = await apiClient.get<{id: string}[]>(
      'destinations',
      { trip_id: `eq.${tripId}` },
      'id'
    );
    
    if (!destinations || destinations.length === 0) {
      return [];
    }

    const destinationIds = destinations.map(dest => dest.id).join(',');
    const activities = await apiClient.get<Activity[]>(
      'activities',
      { 
        destination_id: `in.(${destinationIds})`,
        order: 'datetime.asc'
      },
      'id,title'
    );
      
    return activities || [];
  },

  // Récupérer les commentaires d'une activité
  async fetchComments(activityId: number): Promise<CommentActivity[]> {
    const comments = await apiClient.get<CommentActivity[]>(
      'comments_activities',
      { 
        activity_id: `eq.${activityId}`,
        order: 'created_at.desc'
      }
    );

    return comments as CommentActivity[];
  },

  // Créer un nouveau commentaire
  async createComment(data: CommentActivityFormData): Promise<CommentActivity> {
    // Note: user_id sera automatiquement ajouté par RLS ou trigger
    const result = await apiClient.post<CommentActivity[]>('comments_activities', data);
    return result[0];
  },

  // Mettre à jour un commentaire existant
  async updateComment(id: number, data: Partial<CommentActivityFormData>): Promise<CommentActivity> {
    const result = await apiClient.patch<CommentActivity[]>(
      'comments_activities', 
      data, 
      { id: `eq.${id}` }
    );
    return result[0];
  },

  // Supprimer un commentaire
  async deleteComment(commentId: number): Promise<void> {
    await apiClient.delete('comments_activities', { id: `eq.${commentId}` });
  },

  // Récupérer le profil utilisateur
  async fetchUserProfile(): Promise<string> {
    try {
      // Essayer d'abord la table users
      const users = await apiClient.get<{display_name: string}[]>(
        'users',
        {},
        'display_name'
      );

      if (users && users.length > 0 && users[0].display_name) {
        return users[0].display_name;
      }

      // Fallback vers la table profiles
      const profiles = await apiClient.get<{full_name: string}[]>(
        'profiles',
        {},
        'full_name'
      );

      if (profiles && profiles.length > 0 && profiles[0].full_name) {
        return profiles[0].full_name;
      }

      return "Utilisateur";
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error);
      return "Utilisateur";
    }
  }
};
