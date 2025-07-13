import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from "react";
import { BsCalendarEvent, BsCurrencyEuro } from "react-icons/bs";
import { FaChevronDown, FaChevronUp, FaEye, FaPlane, FaPlus } from "react-icons/fa";
import { MdLocationOn, MdTrendingUp } from "react-icons/md";
import { Link } from "react-router";
import { SharedTrips } from "../features/sharedTrips/components/SharedTrips";
//import { useSharedTrips } from "../features/sharedTrips/hooks/useSharedTrips";
import { ShowTrips } from "../features/trips/components/ShowTrips";
import { CreateTrip } from "../features/trips/components/TripForm";
import { useCurrentUser } from "../features/trips/hooks/useTrips";
import { apiClient } from "../lib/api-client";

interface TripStats {
  totalTrips: number;
  upcomingTrips: number;
  totalDestinations: number;
  totalExpenses: number;
}

interface UpcomingTrip {
  id: string;
  name: string;
  start_date: string;
  city: string;
  participants: number;
}

interface TripWithDestinations {
  id: string;
  name: string;
  start_date: string;
}

interface Destination {
  city: string;
  trip_id: string;
}

interface Expense {
  amount: number;
  trip_id: string;
}

interface TripParticipant {
  trip_id: string;
}

export const Home = () => {
  const [showTripModal, setShowTripModal] = useState(false);
  const [collapseMine, setCollapseMine] = useState(false);
  const [collapseShared, setCollapseShared] = useState(false);
  const queryClient = useQueryClient();

  const { userId } = useCurrentUser();
  //const { data: sharedTripsData } = useSharedTrips(userId);

  const openModal = () => setShowTripModal(true);
  
  const handleTripCreated = () => {
    setShowTripModal(false);
    // Invalider les requêtes pour forcer le rafraîchissement
    queryClient.invalidateQueries({ queryKey: ['trips'] });
    queryClient.invalidateQueries({ queryKey: ['sharedTrips'] });
    queryClient.invalidateQueries({ queryKey: ['trip-stats'] });
    queryClient.invalidateQueries({ queryKey: ['upcoming-trips'] });
  };

  // Statistiques utilisant l'API client existant
  const { data: stats } = useQuery<TripStats>({
    queryKey: ['trip-stats', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated');

      // Récupérer tous les voyages de l'utilisateur
      const trips = await apiClient.get<TripWithDestinations[]>(
        'trips',
        { 
          created_by: `eq.${userId}`,
          order: 'created_at.desc'
        },
        'id,name,start_date'
      );

      if (!trips || trips.length === 0) {
        return {
          totalTrips: 0,
          upcomingTrips: 0,
          totalDestinations: 0,
          totalExpenses: 0
        };
      }

      const tripIds = trips.map(trip => trip.id);
      const now = new Date();

      // Récupérer les destinations pour ces voyages
      const destinations = await apiClient.get<Destination[]>(
        'destinations',
        { trip_id: `in.(${tripIds.join(',')})` },
        'city,trip_id'
      );

      // Récupérer les dépenses pour ces voyages
      const expenses = await apiClient.get<Expense[]>(
        'expenses',
        { trip_id: `in.(${tripIds.join(',')})` },
        'amount,trip_id'
      );

      return {
        totalTrips: trips.length,
        upcomingTrips: trips.filter(trip => new Date(trip.start_date) > now).length,
        totalDestinations: destinations ? destinations.length : 0,
        totalExpenses: expenses ? expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0) : 0
      };
    },
    enabled: !!userId
  });

  // Prochains voyages utilisant l'API client existant
  const { data: upcomingTrips } = useQuery<UpcomingTrip[]>({
    queryKey: ['upcoming-trips', userId],
    queryFn: async (): Promise<UpcomingTrip[]> => {
      if (!userId) return [];

      const now = new Date().toISOString();
      
      // Récupérer les voyages à venir
      const trips = await apiClient.get<TripWithDestinations[]>(
        'trips',
        { 
          created_by: `eq.${userId}`,
          start_date: `gt.${now}`,
          order: 'start_date.asc',
          limit: '3'
        },
        'id,name,start_date'
      );

      if (!trips || trips.length === 0) return [];

      const tripIds = trips.map(trip => trip.id);

      // Récupérer les destinations pour ces voyages
      const destinations = await apiClient.get<Destination[]>(
        'destinations',
        { trip_id: `in.(${tripIds.join(',')})` },
        'city,trip_id'
      );

      // Récupérer les participants pour ces voyages
      const participants = await apiClient.get<TripParticipant[]>(
        'trip_participants',
        { trip_id: `in.(${tripIds.join(',')})` },
        'trip_id'
      );

      // Créer un map des destinations par voyage
      const destinationsByTrip = new Map<string, string>();
      destinations?.forEach(dest => {
        if (!destinationsByTrip.has(dest.trip_id)) {
          destinationsByTrip.set(dest.trip_id, dest.city);
        }
      });

      // Créer un map du nombre de participants par voyage
      const participantsByTrip = new Map<string, number>();
      participants?.forEach(participant => {
        const currentCount = participantsByTrip.get(participant.trip_id) || 0;
        participantsByTrip.set(participant.trip_id, currentCount + 1);
      });

      return trips.map(trip => ({
        id: trip.id,
        name: trip.name,
        start_date: trip.start_date,
        city: destinationsByTrip.get(trip.id) || 'Aucune destination saisie',
        participants: participantsByTrip.get(trip.id) || 0
      }));
    },
    enabled: !!userId
  });

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-900 px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Mon tableau de bord</h1>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 shadow-lg">
          <div className="flex items-center text-white">
            <FaPlane className="text-2xl mr-3 text-white/80" />
            <div>
              <div className="text-3xl font-bold">{stats?.totalTrips || 0}</div>
              <div className="text-sm text-white/80">Voyages totaux</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 shadow-lg">
          <div className="flex items-center text-white">
            <BsCalendarEvent className="text-2xl mr-3 text-white/80" />
            <div>
              <div className="text-3xl font-bold">{stats?.upcomingTrips || 0}</div>
              <div className="text-sm text-white/80">Voyages à venir</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 shadow-lg">
          <div className="flex items-center text-white">
            <MdLocationOn className="text-2xl mr-3 text-white/80" />
            <div>
              <div className="text-3xl font-bold">{stats?.totalDestinations || 0}</div>
              <div className="text-sm text-white/80">Destinations totales</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 shadow-lg">
          <div className="flex items-center text-white">
            <BsCurrencyEuro className="text-2xl mr-3 text-white/80" />
            <div>
              <div className="text-3xl font-bold">
                {new Intl.NumberFormat('fr-FR', { 
                  style: 'currency', 
                  currency: 'EUR',
                  maximumFractionDigits: 0
                }).format(stats?.totalExpenses || 0)}
              </div>
              <div className="text-sm text-white/80">Dépenses totales</div>
            </div>
          </div>
        </div>
      </div>

      {/* Prochains départs */}
      {upcomingTrips && Array.isArray(upcomingTrips) && upcomingTrips.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 mb-8 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-white">
            <MdTrendingUp className="mr-2" />
            Prochains départs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingTrips.map(trip => {
              const daysUntil = Math.ceil(
                (new Date(trip.start_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
              );
              return (
                <Link 
                  to={`/trip/${trip.id}`} 
                  key={trip.id}
                  className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                >
                  <h3 className="font-medium text-lg mb-2 text-white">{trip.name}</h3>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>📍 {trip.city}</div>
                    <div>⏰ Départ dans {daysUntil} jour{daysUntil > 1 ? 's' : ''}</div>
                    <div>📅 {new Date(trip.start_date).toLocaleDateString('fr-FR')}</div>
                    <div>👥 {trip.participants} participant{trip.participants > 1 ? 's' : ''}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Mes voyages et Voyages partagés */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">

        {/* Card: Mes voyages */}
        <div className="bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Mes voyages en cours</h2>
            <div className="flex gap-3 items-center">
              <Link 
                to="/my-trips" 
                title="Voir tous mes voyages" 
                className="text-blue-400 hover:text-blue-300 text-xl transition-colors"
                aria-label="Voir tous mes voyages"
              >
                <FaEye />
              </Link>
              <button 
                onClick={openModal} 
                title="Créer un voyage" 
                className="text-blue-400 hover:text-blue-300 text-xl transition-colors"
                aria-label="Créer un voyage"
              >
                <FaPlus />
              </button>
              <button 
                onClick={() => setCollapseMine(prev => !prev)} 
                title={collapseMine ? "Développer" : "Réduire"} 
                className="text-white text-xl transition-colors"
                aria-label={collapseMine ? "Développer la section" : "Réduire la section"}
              >
                {collapseMine ? <FaChevronDown /> : <FaChevronUp />}
              </button>
            </div>
          </div>

          {!collapseMine && (
            <div>
              <ShowTrips />
            </div>
          )}
        </div>

        {/* Card: Voyages en compagnie */}
        <div className="bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Les voyages collaboratifs</h2>
            <button 
              onClick={() => setCollapseShared(prev => !prev)} 
              title={collapseShared ? "Développer" : "Réduire"} 
              className="text-white text-xl transition-colors"
              aria-label={collapseShared ? "Développer la section" : "Réduire la section"}
            >
              {collapseShared ? <FaChevronDown /> : <FaChevronUp />}
            </button>
          </div>

          {!collapseShared && (
            <div>
              <SharedTrips />
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showTripModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Créer un nouveau voyage</h2>
              <button 
                onClick={() => setShowTripModal(false)} 
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors"
                aria-label="Fermer la modal"
              >
                &times;
              </button>
            </div>
            <CreateTrip onSuccess={handleTripCreated} />
          </div>
        </div>
      )}
    </div>
  );
};