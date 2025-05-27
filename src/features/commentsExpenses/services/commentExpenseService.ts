import { supabase } from "../../../supabase-client";

export interface CommentExpense {
  id: number;
  user_id: string;
  content: string;
  expense_id: number;
  created_at: string;
  user_comment: string;
}

export interface Expense {
  id: number;
  title: string;
}

export interface CommentExpenseFormData {
  content: string;
  expense_id: number;
  user_comment: string;
}

export const commentExpenseService = {
  // Récupérer les dépenses disponibles
  async fetchExpenses(tripId: string): Promise<Expense[]> {
    const { data, error } = await supabase
      .from("expenses")
      .select("id, title")
      .eq("trip_id", tripId)
      .order("date", { ascending: true });
      
    if (error) {
      throw new Error(error.message);
    }
    
    return data || [];
  },

  // Récupérer les commentaires d'une dépense
  async fetchComments(expenseId: number): Promise<CommentExpense[]> {
    const { data, error } = await supabase
      .from("comments_expenses")
      .select("*")
      .eq("expense_id", expenseId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data as CommentExpense[];
  },

  // Créer un nouveau commentaire
  async createComment(data: CommentExpenseFormData): Promise<CommentExpense> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    const { data: newComment, error } = await supabase
      .from("comments_expenses")
      .insert([
        { 
          ...data,
          user_id: userId
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return newComment;
  },

  // Mettre à jour un commentaire existant
  async updateComment(id: number, data: Partial<CommentExpenseFormData>): Promise<CommentExpense> {
    const { data: updatedComment, error } = await supabase
      .from("comments_expenses")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return updatedComment;
  },

  // Supprimer un commentaire
  async deleteComment(commentId: number): Promise<void> {
    const { error } = await supabase
      .from("comments_expenses")
      .delete()
      .eq("id", commentId);
    
    if (error) {
      throw new Error(error.message);
    }
  },

  // Récupérer le profil utilisateur
  async fetchUserProfile(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // D'abord, vérifions le display_name dans la table users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('display_name')
        .eq('id', user.id)
        .single();

      if (!userError && userData?.display_name) {
        return userData.display_name;
      }

      // Si pas de display_name, on utilise le nom du provider
      if (user.user_metadata && user.user_metadata.full_name) {
        return user.user_metadata.full_name;
      }

      // En dernier recours, on vérifie dans la table profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error("Erreur lors de la récupération du profil:", error);
        return user.email || "Utilisateur";
      }
      
      return data?.full_name || user.email || "Utilisateur";
    }
    
    return "Utilisateur";
  }
};