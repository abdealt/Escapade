
// src/features/expenses/services/expenseService.ts
import { apiClient } from "../../../lib/api-client";

export interface Expense {
  id: string;
  trip_id: string;
  title: string;
  amount: number;
  paid_by?: string;
  user_paid_by: string;
  date: string;
  activity_id: number;
  activities?: {
    title: string;
  };
}

export interface Activity {
  id: number;
  title: string;
  datetime: string;
}

export interface ExpenseFormData {
  trip_id: string;
  title: string;
  amount: number;
  user_paid_by: string;
  date: string;
  activity_id: number;
}

export const expenseService = {
  // Récupérer les dépenses d'un voyage
  async fetchExpenses(tripId: string): Promise<Expense[]> {
    const expenses = await apiClient.get<Expense[]>(
      'expenses',
      { 
        trip_id: `eq.${tripId}`,
        order: 'date.desc'
      },
      '*,activities(title)'
    );
      
    return expenses || [];
  },

  // Récupérer les activités d'un voyage pour les dépenses
  async fetchActivities(tripId: string): Promise<Activity[]> {
    // D'abord, récupérer les destinations du voyage
    const destinations = await apiClient.get<{id: string}[]>(
      'destinations',
      { trip_id: `eq.${tripId}` },
      'id'
    );

    if (!destinations?.length) {
      return [];
    }

    // Ensuite, récupérer toutes les activités des destinations
    const destinationIds = destinations.map(dest => dest.id).join(',');
    const activities = await apiClient.get<Activity[]>(
      'activities',
      { 
        destination_id: `in.(${destinationIds})`,
        order: 'datetime.asc'
      },
      'id,title,datetime'
    );
      
    return activities || [];
  },

  // Récupérer une dépense spécifique
  async fetchExpense(expenseId: string): Promise<Expense> {
    const expenses = await apiClient.get<Expense[]>(
      'expenses',
      { id: `eq.${expenseId}` }
    );
    
    if (!expenses || expenses.length === 0) {
      throw new Error('Dépense non trouvée');
    }
    
    return expenses[0];
  },

  // Créer une nouvelle dépense
  async createExpense(data: ExpenseFormData): Promise<Expense> {
    const result = await apiClient.post<Expense[]>('expenses', data);
    return result[0];
  },

  // Mettre à jour une dépense existante
  async updateExpense(id: string, data: ExpenseFormData): Promise<Expense> {
    await apiClient.patch('expenses', data, { id: `eq.${id}` });
    return { ...data, id } as Expense;
  },

  // Supprimer une dépense
  async deleteExpense(expenseId: string): Promise<void> {
    await apiClient.delete('expenses', { id: `eq.${expenseId}` });
  }
};
