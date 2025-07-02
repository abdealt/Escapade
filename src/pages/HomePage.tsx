import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from "react";
import { BsCalendarEvent, BsCurrencyEuro } from "react-icons/bs";
import { FaChevronDown, FaChevronUp, FaEye, FaPlane, FaPlus } from "react-icons/fa";
import { MdLocationOn, MdTrendingUp } from "react-icons/md";
import { Link } from "react-router";
import { SharedTrips } from "../features/sharedTrips/components/SharedTrips";
import { ShowTrips } from "../features/trips/components/ShowTrips";
import { CreateTrip } from "../features/trips/components/TripForm";
import { supabase } from "../supabase-client";

interface TripStats {
  totalTrips: number;
  upcomingTrips: number;
  totalDestinations: number;
  totalExpenses: number;
}

interface SupabaseTrip {
  id: string;
  name: string;
  start_date: string;
  destinations: { city: string }[] | { city: string };
  trip_participants: { count?: number }[] | { count?: number };
}

interface UpcomingTrip {
  id: string;
  name: string;
  start_date: string;
  city: string;
  participants: number;
}

export const Home = () => {
  const [showTripModal, setShowTripModal] = useState(false);
  const [collapseMine, setCollapseMine] = useState(false);
  const [collapseShared, setCollapseShared] = useState(false);
  const queryClient = useQueryClient();

  const openModal = () => setShowTripModal(true);
  
  const handleTripCreated = () => {
    setShowTripModal(false);
    // Invalider les requêtes pour forcer le rafraîchissement
    queryClient.invalidateQueries({ queryKey: ['trips'] });
    queryClient.invalidateQueries({ queryKey: ['shared-trips'] });
    queryClient.invalidateQueries({ queryKey: ['trip-stats'] });
    queryClient.invalidateQueries({ queryKey: ['upcoming-trips'] });
  };

  // Statistiques
  const { data: stats } = useQuery<TripStats>({
    queryKey: ['trip-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const [tripsResult, expensesResult, destinationsResult] = await Promise.all([
        supabase.from('trips').select('*').eq('created_by', user.id),
        supabase
          .from('expenses')
          .select('amount')
          .in('trip_id', 
            (await supabase.from('trips').select('id').eq('created_by', user.id)).data?.map(t => t.id) || []
          ),
        supabase
          .from('destinations')
          .select('city', { count: 'exact' })
          .in('trip_id', 
            (await supabase.from('trips').select('id').eq('created_by', user.id)).data?.map(t => t.id) || []
          )
      ]);

      const now = new Date();
      return {
        totalTrips: tripsResult.data?.length || 0,
        upcomingTrips: tripsResult.data?.filter(trip => new Date(trip.start_date) > now).length || 0,
        totalDestinations: destinationsResult.count || 0,
        totalExpenses: expensesResult.data?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0
      };
    }
  });

  // Prochains voyages
  const { data: upcomingTrips } = useQuery<UpcomingTrip[]>({
    queryKey: ['upcoming-trips'],
    queryFn: async (): Promise<UpcomingTrip[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data } = await supabase
        .from('trips')
        .select(`
          id,
          name,
          start_date,
          destinations (city),
          trip_participants (count)
        `)
        .eq('created_by', user.id)
        .gt('start_date', new Date().toISOString())
        .order('start_date')
        .limit(3) as { data: SupabaseTrip[] | null };

      if (!data) return [];

      return data.map(trip => ({
        id: trip.id,
        name: trip.name,
        start_date: trip.start_date,
        city: Array.isArray(trip.destinations) 
          ? trip.destinations[0]?.city || 'Aucune destination saisie'
          : (trip.destinations as { city: string })?.city || 'Aucune destination saisie',
        participants: Array.isArray(trip.trip_participants) 
          ? trip.trip_participants.length 
          : (trip.trip_participants as { count?: number })?.count || 0
      }));
    }
  });

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
            {Array.isArray(upcomingTrips) && upcomingTrips.map(trip => {
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
            <h2 className="text-xl font-semibold text-white">Les voyages collaboratif</h2>
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