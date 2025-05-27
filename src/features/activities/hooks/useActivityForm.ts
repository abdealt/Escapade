import { useEffect, useState } from "react";
import { Activity, ActivityFormData, Destination } from "../services/activityService";

interface UseActivityFormProps {
  activity: Activity | null;
  destinations: Destination[];
  onSubmit: (data: ActivityFormData) => void;
  onClose: () => void;
}

export const useActivityForm = ({ 
  activity, 
  destinations, 
  onSubmit, 
  onClose 
}: UseActivityFormProps) => {
  const isEditMode = !!activity;

  // État du formulaire
  const [formData, setFormData] = useState<ActivityFormData>({
    destination_id: activity?.destination_id || "",
    title: activity?.title || "",
    description: activity?.description || "",
    datetime: activity?.datetime ? new Date(activity.datetime).toISOString().slice(0, 16) : ""
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Valider si les destinations sont disponibles
  useEffect(() => {
    // Si nous sommes en mode édition et qu'aucune destination n'est sélectionnée, 
    // mais que nous avons des destinations disponibles
    if (!formData.destination_id && destinations?.length > 0) {
      setFormData(prev => ({
        ...prev,
        destination_id: destinations[0].id
      }));
    }
  }, [destinations, formData.destination_id]);

  // Gestion des changements dans le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    
    if (!formData.destination_id) {
      errors.destination_id = "Veuillez sélectionner une destination.";
    }
    
    if (!formData.title.trim()) {
      errors.title = "Le titre est requis.";
    }
    
    if (!formData.datetime) {
      errors.datetime = "La date et l'heure sont requises.";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        destination_id: formData.destination_id,
        title: formData.title,
        description: formData.description,
        datetime: new Date(formData.datetime).toISOString()
      });
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