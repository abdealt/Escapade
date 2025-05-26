import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { supabase } from "../../../supabase-client";

interface Destination {
  id: string;
  city: string; // Changé de 'name' à 'city' pour correspondre à votre schéma
  start_date?: string;
  end_date?: string;
  // autres propriétés si nécessaire
}

interface Activity {
  id: string;
  destination_id: string;
  title: string;
  description: string;
  datetime: string;
}

interface ActivityFormProps {
  tripId: string;
  activity: Activity | null; // Pour mode édition
  destinations: Destination[];
  onClose: () => void;
}

export const ActivityForm = ({ tripId, activity, destinations, onClose }: ActivityFormProps) => {
  const queryClient = useQueryClient();
  const isEditMode = !!activity;

  // État du formulaire
  const [formData, setFormData] = useState({
    destination_id: activity?.destination_id || "",
    title: activity?.title || "",
    description: activity?.description || "",
    datetime: activity?.datetime ? new Date(activity.datetime).toISOString().slice(0, 16) : ""
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  }, [destinations]);

  // Mutation pour ajouter/modifier une activité
  const activityMutation = useMutation({
    mutationFn: async (data: Omit<Activity, "id">) => {
      if (isEditMode && activity) {
        // Mise à jour d'une activité existante
        const { error } = await supabase
          .from("activities")
          .update(data)
          .eq("id", activity.id);
        
        if (error) throw new Error(error.message);
        return { ...data, id: activity.id };
      } else {
        // Création d'une nouvelle activité
        const { data: newActivity, error } = await supabase
          .from("activities")
          .insert([data])
          .select();
        
        if (error) throw new Error(error.message);
        return newActivity?.[0];
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities", tripId] });
      onClose();
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
      setIsSubmitting(true);
      activityMutation.mutate({
        destination_id: formData.destination_id,
        title: formData.title,
        description: formData.description,
        datetime: new Date(formData.datetime).toISOString()
      });
    }
  };

  return (
    <div className="bg-gray-700 rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">
          {isEditMode ? "Modifier l'activité" : "Ajouter une activité"}
        </h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white transition"
        >
          <FaTimes />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Sélection de la destination */}
          <div>
            <label className="block text-gray-300 mb-2" htmlFor="destination_id">
              Destination
            </label>
            <select
              id="destination_id"
              name="destination_id"
              value={formData.destination_id}
              onChange={handleChange}
              className={`w-full p-2 bg-gray-800 border rounded ${
                formErrors.destination_id ? "border-red-500" : "border-gray-600"
              }`}
              disabled={destinations.length === 0}
            >
              {destinations.length === 0 ? (
                <option value="">Aucune destination disponible</option>
              ) : (
                <>
                  <option value="">Sélectionnez une destination</option>
                  {destinations.map(dest => (
                    <option key={dest.id} value={dest.id}>
                      {dest.city} {/* Utiliser la propriété city au lieu de name */}
                    </option>
                  ))}
                </>
              )}
            </select>
            {formErrors.destination_id && (
              <p className="text-red-500 text-sm mt-1">{formErrors.destination_id}</p>
            )}
            {destinations.length === 0 && (
              <p className="text-yellow-500 text-sm mt-1">
                Ajoutez d'abord une destination à votre voyage.
              </p>
            )}
          </div>

          {/* Date et heure */}
          <div>
            <label className="block text-gray-300 mb-2" htmlFor="datetime">
              Date et heure
            </label>
            <input
              type="datetime-local"
              id="datetime"
              name="datetime"
              value={formData.datetime}
              onChange={handleChange}
              className={`w-full p-2 bg-gray-800 border rounded ${
                formErrors.datetime ? "border-red-500" : "border-gray-600"
              }`}
            />
            {formErrors.datetime && (
              <p className="text-red-500 text-sm mt-1">{formErrors.datetime}</p>
            )}
          </div>
        </div>

        {/* Titre */}
        <div className="mb-4">
          <label className="block text-gray-300 mb-2" htmlFor="title">
            Titre de l'activité
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Visite du musée, Restaurant, etc."
            className={`w-full p-2 bg-gray-800 border rounded ${
              formErrors.title ? "border-red-500" : "border-gray-600"
            }`}
          />
          {formErrors.title && (
            <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
          )}
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-gray-300 mb-2" htmlFor="description">
            Description (optionnelle)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Informations supplémentaires sur cette activité..."
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
          />
        </div>

        {/* Message d'erreur général */}
        {formErrors.submit && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{formErrors.submit}</span>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-500 text-gray-300 rounded hover:bg-gray-600"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting || destinations.length === 0}
            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
              (isSubmitting || destinations.length === 0) ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Enregistrement..." : isEditMode ? "Mettre à jour" : "Ajouter"}
          </button>
        </div>
      </form>
    </div>
  );
};