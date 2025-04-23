import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { TripItem } from "./TripItem";

// Trip model
export interface Trip {
    id: string;
    name: string;
    description: string;
    start_date: Date;
    end_date: Date;
    created_by: string;
    created_at: Date;
}

const fetchTrips = async (): Promise<Trip[]> => {
    const { data, error } = await supabase
        .from("trips")
        .select("*")
        .order("created_at", { ascending: false });
    if (error) {
        throw new Error(error.message);
    }
    return data as Trip[];
}

export const TripList = () => {
    const {data, error, isLoading} = useQuery<Trip[], Error>({
        queryKey: ["trips"],
        queryFn: fetchTrips,
    })

    if (isLoading) {
        return <div>Loading...</div>;
    }
    if (error) {
        return <div>Error: {error.message}</div>;
    }

    console.log(data)

    return (
        <div>
            {data?.map((trip, key)=>(
                <TripItem trip={trip} key={key}/>
            ))}
        </div>
    )
}