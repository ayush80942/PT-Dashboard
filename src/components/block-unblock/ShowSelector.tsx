"use client";

import { useEffect, useState } from "react";

type Show = {
  id: number;
  startTime: string;
  endTime: string;
  digiplexId: number;
};

type Props = {
  digiplexId: number;
  onSelectShow: (showId: number) => void;
};

export default function ShowSelector({ digiplexId, onSelectShow }: Props) {
  const [shows, setShows] = useState<Show[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedShowId, setSelectedShowId] = useState<number | null>(null);

  const groupedByDate = shows.reduce((acc: Record<string, Show[]>, show) => {
    const date = new Date(show.startTime).toISOString().split("T")[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(show);
    return acc;
  }, {});

  useEffect(() => {
    if (digiplexId) {
      fetch(`https://dashboard-backend.picturetime.in/api/shows/upcoming?digiplexId=${digiplexId}`)
        .then((res) => res.json())
        .then((data) => setShows(data))
        .catch((err) => console.error("Error fetching shows", err));
    } else {
      setShows([]);
    }
    setSelectedDate("");
    setSelectedShowId(null);
  }, [digiplexId]);

  const hasShows = Object.keys(groupedByDate).length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto mt-6">
      {hasShows ? (
        <>
          <label className="block text-base font-semibold text-gray-800 mb-3 text-center">
            Select Date:
          </label>
          <div className="flex justify-center">
            <div className="flex overflow-x-auto gap-3 pb-2 px-2">
              {Object.keys(groupedByDate).map((dateStr) => {
                const d = new Date(dateStr);
                const isSelected = selectedDate === dateStr;

                return (
                  <button
                    key={dateStr}
                    onClick={() => {
                      setSelectedDate(dateStr);
                      setSelectedShowId(null);
                    }}
                    className={`min-w-[80px] px-2 py-3 rounded-lg text-sm border text-center transition-all duration-150 flex flex-col items-center ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-800 border-gray-300"
                    } hover:shadow`}
                  >
                    <span className="text-xs font-medium">
                      {d.toLocaleDateString(undefined, { weekday: "short" })}
                    </span>
                    <span className="text-lg font-bold leading-tight">
                      {d.getDate()}
                    </span>
                    <span className="text-xs">
                      {d.toLocaleDateString(undefined, { month: "short" })}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500 italic">
          No shows available for this cinema.
        </p>
      )}

      {selectedDate && groupedByDate[selectedDate]?.length > 0 && (
        <>
          <label className="block mt-6 text-base font-semibold text-gray-800 mb-3 text-center">
            Select Show Time:
          </label>
          <div className="flex justify-center">
            <div className="flex overflow-x-auto gap-3 pb-2 px-2">
              {groupedByDate[selectedDate].map((show) => {
                const rawTime = new Date(show.startTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                });

                const time = rawTime.replace(/\s?(am|pm)/i, (match) =>
                  match.toUpperCase()
                );

                const isSelected = selectedShowId === show.id;

                return (
                  <button
                    key={show.id}
                    onClick={() => {
                      setSelectedShowId(show.id);
                      onSelectShow(show.id);
                    }}
                    className={`min-w-[90px] px-3 py-3 rounded-lg text-sm font-semibold border text-center transition-all duration-150 ${
                      isSelected
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-gray-800 border-gray-300"
                    } hover:shadow`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {selectedDate && groupedByDate[selectedDate]?.length === 0 && (
        <p className="text-center mt-4 text-gray-500 italic">
          No shows available on this date.
        </p>
      )}
    </div>
  );
}
