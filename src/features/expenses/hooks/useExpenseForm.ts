import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../supabase-client";
import { Activity, Expense, ExpenseFormData } from "../services/expenseService";

interface UseExpenseFormProps {
  tripId: string;
  expenseId?: string | null;
  activities: Activity[];
  onSubmit: (data: ExpenseFormData) => void;
  onClose: () => void;
}

export const useExpenseForm = ({ 
  tripId,
  expenseId, 
  activities, 
  onSubmit, 
  onClose 
}: UseExpenseFormProps) => {
  const { user } = useAuth();
  const isEditMode = !!expenseId;

  // État du formulaire
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    user_paid_by: "",
    date: new Date().toISOString().slice(0, 10),
    activity_id: ""
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

  // Récupérer le display_name de l'utilisateur
  const { data: userData } = useQuery({
    queryKey: ["user-display-name", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("users")
        .select("display_name")
        .eq("id", user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Pré-remplir le formulaire en mode édition
  useEffect(() => {
    if (existingExpense) {
      setFormData({
        title: existingExpense.title,
        amount: existingExpense.amount.toString(),
        user_paid_by: existingExpense.user_paid_by,
        date: new Date(existingExpense.date).toISOString().slice(0, 10),
        activity_id: existingExpense.activity_id?.toString() || ""
      });
    }
  }, [existingExpense]);

  // Mettre à jour user_paid_by avec le display_name
  useEffect(() => {
    if (userData?.display_name && !existingExpense) {
      setFormData(prev => ({
        ...prev,
        user_paid_by: userData.display_name
      }));
    }
  }, [userData, existingExpense]);

  // Gestion des changements dans le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Si c'est le champ activity_id qui change
    if (name === 'activity_id') {
      const selectedActivity = activities?.find(activity => activity.id.toString() === value);
      if (selectedActivity) {
        setFormData(prev => ({ 
          ...prev, 
          [name]: value,
          date: new Date(selectedActivity.datetime).toISOString().slice(0, 10)
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
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
    
    if (!formData.activity_id) {
      errors.activity_id = "L'activité est requise.";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const expenseData: ExpenseFormData = {
        trip_id: tripId,
        title: formData.title.trim(),
        amount: parseFloat(formData.amount),
        user_paid_by: formData.user_paid_by.trim(),
        date: new Date(formData.date).toISOString(),
        activity_id: parseInt(formData.activity_id)
      };
      
      onSubmit(expenseData);
    }
  };

  // Gestion des erreurs de soumission
  const setSubmitError = (error: string) => {
    setFormErrors(prev => ({
      ...prev,
      submit: error
    }));
  };

  return {
    formData,
    formErrors,
    isEditMode,
    handleChange,
    handleSubmit,
    setSubmitError,
    onClose
  };
};