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

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectingMode, setSelectingMode] = useState<"select" | "deselect" | null>(null);

  useEffect(() => {
    const handlePointerUp = () => {
      setIsSelecting(false);
      setSelectingMode(null);
    };
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

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
        headers: { "Content-Type": "application/json" },
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

        // Refresh seat status
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

  if (loading) return <p className="text-gray-500 mt-4 text-center">Loading seat layout...</p>;
  if (error) return <p className="text-red-500 mt-4 text-center">{error}</p>;
  if (!layoutData.length) return <p className="mt-4 text-center">No seat layout available.</p>;

  return (
    <div className="w-full flex justify-center px-4">
      <div className="w-full max-w-3xl mt-8">
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-xl font-bold">Seat Layout</h2>
          <p className="text-sm text-gray-600">
            <span className="inline-block w-4 h-4 bg-gray-400 border rounded align-middle mr-1"></span> Blocked &nbsp;
            <span className="inline-block w-4 h-4 bg-white border rounded align-middle mr-1"></span> Available &nbsp;
            <span className="inline-block w-4 h-4 bg-blue-200 border-blue-600 border-2 rounded align-middle mr-1"></span> Selected
          </p>
        </div>

        {layoutData
          .filter((row) => row.rowInclude === "Y")
          .map((row) => {
            const columnCount = parseInt(row.columnInclude, 10);

            return (
              <div key={row.id} className="flex items-start gap-4 justify-center mb-2">
                <div className="w-6 font-semibold pt-2 text-center">{row.rowName}</div>
                <div
                  className="grid gap-1"
                  style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}
                >
                  {(() => {
                    let visibleSeatCount = 0;
                    return Array.from({ length: columnCount }, (_, i) => {
                      const colKey = `col${i + 1}`;
                      const seatStatus = row[colKey];

                      if (seatStatus !== "Y") {
                        return <div key={colKey} className="w-8 h-8" />;
                      }

                      visibleSeatCount++;
                      const seatLabel = `${row.rowName}${visibleSeatCount}`;
                      const seatState = getSeatState(seatLabel);

                      return (
                        <div key={colKey} className="w-8 h-8">
                          <input
                            type="checkbox"
                            id={seatLabel}
                            name={seatLabel}
                            className="peer hidden"
                            checked={selectedSeats.includes(seatLabel)}
                            readOnly
                          />
                          <label
                            htmlFor={seatLabel}
                            onPointerDown={(e) => {
                              e.preventDefault();
                              setIsSelecting(true);
                              const isSelected = selectedSeats.includes(seatLabel);
                              setSelectingMode(isSelected ? "deselect" : "select");
                              toggleSeatSelection(seatLabel);
                            }}
                            onPointerEnter={() => {
                              if (isSelecting && selectingMode) {
                                const alreadySelected = selectedSeats.includes(seatLabel);
                                if (selectingMode === "select" && !alreadySelected) {
                                  setSelectedSeats((prev) => [...prev, seatLabel]);
                                } else if (selectingMode === "deselect" && alreadySelected) {
                                  setSelectedSeats((prev) => prev.filter((s) => s !== seatLabel));
                                }
                              }
                            }}
                            className={`w-8 h-8 border rounded flex items-center justify-center text-xs font-medium cursor-pointer select-none
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

        <div className="space-y-4 text-center mt-8">
          <div>
            <h3 className="text-md font-semibold mb-2">Selected Seats:</h3>
            {selectedSeats.length === 0 ? (
              <p className="text-gray-500">No seats selected</p>
            ) : (
              <div className="flex flex-wrap justify-center gap-2 text-gray-700">
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

          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => setOperation("BLOCK")}
              className={`px-5 py-2 rounded border transition font-medium ${
                operation === "BLOCK"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-800"
              }`}
            >
              Block
            </button>
            <button
              onClick={() => setOperation("UNBLOCK")}
              className={`px-5 py-2 rounded border transition font-medium ${
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
              className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
            >
              Submit
            </button>

          {responseMsg && <p className="text-sm mt-2">{responseMsg}</p>}
        </div>
      </div>
    </div>
  );
};

export default SeatLayout;
