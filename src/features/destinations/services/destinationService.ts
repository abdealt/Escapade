import { supabase } from "../../../supabase-client";

export interface Destination {
  id: string;
  trip_id: string;
  city: string;
  start_date: string; // Timestamp sous format string
  end_date: string; // Timestamp sous format string
}

export interface Trip {
  id: string;
  start_date: string; // Timestamp sous format string
  end_date: string; // Timestamp sous format string
}

export interface DestinationFormData {
  city: string;
  start_date: string;
  end_date: string;
  trip_id: string;
}

export const destinationService = {
  // Récupérer les destinations d'un voyage
  async fetchDestinations(tripId: string): Promise<Destination[]> {
    const { data, error } = await supabase
      .from("destinations")
      .select("*")
      .eq("trip_id", tripId)
      .order("start_date");

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  },

  // Récupérer les détails d'un voyage
  async fetchTripDetails(tripId: string): Promise<Trip> {
    const { data, error } = await supabase
      .from("trips")
      .select("id, start_date, end_date")
      .eq("id", tripId)
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  },

  // Créer une nouvelle destination
  async createDestination(data: DestinationFormData): Promise<Destination> {
    const { data: newDestination, error } = await supabase
      .from("destinations")
      .insert([data])
      .select();
    
    if (error) throw new Error(error.message);
    return newDestination?.[0];
  },

  // Mettre à jour une destination existante
  async updateDestination(id: string, data: DestinationFormData): Promise<Destination> {
    const { error } = await supabase
      .from("destinations")
      .update({
        city: data.city,
        start_date: data.start_date,
        end_date: data.end_date,
      })
      .eq("id", id);
    
    if (error) throw new Error(error.message);
    return { ...data, id };
  },

  // Supprimer une destination
  async deleteDestination(destinationId: string): Promise<void> {
    const { error } = await supabase
      .from("destinations")
      .delete()
      .eq("id", destinationId);
    
    if (error) {
      throw new Error(error.message);
    }
  }
};