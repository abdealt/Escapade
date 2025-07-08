import { FaTimes } from "react-icons/fa";
import { useActivityForm } from "../hooks/useActivityForm";
import { Activity, Destination } from "../services/activityService";

interface ActivityFormProps {
  tripId: string;
  activity: Activity | null;
  destinations: Destination[];
  onClose: () => void;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export const ActivityForm = ({ 
  // tripId, // Commenté car non utilisé
  activity, 
  destinations, 
  onClose, 
  onSubmit,
  isSubmitting 
}: ActivityFormProps) => {
  const {
    formData,
    formErrors,
    isEditMode,
    handleChange,
    handleSubmit,
    // setSubmitError // Commenté car non utilisé
  } = useActivityForm({
    activity,
    destinations,
    onSubmit: (data) => {
      onSubmit({
        activityId: activity?.id,
        data
      });
    },
    onClose
  });

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
                      {dest.city}
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