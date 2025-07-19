"use client";

import { useState } from "react";
import CinemaSelector from "@/components/block-unblock/CinemaDropdown";
import ShowSelector from "@/components/block-unblock/ShowSelector";
import SeatLayout from "@/components/block-unblock/SeatLayout";

export default function BlockUnblockPage() {
  const [selectedCinema, setSelectedCinema] = useState<number | null>(null);
  const [selectedShowId, setSelectedShowId] = useState<number | null>(null);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50 py-10 px-4">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Block / Unblock Seats
        </h1>

        <CinemaSelector
          onSelect={(id) => {
            setSelectedCinema(id);
            setSelectedShowId(null);
          }}
        />

        {selectedCinema && (
          <div className="mt-8">
            <ShowSelector
              digiplexId={selectedCinema}
              onSelectShow={(showId) => setSelectedShowId(showId)}
            />
          </div>
        )}

        {selectedCinema && selectedShowId && (
          <div className="mt-10">
            <SeatLayout digiplexId={selectedCinema} showId={selectedShowId} />
          </div>
        )}
      </div>
    </div>
  );
}
