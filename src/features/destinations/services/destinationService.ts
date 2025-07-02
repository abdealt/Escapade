// src/features/destinations/services/destinationService.ts
import { apiClient } from "../../../lib/api-client";

export interface Destination {
  id: string;
  trip_id: string;
  city: string;
  start_date: string;
  end_date: string;
}

export interface Trip {
  id: string;
  start_date: string;
  end_date: string;
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
    const destinations = await apiClient.get<Destination[]>(
      'destinations',
      { 
        trip_id: `eq.${tripId}`,
        order: 'start_date.asc'
      }
    );

    return destinations || [];
  },

  // Récupérer les détails d'un voyage
  async fetchTripDetails(tripId: string): Promise<Trip> {
    const trips = await apiClient.get<Trip[]>(
      'trips',
      { id: `eq.${tripId}` },
      'id,start_date,end_date'
    );
    
    if (!trips || trips.length === 0) {
      throw new Error('Voyage non trouvé');
    }
    
    return trips[0];
  },

  // Créer une nouvelle destination
  async createDestination(data: DestinationFormData): Promise<Destination> {
    const result = await apiClient.post<Destination[]>('destinations', data);
    return result[0];
  },

  // Mettre à jour une destination existante
  async updateDestination(id: string, data: DestinationFormData): Promise<Destination> {
    await apiClient.patch('destinations', {
      city: data.city,
      start_date: data.start_date,
      end_date: data.end_date,
    }, { id: `eq.${id}` });
    
    return { ...data, id } as Destination;
  },

  // Supprimer une destination
  async deleteDestination(destinationId: string): Promise<void> {
    await apiClient.delete('destinations', { id: `eq.${destinationId}` });
  }
};
