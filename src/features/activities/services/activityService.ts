import { supabase } from "../../../supabase-client";

export interface Activity {
  id: string;
  destination_id: string;
  title: string;
  description: string;
  datetime: string;
  email?: string;
  user_id?: string;
}

export interface Destination {
  id: string;
  city: string;
  start_date?: string;
  end_date?: string;
}

export interface ActivityFormData {
  destination_id: string;
  title: string;
  description: string;
  datetime: string;
}

export const activityService = {
  // Récupérer les activités d'un voyage
  async fetchActivities(tripId: string): Promise<Activity[]> {
    // D'abord on récupère toutes les destinations du voyage
    const { data: destinations, error: destError } = await supabase
      .from("destinations")
      .select("id")
      .eq("trip_id", tripId);

    if (destError) {
      throw new Error(destError.message);
    }

    if (!destinations || destinations.length === 0) {
      return []; // Pas de destinations, donc pas d'activités
    }

    // Récupérer les activités liées à ces destinations
    const destinationIds = destinations.map(dest => dest.id);
    const { data: activities, error } = await supabase
      .from("activities")
      .select("*")
      .in("destination_id", destinationIds)
      .order("datetime", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return activities || [];
  },

  // Récupérer les destinations d'un voyage
  async fetchDestinations(tripId: string): Promise<Destination[]> {
    const { data, error } = await supabase
      .from("destinations")
      .select("*")
      .eq("trip_id", tripId)
      .order("city", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  },

  // Créer une nouvelle activité
  async createActivity(data: ActivityFormData): Promise<Activity> {
    const { data: newActivity, error } = await supabase
      .from("activities")
      .insert([data])
      .select();
    
    if (error) throw new Error(error.message);
    return newActivity?.[0];
  },

  // Mettre à jour une activité existante
  async updateActivity(id: string, data: ActivityFormData): Promise<Activity> {
    const { error } = await supabase
      .from("activities")
      .update(data)
      .eq("id", id);
    
    if (error) throw new Error(error.message);
    return { ...data, id };
  },

  // Supprimer une activité
  async deleteActivity(activityId: string): Promise<void> {
    const { error } = await supabase
      .from("activities")
      .delete()
      .eq("id", activityId);
    
    if (error) {
      throw new Error(error.message);
    }
  }
};