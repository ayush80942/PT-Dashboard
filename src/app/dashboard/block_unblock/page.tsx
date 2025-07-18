"use client";

import { useState } from "react";
import CinemaSelector from "@/components/block-unblock/CinemaDropdown";
import ShowSelector from "@/components/block-unblock/ShowSelector";
import SeatLayout from "@/components/block-unblock/SeatLayout";

export default function BlockUnblockPage() {
  const [selectedCinema, setSelectedCinema] = useState<number | null>(null);
  const [selectedShowId, setSelectedShowId] = useState<number | null>(null);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen px-4 py-8 bg-gray-50">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Block / Unblock Seats
        </h1>

        <CinemaSelector
          onSelect={(id) => {
            setSelectedCinema(id);
            setSelectedShowId(null);
          }}
        />

        {selectedCinema && (
          <div className="mt-6">
            <ShowSelector
              digiplexId={selectedCinema}
              onSelectShow={(showId) => setSelectedShowId(showId)}
            />

            {selectedShowId && (
              <p className="mt-4 text-center text-sm text-green-600">
                Selected Show ID: <span className="font-medium">{selectedShowId}</span>
              </p>
            )}
          </div>
        )}

        {selectedCinema && selectedShowId && (
          <div className="mt-8">
            <SeatLayout digiplexId={selectedCinema} showId={selectedShowId} />
          </div>
        )}
      </div>
    </div>
  );
}
