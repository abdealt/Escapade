// src/features/sharedTrips/services/sharedTripsService.ts
import { apiClient } from '../../../lib/api-client';
import { Trip } from '../../trips/components/ShowTrips';

interface TripParticipation {
  trip_id: string;
}

export class SharedTripsService {
  static async fetchSharedTrips(userId: string): Promise<Trip[]> {
    // D'abord, récupérer les IDs des voyages partagés
    const participations = await apiClient.get<TripParticipation[]>(
      'trip_participants',
      { user_id: `eq.${userId}` },
      'trip_id'
    );
    
    if (!participations || participations.length === 0) {
      return []; // Aucun voyage partagé
    }
    
    // Extraire les IDs des voyages
    const tripIds = participations.map(p => p.trip_id);
    
    // Récupérer les détails de ces voyages
    const trips = await apiClient.get<Trip[]>(
      'trips',
      { 
        id: `in.(${tripIds.join(',')})`,
        order: 'created_at.desc'
      },
      '*'
    );
    
    return trips || [];
  }

  static async getUserParticipations(userId: string): Promise<TripParticipation[]> {
    return await apiClient.get<TripParticipation[]>(
      'trip_participants',
      { user_id: `eq.${userId}` },
      'trip_id'
    );
  }

  static async getSharedTripDetails(tripIds: string[]): Promise<Trip[]> {
    if (tripIds.length === 0) return [];
    
    return await apiClient.get<Trip[]>(
      'trips',
      { 
        id: `in.(${tripIds.join(',')})`,
        order: 'created_at.desc'
      },
      '*'
    );
  }
}