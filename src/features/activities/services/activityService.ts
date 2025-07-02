import { apiClient } from "../../../lib/api-client";

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
  start_date: string;
  end_date: string;
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
    // D'abord récupérer les destinations du voyage
    const destinations = await apiClient.get<Destination[]>(
      'destinations',
      { trip_id: `eq.${tripId}` },
      'id'
    );

    if (!destinations || destinations.length === 0) {
      return [];
    }

    // Récupérer les activités liées à ces destinations
    const destinationIds = destinations.map(dest => dest.id).join(',');
    const activities = await apiClient.get<Activity[]>(
      'activities',
      { 
        destination_id: `in.(${destinationIds})`,
        order: 'datetime.asc'
      }
    );

    return activities || [];
  },

  // Récupérer les destinations d'un voyage
  async fetchDestinations(tripId: string): Promise<Destination[]> {
    const destinations = await apiClient.get<Destination[]>(
      'destinations',
      { 
        trip_id: `eq.${tripId}`,
        order: 'city.asc'
      }
    );

    return destinations || [];
  },

  // Créer une nouvelle activité
  async createActivity(data: ActivityFormData): Promise<Activity> {
    const result = await apiClient.post<Activity[]>('activities', data);
    return result[0];
  },

  // Mettre à jour une activité existante
  async updateActivity(id: string, data: ActivityFormData): Promise<Activity> {
    await apiClient.patch('activities', data, { id: `eq.${id}` });
    return { ...data, id } as Activity;
  },

  // Supprimer une activité
  async deleteActivity(activityId: string): Promise<void> {
    await apiClient.delete('activities', { id: `eq.${activityId}` });
  }
};
