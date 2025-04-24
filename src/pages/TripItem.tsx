import { BsFillCalendarDateFill } from "react-icons/bs";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { TbFileDescription } from "react-icons/tb";
import { Link } from "react-router";
import { Trip } from "../components/TripList";

interface Props {
  trip: Trip;
}

export const TripItem = ({ trip }: Props) => {
  return (
    <div className="mb-4">
      <Link to="">
        <div className="bg-gray-800 border border-gray-400 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow space-y-2">
          <div className="flex items-center text-xl font-semibold text-white">
            <MdDriveFileRenameOutline className="mr-2 text-blue-400" />
            {trip.name}
          </div>
          <div className="flex items-center text-white">
            <TbFileDescription className="mr-2 text-green-400" />
            {trip.description}
          </div>
          <div className="flex items-center text-white">
            <BsFillCalendarDateFill className="mr-2 text-yellow-400" />
            {trip.start_date.toString()} au {trip.end_date.toString()}
          </div>
          <div className="text-sm text-gray-400 mt-2">
            Voyage initié le : {new Date(trip.created_at).toISOString().split("T")[0]}
          </div>
        </div>
      </Link>
    </div>
  );
};
