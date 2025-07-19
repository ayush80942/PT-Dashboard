"use client";

import React, { useEffect, useState } from "react";

type SeatRow = {
  id: number;
  digiplexId: number;
  rowName: string;
  rowAlias: string;
  seatType: string;
  rowInclude: string;
  columnInclude: string;
  [key: string]: any;
};

type SeatStatus = {
  seat: string;
  availability: string;
};

const SeatLayout = ({
  digiplexId,
  showId,
}: {
  digiplexId: number;
  showId: number;
}) => {
  const [layoutData, setLayoutData] = useState<SeatRow[]>([]);
  const [seatStatusMap, setSeatStatusMap] = useState<Map<string, string>>(new Map());
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [operation, setOperation] = useState<"BLOCK" | "UNBLOCK">("BLOCK");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [responseMsg, setResponseMsg] = useState("");

  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const res = await fetch(
          `https://dashboard-backend.picturetime.in/api/layout?digiplexId=${digiplexId}`
        );
        if (!res.ok) throw new Error("Failed to load layout");
        const data = await res.json();
        setLayoutData(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      }
    };

    const fetchSeatStatus = async () => {
      try {
        const res = await fetch(
          `https://dashboard-backend.picturetime.in/api/seating/status?showId=${showId}`
        );
        if (!res.ok) throw new Error("Failed to load seat status");
        const data: SeatStatus[] = await res.json();
        const statusMap = new Map(data.map((s) => [s.seat, s.availability]));
        setSeatStatusMap(statusMap);
      } catch (err: any) {
        console.error("Seat status error:", err);
      }
    };

    if (digiplexId && showId) {
      setLoading(true);
      Promise.all([fetchLayout(), fetchSeatStatus()]).finally(() =>
        setLoading(false)
      );
    }
  }, [digiplexId, showId]);

  const toggleSeatSelection = (seatLabel: string) => {
    setSelectedSeats((prev) =>
      prev.includes(seatLabel)
        ? prev.filter((s) => s !== seatLabel)
        : [...prev, seatLabel]
    );
  };

  const getSeatState = (seatLabel: string) => {
    const status = seatStatusMap.get(seatLabel);
    const isSelected = selectedSeats.includes(seatLabel);
    if (isSelected) return "selected";
    return status === "0" ? "blocked" : "available";
  };

  const handleSubmit = async () => {
    if (selectedSeats.length === 0) {
      setResponseMsg("Please select at least one seat.");
      return;
    }

    try {
      const res = await fetch("https://dashboard-backend.picturetime.in/api/seating/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          showId,
          seatNumbers: selectedSeats,
          operation,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        setResponseMsg(`✅ ${result.updated} seat(s) updated successfully.`);
        setSelectedSeats([]);
        // Optionally reload seat status
        const statusRes = await fetch(
          `https://dashboard-backend.picturetime.in/api/seating/status?showId=${showId}`
        );
        const statusData: SeatStatus[] = await statusRes.json();
        const newMap = new Map(statusData.map((s) => [s.seat, s.availability]));
        setSeatStatusMap(newMap);
      } else {
        setResponseMsg(`❌ Error: ${result.message || "Operation failed"}`);
      }
    } catch (err: any) {
      setResponseMsg(`❌ Error: ${err.message}`);
    }
  };

  if (loading) return <p className="text-gray-500 mt-4">Loading seat layout...</p>;
  if (error) return <p className="text-red-500 mt-4">{error}</p>;
  if (!layoutData.length) return <p className="mt-4">No seat layout available.</p>;

  return (
    <div className="mt-6 space-y-6 w-full max-w-4xl">
      <h2 className="text-lg font-semibold">Seat Layout</h2>
      <p className="text-sm text-gray-600">
        <span className="inline-block w-4 h-4 bg-gray-400 border rounded align-middle mr-1"></span> Blocked &nbsp;
        <span className="inline-block w-4 h-4 bg-white border rounded align-middle mr-1"></span> Available &nbsp;
        <span className="inline-block w-4 h-4 bg-blue-200 border-blue-600 border-2 rounded align-middle mr-1"></span> Selected
      </p>

      {layoutData
        .filter((row) => row.rowInclude === "Y")
        .map((row) => {
          const columnCount = parseInt(row.columnInclude, 10);

          return (
            <div key={row.id} className="flex items-start space-x-4">
              <div className="w-6 font-medium pt-2">{row.rowName}</div>
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}
              >
                {(() => {
                  let visibleSeatCount = 0;
                  return Array.from({ length: columnCount }, (_, i) => {
                    const colKey = `col${i + 1}`;
                    const seatStatus = row[colKey];

                    if (seatStatus !== "Y") {
                      return <div key={colKey} className="w-10 h-10" />;
                    }

                    visibleSeatCount++;
                    const seatLabel = `${row.rowName}${visibleSeatCount}`;
                    const seatState = getSeatState(seatLabel);

                    return (
                      <div key={colKey} className="w-10 h-10">
                        <input
                          type="checkbox"
                          id={seatLabel}
                          name={seatLabel}
                          className="peer hidden"
                          checked={selectedSeats.includes(seatLabel)}
                          onChange={() => toggleSeatSelection(seatLabel)}
                        />
                        <label
                          htmlFor={seatLabel}
                          className={`w-10 h-10 border rounded flex items-center justify-center text-sm font-medium cursor-pointer shadow-sm
                            ${seatState === "blocked" ? "bg-gray-400 text-white" : ""}
                            ${seatState === "available" ? "bg-white" : ""}
                            ${seatState === "selected" ? "bg-blue-200 border-blue-600 border-2" : ""}
                          `}
                        >
                          {seatLabel}
                        </label>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          );
        })}

      <div className="mt-6 space-y-3">
        <div>
          <h3 className="text-md font-semibold mb-2">Selected Seats:</h3>
          {selectedSeats.length === 0 ? (
            <p className="text-gray-500">No seats selected</p>
          ) : (
            <div className="flex flex-wrap gap-2 text-gray-700">
              {selectedSeats.map((seat) => (
                <span
                  key={seat}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm border border-blue-400"
                >
                  {seat}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setOperation("BLOCK")}
              className={`px-4 py-2 rounded border ${
                operation === "BLOCK"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-800"
              }`}
            >
              Block
            </button>
            <button
              onClick={() => setOperation("UNBLOCK")}
              className={`px-4 py-2 rounded border ${
                operation === "UNBLOCK"
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-800"
              }`}
            >
              Unblock
            </button>
          </div>

          <button
            onClick={handleSubmit}
            className="ml-4 px-5 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Submit
          </button>
        </div>

        {responseMsg && <p className="text-sm mt-2">{responseMsg}</p>}
      </div>
    </div>
  );
};

export default SeatLayout;
