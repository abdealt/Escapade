import { FaTimes } from "react-icons/fa";
import { useDestinationForm } from "../hooks/useDestinationForm";
import { Destination, Trip } from "../services/destinationService";

interface DestinationFormProps {
  tripId: string;
  destination: Destination | null;
  trip: Trip | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export const DestinationForm = ({ 
  // tripId, // Commenté car non utilisé
  destination, 
  trip, 
  onClose, 
  onSubmit,
  isSubmitting 
}: DestinationFormProps) => {
  const {
    formData,
    formErrors,
    isEditMode,
    minDate,
    maxDate,
    handleChange,
    handleSubmit,
    // setSubmitError // Commenté car non utilisé
  } = useDestinationForm({
    destination,
    trip,
    onSubmit: (data) => {
      onSubmit({
        destinationId: destination?.id,
        data
      });
    },
    onClose
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (!trip) {
    return (
      <div className="text-center py-4 text-gray-400">
        Chargement des informations du voyage...
      </div>
    );
  }

  return (
    <div className="bg-gray-700 rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">
          {isEditMode ? "Modifier la destination" : "Ajouter une destination"}
        </h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white transition"
        >
          <FaTimes />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
          {/* Ville */}
          <div>
            <label className="block text-gray-300 mb-2" htmlFor="city">
              Ville
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Paris, New York, Tokyo..."
              className={`w-full p-2 bg-gray-800 border rounded ${
                formErrors.city ? "border-red-500" : "border-gray-600"
              }`}
            />
            {formErrors.city && (
              <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Date de début */}
          <div>
            <label className="block text-gray-300 mb-2" htmlFor="startDate">
              Date de début
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              min={minDate}
              max={maxDate}
              onChange={handleChange}
              className={`w-full p-2 bg-gray-800 border rounded ${
                formErrors.startDate ? "border-red-500" : "border-gray-600"
              }`}
            />
            {formErrors.startDate && (
              <p className="text-red-500 text-sm mt-1">{formErrors.startDate}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Entre {formatDate(trip.start_date)} et {formatDate(trip.end_date)}
            </p>
          </div>

          {/* Date de fin */}
          <div>
            <label className="block text-gray-300 mb-2" htmlFor="endDate">
              Date de fin
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              min={formData.startDate} // La date de fin doit être après la date de début
              max={maxDate}
              onChange={handleChange}
              className={`w-full p-2 bg-gray-800 border rounded ${
                formErrors.endDate ? "border-red-500" : "border-gray-600"
              }`}
            />
            {formErrors.endDate && (
              <p className="text-red-500 text-sm mt-1">{formErrors.endDate}</p>
            )}
          </div>
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
            disabled={isSubmitting}
            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Enregistrement..." : isEditMode ? "Mettre à jour" : "Ajouter"}
          </button>
        </div>
      </form>
    </div>
  );
};