import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { supabase } from "../supabase-client";
import { ExpenseForm } from "./CreateExpensesForm";

interface ExpensesListProps {
  tripId: string;
}

interface Expense {
  id: string;
  trip_id: string;
  title: string;
  amount: number;
  paid_by: string;
  user_paid_by: string;
  date: string;
}

export const ExpensesList = ({ tripId }: ExpensesListProps) => {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  // Récupération des dépenses
  const { data: expenses, isLoading, error } = useQuery<Expense[], Error>({
    queryKey: ["expenses", tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("trip_id", tripId)
        .order("date", { ascending: false });
        
      if (error) throw error;
      return data as Expense[];
    }
  });

  // Suppression d'une dépense
  const handleDelete = async (expenseId: string) => {
    try {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", expenseId);
        
      if (error) throw error;
      
      // Invalider le cache pour recharger la liste
      queryClient.invalidateQueries({ queryKey: ["expenses", tripId] });
      
      setShowDeleteModal(null);
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
    }
  };

  // Formatage des dates pour l'affichage
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
      {/* En-tête avec titre et bouton d'ajout */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Dépenses</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FaPlus className="mr-2" /> Ajouter une dépense
        </button>
      </div>

      {/* Liste des dépenses */}
      {expenses && expenses.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
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
                      onClick={() => setEditingExpenseId(expense.id)}
                      className="text-blue-400 hover:text-blue-300 mr-3"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(expense.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-750 rounded-lg">
          <p className="text-gray-400">Aucune dépense pour ce voyage.</p>
          <p className="text-gray-500 text-sm mt-2">Ajoutez votre première dépense avec le bouton ci-dessus.</p>
        </div>
      )}

      {/* Total des dépenses */}
      {expenses && expenses.length > 0 && (
        <div className="mt-6 p-4 bg-gray-700 rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-white">Total des dépenses</h3>
            <span className="text-xl font-bold text-green-400">
              {formatAmount(expenses.reduce((sum, expense) => sum + expense.amount, 0))}
            </span>
          </div>
        </div>
      )}

      {/* Modal d'ajout */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Ajouter une dépense</h3>
            <ExpenseForm 
              tripId={tripId} 
              onComplete={() => {
                setShowAddModal(false);
                queryClient.invalidateQueries({ queryKey: ["expenses", tripId] });
              }} 
            />
            <button 
              onClick={() => setShowAddModal(false)} 
              className="mt-4 px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {editingExpenseId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Modifier une dépense</h3>
            <ExpenseForm 
              tripId={tripId} 
              expenseId={editingExpenseId}
              onComplete={() => {
                setEditingExpenseId(null);
                queryClient.invalidateQueries({ queryKey: ["expenses", tripId] });
              }} 
            />
            <button 
              onClick={() => setEditingExpenseId(null)} 
              className="mt-4 px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
            >
              Annuler
            </button>
          </div>
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