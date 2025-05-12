import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "../supabase-client";

interface ExpenseFormProps {
  tripId: string;
  expenseId?: string | null;
  onComplete: () => void;
}

interface Expense {
  id?: string;
  trip_id: string;
  title: string;
  amount: number;
  paid_by?: string;
  user_paid_by: string;
  date: string;
}

export const ExpenseForm = ({ tripId, expenseId, onComplete }: ExpenseFormProps) => {
  const queryClient = useQueryClient();

  // État initial du formulaire
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    user_paid_by: "",
    date: new Date().toISOString().slice(0, 10)
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Récupération des détails de la dépense pour l'édition
  const { data: existingExpense } = useQuery<Expense | null>({
    queryKey: ["expense", expenseId],
    queryFn: async () => {
      if (!expenseId) return null;
      
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("id", expenseId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!expenseId
  });

  // Pré-remplir le formulaire en mode édition
  useEffect(() => {
    if (existingExpense) {
      setFormData({
        title: existingExpense.title,
        amount: existingExpense.amount.toString(),
        user_paid_by: existingExpense.user_paid_by,
        date: new Date(existingExpense.date).toISOString().slice(0, 10)
      });
    }
  }, [existingExpense]);

  // Gestion des changements dans le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Effacer l'erreur si l'utilisateur commence à corriger
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      errors.title = "Le titre est requis.";
    }
    
    if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      errors.amount = "Veuillez entrer un montant valide.";
    }
    
    if (!formData.user_paid_by.trim()) {
      errors.user_paid_by = "Le nom de la personne ayant payé est requis.";
    }
    
    if (!formData.date) {
      errors.date = "La date est requise.";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Mutation pour ajouter/modifier une dépense
  const expenseMutation = useMutation({
    mutationFn: async (data: Expense) => {
      if (expenseId) {
        // Mise à jour d'une dépense existante
        const { error } = await supabase
          .from("expenses")
          .update(data)
          .eq("id", expenseId);
        
        if (error) throw error;
        return data;
      } else {
        // Création d'une nouvelle dépense
        const { data: newExpense, error } = await supabase
          .from("expenses")
          .insert([data])
          .select();
        
        if (error) throw error;
        return newExpense?.[0];
      }
    },
    onSuccess: () => {
      onComplete();
      // Invalider le cache pour recharger la liste des dépenses
      queryClient.invalidateQueries({ queryKey: ["expenses", tripId] });
    },
    onError: (error) => {
      console.error("Erreur lors de l'enregistrement:", error);
      setFormErrors(prev => ({
        ...prev,
        submit: "Une erreur est survenue lors de l'enregistrement."
      }));
      setIsSubmitting(false);
    }
  });

  // Soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      const expenseData: Expense = {
        trip_id: tripId,
        title: formData.title.trim(),
        amount: parseFloat(formData.amount),
        user_paid_by: formData.user_paid_by.trim(),
        date: new Date(formData.date).toISOString()
      };
      
      expenseMutation.mutate(expenseData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Titre de la dépense */}
      <div>
        <label htmlFor="title" className="block text-gray-300 mb-2">
          Titre de la dépense
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Ex: Restaurant, Hébergement, Transport"
          className={`w-full p-2 bg-gray-800 border rounded ${
            formErrors.title ? "border-red-500" : "border-gray-600"
          }`}
        />
        {formErrors.title && (
          <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
        )}
      </div>

      {/* Montant */}
      <div>
        <label htmlFor="amount" className="block text-gray-300 mb-2">
          Montant
        </label>
        <input
          type="number"
          id="amount"
          name="amount"
          step="0.01"
          value={formData.amount}
          onChange={handleChange}
          placeholder="Montant de la dépense"
          className={`w-full p-2 bg-gray-800 border rounded ${
            formErrors.amount ? "border-red-500" : "border-gray-600"
          }`}
        />
        {formErrors.amount && (
          <p className="text-red-500 text-sm mt-1">{formErrors.amount}</p>
        )}
      </div>

      {/* Personne ayant payé */}
      <div>
        <label htmlFor="user_paid_by" className="block text-gray-300 mb-2">
          Payé par
        </label>
        <input
          type="text"
          id="user_paid_by"
          name="user_paid_by"
          value={formData.user_paid_by}
          onChange={handleChange}
          placeholder="Nom de la personne ayant payé"
          className={`w-full p-2 bg-gray-800 border rounded ${
            formErrors.user_paid_by ? "border-red-500" : "border-gray-600"
          }`}
        />
        {formErrors.user_paid_by && (
          <p className="text-red-500 text-sm mt-1">{formErrors.user_paid_by}</p>
        )}
      </div>

      {/* Date */}
      <div>
        <label htmlFor="date" className="block text-gray-300 mb-2">
          Date de la dépense
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className={`w-full p-2 bg-gray-800 border rounded ${
            formErrors.date ? "border-red-500" : "border-gray-600"
          }`}
        />
        {formErrors.date && (
          <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>
        )}
      </div>

      {/* Message d'erreur général */}
      {formErrors.submit && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{formErrors.submit}</span>
        </div>
      )}

      {/* Boutons d'action */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onComplete}
          className="px-4 py-2 border border-gray-500 text-gray-300 rounded hover:bg-gray-600"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? "Enregistrement..." : expenseId ? "Mettre à jour" : "Ajouter"}
        </button>
      </div>
    </form>
  );
};