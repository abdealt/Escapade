import { useState } from "react";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import { useActivities } from "../hooks/useActivities";
import { Activity } from "../services/activityService";
import { ActivityForm } from "./ActivitiesForm";

interface ActivitiesListProps {
  tripId: string;
}

export const ActivitiesList = ({ tripId }: ActivitiesListProps) => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editActivity, setEditActivity] = useState<Activity | null>(null);

  const {
    activities,
    destinations,
    isLoading,
    error,
    createOrUpdateActivity,
    deleteActivity,
    isSubmitting
  } = useActivities(tripId);

  // Gérer la modification d'une activité
  const handleEdit = (activity: Activity) => {
    if (activity.email !== user?.email) {
      alert("Vous ne pouvez modifier que vos propres activités.");
      return;
    }
    setEditActivity(activity);
    setShowForm(true);
  };

  // Gérer la suppression d'une activité
  const handleDelete = (activityId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette activité ?")) {
      deleteActivity(activityId);
    }
  };

  // Gérer la soumission du formulaire
  const handleFormSubmit = (payload: any) => {
    createOrUpdateActivity(payload, {
      onSuccess: () => {
        setShowForm(false);
        setEditActivity(null);
      },
      onError: (error) => {
        console.error("Erreur lors de l'enregistrement:", error);
      }
    });
  };

  // Formater les dates pour l'affichage
  const formatDateTime = (datetimeString: string) => {
    const date = new Date(datetimeString);
    return date.toLocaleString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      {/* Bouton pour ajouter une activité */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Activités prévues</h2>
        <button
          onClick={() => {
            setEditActivity(null);
            setShowForm(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          <FaPlus className="mr-2" /> Ajouter une activité
        </button>
      </div>

      {/* Formulaire (affiché conditionnellement) */}
      {showForm && (
        <div className="mb-8">
          <ActivityForm
            tripId={tripId}
            activity={editActivity}
            destinations={destinations || []}
            onClose={() => {
              setShowForm(false);
              setEditActivity(null);
            }}
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* Liste des activités */}
      {activities && activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className="bg-gray-700 p-4 rounded-lg hover:bg-gray-650 transition"
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="text-lg font-medium text-white">{activity.title}</h3>
                  <p className="text-gray-300 text-sm">{formatDateTime(activity.datetime)}</p>
                  <p className="text-gray-400 mt-2">{activity.description || "Aucune description"}</p>
                </div>
                <div className="flex space-x-2">
                  {activity.user_id === user?.id && (
                    <>
                      <button
                        onClick={() => handleEdit(activity)}
                        className="p-2 bg-blue-500 rounded-full hover:bg-blue-600 transition"
                        title="Modifier cette activité"
                      >
                        <FaEdit className="text-white" />
                      </button>
                      <button
                        onClick={() => handleDelete(activity.id)}
                        className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition"
                        title="Supprimer cette activité"
                      >
                        <FaTrash className="text-white" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-700 p-8 rounded-lg text-center">
          <p className="text-gray-400">Aucune activité n'a encore été ajoutée à ce voyage.</p>
          <button
            onClick={() => {
              setEditActivity(null);
              setShowForm(true);
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Ajouter votre première activité
          </button>
        </div>
      )}
    </div>
  );
};