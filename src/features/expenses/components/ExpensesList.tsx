import { useState } from "react";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { useExpenses } from "../hooks/useExpenses";
import { Expense } from "../services/expenseService";
import { ExpenseForm } from "./ExpenseForm";

interface ExpensesListProps {
  tripId: string;
}

export const ExpensesList = ({ tripId }: ExpensesListProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editExpenseId, setEditExpenseId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  const {
    expenses,
    activities,
    isLoading,
    error,
    createOrUpdateExpense,
    deleteExpense,
    isSubmitting
  } = useExpenses(tripId);

  // Gérer la modification d'une dépense
  const handleEdit = (expense: Expense) => {
    setEditExpenseId(expense.id);
    setShowForm(true);
  };

  // Gérer la suppression d'une dépense
  const handleDelete = (expenseId: string) => {
    deleteExpense(expenseId);
    setShowDeleteModal(null);
  };

  // Gérer la soumission du formulaire
  const handleFormSubmit = (payload: any) => {
    createOrUpdateExpense(payload, {
      onSuccess: () => {
        setShowForm(false);
        setEditExpenseId(null);
      },
      onError: (error) => {
        console.error("Erreur lors de l'enregistrement:", error);
      }
    });
  };

  // Formatage des dates pour l'affichage
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Formatage des montants
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Erreur: </strong>
        <span className="block sm:inline">{error.message}</span>
      </div>
    );
  }

  return (
    <div>
      {/* Bouton pour ajouter une dépense */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Dépenses</h2>
        <button
          onClick={() => {
            setEditExpenseId(null);
            setShowForm(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          <FaPlus className="mr-2" /> Ajouter une dépense
        </button>
      </div>

      {/* Formulaire (affiché conditionnellement) */}
      {showForm && (
        <div className="mb-8">
          <ExpenseForm
            tripId={tripId}
            expenseId={editExpenseId}
            activities={activities || []}
            onClose={() => {
              setShowForm(false);
              setEditExpenseId(null);
            }}
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* Liste des dépenses */}
      {expenses && expenses.length > 0 ? (
        <>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Activité
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Titre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Montant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Payé par
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {expense.activities?.title || "Non spécifiée"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {expense.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatAmount(expense.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {expense.user_paid_by}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="p-2 bg-blue-500 rounded-full hover:bg-blue-600 transition mr-2"
                        title="Modifier cette dépense"
                      >
                        <FaEdit className="text-white" />
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(expense.id)}
                        className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition"
                        title="Supprimer cette dépense"
                      >
                        <FaTrash className="text-white" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total des dépenses */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">Total des dépenses</h3>
              <span className="text-xl font-bold text-green-400">
                {formatAmount(expenses.reduce((sum, expense) => sum + expense.amount, 0))}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-gray-700 p-8 rounded-lg text-center">
          <p className="text-gray-400">Aucune dépense n'a encore été ajoutée à ce voyage.</p>
          <button
            onClick={() => {
              setEditExpenseId(null);
              setShowForm(true);
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Ajouter votre première dépense
          </button>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirmer la suppression</h3>
            <p className="mb-6">Êtes-vous sûr de vouloir supprimer cette dépense ? Cette action est irréversible.</p>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => setShowDeleteModal(null)} 
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
              >
                Annuler
              </button>
              <button 
                onClick={() => showDeleteModal && handleDelete(showDeleteModal)} 
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};