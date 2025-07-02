import { FaTimes } from "react-icons/fa";
import { useExpenseForm } from "../hooks/useExpenseForm";
import { Activity, ExpenseFormData } from "../services/expenseService";

interface ExpenseFormProps {
  tripId: string;
  expenseId?: string | null;
  activities: Activity[];
  onClose: () => void;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export const ExpenseForm = ({ 
  tripId,
  expenseId, 
  activities,
  onClose, 
  onSubmit,
  isSubmitting 
}: ExpenseFormProps) => {
  const {
    formData,
    formErrors,
    isEditMode,
    handleChange,
    handleSubmit,
    setSubmitError
  } = useExpenseForm({
    tripId,
    expenseId,
    activities,
    onSubmit: (data: ExpenseFormData) => {
      onSubmit({
        expenseId,
        data
      });
    },
    onClose
  });

  return (
    <div className="bg-gray-700 rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">
          {isEditMode ? "Modifier la dépense" : "Ajouter une dépense"}
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
          {/* Titre de la dépense */}
          <div>
            <label className="block text-gray-300 mb-2" htmlFor="title">
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
            <label className="block text-gray-300 mb-2" htmlFor="amount">
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
        </div>

        {/* Activité liée */}
        <div className="mb-4">
          <label className="block text-gray-300 mb-2" htmlFor="activity_id">
            Activité liée
          </label>
          <select
            id="activity_id"
            name="activity_id"
            value={formData.activity_id}
            onChange={handleChange}
            className={`w-full p-2 bg-gray-800 border rounded ${
              formErrors.activity_id ? "border-red-500" : "border-gray-600"
            }`}
            disabled={activities.length === 0}
          >
            {activities.length === 0 ? (
              <option value="">Aucune activité disponible</option>
            ) : (
              <>
                <option value="">Sélectionner une activité</option>
                {activities.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.title}
                  </option>
                ))}
              </>
            )}
          </select>
          {formErrors.activity_id && (
            <p className="text-red-500 text-sm mt-1">{formErrors.activity_id}</p>
          )}
          {activities.length === 0 && (
            <p className="text-yellow-500 text-sm mt-1">
              Ajoutez d'abord des activités à votre voyage.
            </p>
          )}
        </div>

        {/* Personne ayant payé */}
        <div className="mb-4">
          <label className="block text-gray-300 mb-2" htmlFor="user_paid_by">
            Payé par
          </label>
          <input
            type="text"
            id="user_paid_by"
            name="user_paid_by"
            value={formData.user_paid_by}
            readOnly
            className="w-full p-2 bg-gray-700 border rounded border-gray-600 cursor-not-allowed"
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
            disabled={isSubmitting || activities.length === 0}
            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
              (isSubmitting || activities.length === 0) ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Enregistrement..." : isEditMode ? "Mettre à jour" : "Ajouter"}
          </button>
        </div>
      </form>
    </div>
  );
};