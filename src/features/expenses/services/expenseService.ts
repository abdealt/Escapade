import { supabase } from "../../../supabase-client";

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
    const { data, error } = await supabase
      .from("expenses")
      .select(`
        *,
        activities (
          title
        )
      `)
      .eq("trip_id", tripId)
      .order("date", { ascending: false });
      
    if (error) {
      throw new Error(error.message);
    }
    
    return data || [];
  },

  // Récupérer les activités d'un voyage pour les dépenses
  async fetchActivities(tripId: string): Promise<Activity[]> {
    // D'abord, récupérer les destinations du voyage
    const { data: destinations, error: destError } = await supabase
      .from("destinations")
      .select("id")
      .eq("trip_id", tripId);

    if (destError) {
      throw new Error(destError.message);
    }

    if (!destinations?.length) {
      return [];
    }

    // Ensuite, récupérer toutes les activités des destinations
    const destinationIds = destinations.map(dest => dest.id);
    const { data, error } = await supabase
      .from("activities")
      .select("id, title, datetime")
      .in("destination_id", destinationIds)
      .order("datetime", { ascending: true });
      
    if (error) {
      throw new Error(error.message);
    }
    
    return data || [];
  },

  // Récupérer une dépense spécifique
  async fetchExpense(expenseId: string): Promise<Expense> {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("id", expenseId)
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  },

  // Créer une nouvelle dépense
  async createExpense(data: ExpenseFormData): Promise<Expense> {
    const { data: newExpense, error } = await supabase
      .from("expenses")
      .insert([data])
      .select();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return newExpense?.[0];
  },

  // Mettre à jour une dépense existante
  async updateExpense(id: string, data: ExpenseFormData): Promise<Expense> {
    const { error } = await supabase
      .from("expenses")
      .update(data)
      .eq("id", id);
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { ...data, id };
  },

  // Supprimer une dépense
  async deleteExpense(expenseId: string): Promise<void> {
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", expenseId);
    
    if (error) {
      throw new Error(error.message);
    }
  }
};