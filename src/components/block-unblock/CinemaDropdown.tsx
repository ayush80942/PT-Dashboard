"use client";
import { useEffect, useState } from "react";

type Cinema = {
  name: string;
  digiplexId: number;
  id: number;
};

type Props = {
  onSelect: (digiplexId: number) => void;
};

export default function CinemaSelector({ onSelect }: Props) {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchCinemas = async () => {
      const res = await fetch("https://dashboard-backend.picturetime.in/api/cinema/list");
      const data = await res.json();
      setCinemas(data);
    };
    fetchCinemas();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    setSelectedId(id);
    onSelect(id);
  };

  return (
    <div className="w-full max-w-md mx-auto my-6">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        Select Cinema
      </label>
      <select
        value={selectedId ?? ""}
        onChange={handleChange}
        className="block w-full border border-gray-300 rounded-lg px-4 py-2"
      >
        <option value="" disabled>Select a location</option>
        {cinemas.map((cinema) => (
          <option key={cinema.digiplexId} value={cinema.digiplexId}>
            {cinema.name}
          </option>
        ))}
      </select>
    </div>
  );
}
