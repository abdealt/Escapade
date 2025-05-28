import { useEffect, useState } from "react";
import { Destination, DestinationFormData, Trip } from "../services/destinationService";

interface UseDestinationFormProps {
  destination: Destination | null;
  trip: Trip | null;
  onSubmit: (data: DestinationFormData) => void;
  onClose: () => void;
}

export const useDestinationForm = ({ 
  destination, 
  trip, 
  onSubmit, 
  onClose 
}: UseDestinationFormProps) => {
  const isEditMode = !!destination;

  // État du formulaire
  const [formData, setFormData] = useState<{
    city: string;
    startDate: string;
    endDate: string;
  }>({
    city: destination?.city || "",
    startDate: destination?.start_date 
      ? new Date(destination.start_date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    endDate: destination?.end_date 
      ? new Date(destination.end_date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Contraintes de date basées sur le voyage
  const [minDate, setMinDate] = useState<string>("");
  const [maxDate, setMaxDate] = useState<string>("");

  // Mise à jour des contraintes de date quand on récupère le voyage
  useEffect(() => {
    if (trip) {
      const tripStartDate = new Date(trip.start_date).toISOString().split('T')[0];
      const tripEndDate = new Date(trip.end_date).toISOString().split('T')[0];
      
      setMinDate(tripStartDate);
      setMaxDate(tripEndDate);
      
      // Si les dates actuelles sont hors de l'intervalle, les ajuster
      if (new Date(formData.startDate) < new Date(tripStartDate)) {
        setFormData(prev => ({ ...prev, startDate: tripStartDate }));
      }
      
      if (new Date(formData.endDate) > new Date(tripEndDate)) {
        setFormData(prev => ({ ...prev, endDate: tripEndDate }));
      }
    }
  }, [trip, formData.startDate, formData.endDate]);

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
    
    if (!formData.city.trim()) {
      errors.city = "La ville est requise.";
    }
    
    if (!formData.startDate) {
      errors.startDate = "La date de début est requise.";
    }
    
    if (!formData.endDate) {
      errors.endDate = "La date de fin est requise.";
    }

    if (trip && formData.startDate && formData.endDate) {
      const startTimestamp = new Date(formData.startDate).getTime();
      const endTimestamp = new Date(formData.endDate).getTime();
      const tripStartTimestamp = new Date(trip.start_date).getTime();
      const tripEndTimestamp = new Date(trip.end_date).getTime();
      
      if (startTimestamp < tripStartTimestamp) {
        errors.startDate = `La date de début doit être après le début du voyage (${new Date(trip.start_date).toLocaleDateString()})`;
      }
      
      if (endTimestamp > tripEndTimestamp) {
        errors.endDate = `La date de fin doit être avant la fin du voyage (${new Date(trip.end_date).toLocaleDateString()})`;
      }
      
      if (startTimestamp > endTimestamp) {
        errors.endDate = "La date de fin doit être après la date de début";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm() && trip) {
      // Conversion des dates en timestamps (ISO string)
      const startTimestamp = new Date(formData.startDate).toISOString();
      const endTimestamp = new Date(formData.endDate).toISOString();
      
      onSubmit({
        city: formData.city,
        start_date: startTimestamp,
        end_date: endTimestamp,
        trip_id: trip.id
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
    minDate,
    maxDate,
    handleChange,
    handleSubmit,
    setSubmitError,
    onClose
  };
};