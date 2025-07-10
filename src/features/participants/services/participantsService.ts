// src/features/participants/services/participantsService.ts
import { apiClient } from '../../../lib/api-client';

export interface Participant {
  id: string;
  trip_id: string;
  user_id: string;
  joined_at: string;
  user: {
    display_name: string;
  };
}

export class ParticipantsService {
  static async fetchParticipants(tripId: string): Promise<Participant[]> {
    return await apiClient.get<Participant[]>(
      'trip_participants',
      { trip_id: `eq.${tripId}` },
      '*, user:users (display_name)'
    );
  }

  static async deleteParticipant(participantId: string): Promise<void> {
    await apiClient.delete('trip_participants', { id: `eq.${participantId}` });
  }

  static async addParticipant(tripId: string, userId: string): Promise<Participant> {
    return await apiClient.post<Participant>(
      'trip_participants',
      { trip_id: tripId, user_id: userId },
      '*, user:users (display_name)'
    );
  }

  static async updateParticipant(participantId: string, updates: Partial<Participant>): Promise<Participant> {
    return await apiClient.patch<Participant>(
      'trip_participants',
      updates,
      { id: `eq.${participantId}` },
      '*, user:users (display_name)'
    );
  }
}