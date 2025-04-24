import { Link } from "react-router";
import { Trip } from "../components/TripList";

interface Props {
    trip: Trip;
}

export const TripItem = ({ trip }: Props) => {
    return (
        <div className="">
            <Link to="">
                <div className="bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="text-xl font-semibold text-white mb-2">
                        Nom du voyage : {trip.name}
                    </div>
                    <div>
                        Description du voyage : {trip.description}
                    </div>
                    <div>
                        Date du voyage : {trip.start_date.toString()} au {trip.end_date.toString()}
                    </div>
                    <div className="text-sm text-gray-400 mt-2">
                        Voyage initié le : {trip.created_at.toString()}
                    </div>
                </div>
            </Link>
        </div>
    )
};
