// src/features/trips/services/tripsService.ts
import { apiClient } from '../../../lib/api-client';
import { Trip } from '../components/ShowTrips';

interface CreateTripData {
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
  created_email: string;
}

interface TripWithCreator extends Omit<Trip, 'start_date' | 'end_date' | 'created_at'> {
  start_date: string;
  end_date: string;
  created_at: string;
  created_email: string;
  creator: {
    display_name: string;
  };
}

interface Friend {
  id: string;
  display_name: string;
}

interface FriendRequest {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: string;
  requester?: { id: string; email: string; display_name: string };
  receiver?: { id: string; email: string; display_name: string };
}

export class TripsService {
  static async fetchTrips(userId: string, showAll: boolean = false): Promise<Trip[]> {
    const params: Record<string, string> = {
      created_by: `eq.${userId}`,
      order: 'end_date.asc'
    };

    if (!showAll) {
      const today = new Date().toISOString();
      params['start_date'] = `lte.${today}`;
    }

    return await apiClient.get<Trip[]>('trips', params, '*');
  }

  static async fetchTripDetails(tripId: string): Promise<TripWithCreator | null> {
    // Première requête pour obtenir les détails du voyage
    const [tripData] = await apiClient.get<TripWithCreator[]>(
      'trips',
      { id: `eq.${tripId}` },
      '*'
    );

    if (!tripData) return null;

    // Deuxième requête pour obtenir les informations du créateur
    const [userData] = await apiClient.get<{ display_name: string }[]>(
      'users',
      { id: `eq.${tripData.created_by}` },
      'display_name'
    );

    // Combiner les résultats
    return {
      ...tripData,
      creator: userData || { display_name: tripData.created_email }
    };
  }

  static async createTrip(trip: CreateTripData): Promise<void> {
    await apiClient.post('trips', trip);
  }

  static async updateTrip(tripId: string, updates: Partial<Trip>): Promise<Trip> {
    return await apiClient.patch<Trip>(
      'trips',
      updates,
      { id: `eq.${tripId}` },
      '*'
    );
  }

  static async deleteTrip(tripId: string): Promise<void> {
    await apiClient.delete('trips', { id: `eq.${tripId}` });
  }

  static async loadFriends(userId: string): Promise<Friend[]> {
    const friendRequests = await apiClient.get<FriendRequest[]>(
      'friend_requests',
      { 
        status: 'eq.accepted',
        or: `(requester_id.eq.${userId},receiver_id.eq.${userId})`
      },
      `*,
       requester:users!friend_requests_requester_id_fkey (id, display_name),
       receiver:users!friend_requests_receiver_id_fkey (id, display_name)`
    );

    // Transformer les demandes d'amis en liste d'amis
    return friendRequests.map((request: FriendRequest) => {
      const isSender = request.requester_id === userId;
      const friendData = isSender ? request.receiver : request.requester;
      return {
        id: isSender ? request.receiver_id : request.requester_id,
        display_name: friendData?.display_name || friendData?.email || "Ami sans nom",
      };
    });
  }

  static async shareTrip(tripId: string, userId: string): Promise<void> {
    // Vérifier si l'utilisateur est déjà participant
    const existingParticipants = await apiClient.get<{ id: string }[]>(
      'trip_participants',
      { 
        trip_id: `eq.${tripId}`,
        user_id: `eq.${userId}`
      },
      'id'
    );

    if (existingParticipants.length > 0) {
      throw new Error("Cette personne participe déjà à ce voyage.");
    }

    // Ajouter le nouveau participant
    await apiClient.post('trip_participants', {
      trip_id: tripId,
      user_id: userId
    });
  }
}