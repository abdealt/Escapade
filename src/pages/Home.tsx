import { useState } from "react";
import { FaChevronDown, FaChevronUp, FaEye, FaPlus } from "react-icons/fa";
import { Link } from "react-router";
import { CreateTrip } from "../components/CreateTripForm";
import { SharedTrips } from "../components/SharedTrips";
import { TripList } from "../components/TripList";

export const Home = () => {
  const [showTripModal, setShowTripModal] = useState(false);
  const [collapseMine, setCollapseMine] = useState(false);
  const [collapseShared, setCollapseShared] = useState(false);

  const openModal = () => setShowTripModal(true);
  const closeModal = () => setShowTripModal(false);

  return (
    <div className="min-h-screen text-gray-100 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-12 text-center text-black">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

        {/* Card: Mes voyages */}
        <div className="bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Mes voyages</h2>
            <div className="flex gap-3 items-center">
              <Link to="/my-trips" title="Voir tous mes voyages" className="text-blue-400 hover:text-blue-300 text-xl">
                <FaEye />
              </Link>
              <button onClick={openModal} title="Créer un voyage" className="text-blue-400 hover:text-blue-300 text-xl">
                <FaPlus />
              </button>
              <button onClick={() => setCollapseMine(prev => !prev)} title="Réduire" className="text-white text-xl">
                {collapseMine ? <FaChevronDown /> : <FaChevronUp />}
              </button>
            </div>
          </div>

          {!collapseMine && (
            <div>
              <TripList />
            </div>
          )}
        </div>

        {/* Card: Voyages en compagnie */}
        <div className="bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Les voyages en compagnie</h2>
            <button onClick={() => setCollapseShared(prev => !prev)} title="Réduire" className="text-white text-xl">
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
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Créer un nouveau voyage</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">
                &times;
              </button>
            </div>
            <CreateTrip onSuccess={closeModal} />
          </div>
        </div>
      )}
    </div>
  );
};
