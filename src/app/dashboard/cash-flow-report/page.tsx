'use client';

import React, { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';
import { Listbox } from '@headlessui/react';
import { Fragment } from 'react';

interface Cinema {
  id: number;
  siteName: string;
}

const CashFlowReportPage: React.FC = () => {
  const [cinemaOptions, setCinemaOptions] = useState<Cinema[]>([]);
  const [cinemaId, setCinemaId] = useState<number | null>(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [cinemaLoading, setCinemaLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch cinema list on load
  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const res = await fetch('https://dashboard-backend.picturetime.in/api/cinema/list');
        const data = await res.json();

        // ✅ Fix: map 'name' to 'siteName'
        const mapped = data.map((c: any) => ({
          id: c.id,
          siteName: c.name,
        }));

        setCinemaOptions(mapped);
      } catch (err) {
        console.error('Failed to fetch cinema list', err);
        setError('Unable to load cinema list');
      } finally {
        setCinemaLoading(false);
      }
    };

    fetchCinemas();
  }, []);


  const handleDownload = async () => {
    if (!cinemaId || !fromDate || !toDate) {
      setError('Please select all fields.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await fetch(
        `https://dashboard-backend.picturetime.in/api/report/download-excel?cinemaId=${cinemaId}&from=${fromDate}&to=${toDate}`
      );

      if (!res.ok) throw new Error('Failed to fetch file.');

      const blob = await res.blob();
      const selectedCinema = cinemaOptions.find((c) => c.id === cinemaId);
      const fileName = `${selectedCinema?.siteName || 'Report'}_${fromDate}_to_${toDate}.xlsx`;
      saveAs(blob, fileName);
    } catch (err) {
      console.error(err);
      setError('Failed to download Excel file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full p-6 bg-white rounded-xl shadow-md space-y-6">
        <h2 className="text-xl font-semibold text-center">Cinema Cash Flow Report</h2>

        <div className="space-y-4">
          {/* Cinema Dropdown */}
          <div className="space-y-2">
            <label className="block mb-1 font-medium">Cinema Name</label>
            <Listbox value={cinemaId} onChange={(value) => { setCinemaId(value); setError(''); }}>
              <div className="relative">
                <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2.5 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-base">
                  {cinemaOptions.find((c) => c.id === cinemaId)?.siteName || 'Select Cinema'}
                </Listbox.Button>

                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none">
                  {cinemaOptions.map((c) => (
                    <Listbox.Option
                      key={c.id}
                      value={c.id}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 pl-3 pr-4 ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                        }`
                      }
                    >
                      {c.siteName}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>

          {/* Date Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setError('');
                }}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setError('');
                }}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
          </div>

          {/* Error & Button */}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            onClick={handleDownload}
            disabled={loading || cinemaLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
          >
            {loading ? 'Downloading...' : 'Download Excel'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CashFlowReportPage;
