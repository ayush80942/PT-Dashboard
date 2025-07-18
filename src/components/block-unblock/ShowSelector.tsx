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
    }
  }, [digiplexId]);

  return (
    <div className="w-full max-w-md mt-6">
      <label className="block text-sm font-medium mb-1">Select Date:</label>
      <select
        className="w-full border px-3 py-2 rounded"
        value={selectedDate}
        onChange={(e) => {
          setSelectedDate(e.target.value);
          setSelectedShowId(null); // Reset time if date changes
        }}
      >
        <option value="">-- Select Date --</option>
        {Object.keys(groupedByDate).map((date) => (
          <option key={date} value={date}>
            {new Date(date).toLocaleDateString()}
          </option>
        ))}
      </select>

      {selectedDate && (
        <>
          <label className="block mt-4 text-sm font-medium mb-1">Select Time:</label>
          <select
            className="w-full border px-3 py-2 rounded"
            value={selectedShowId ?? ""}
            onChange={(e) => {
              const id = parseInt(e.target.value);
              setSelectedShowId(id);
              onSelectShow(id);
            }}
          >
            <option value="">-- Select Start Time --</option>
            {groupedByDate[selectedDate].map((show) => {
              const time = new Date(show.startTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <option key={show.id} value={show.id}>
                  {time}
                </option>
              );
            })}
          </select>
        </>
      )}
    </div>
  );
}
