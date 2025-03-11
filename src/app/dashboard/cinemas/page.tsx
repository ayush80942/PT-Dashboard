"use client";

import { useEffect, useState } from "react";
import { ref, get, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { Table } from "@/components/Table";
import { Dialog } from "@/components/Dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function CinemaPage() {
  const [theatres, setTheatres] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // State for editing movies for a theatre
  const [isMoviesDialogOpen, setIsMoviesDialogOpen] = useState(false);
  const [moviesEditData, setMoviesEditData] = useState<{
    theatreId: string;
    movies: { name: string; link: string }[];
  } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Fetch theatres with their keys
    get(ref(db, "theatres")).then((snapshot) => {
      if (snapshot.exists()) {
        const data = Object.entries(snapshot.val()).map(([id, value]) => ({
          id,
          ...(typeof value === 'object' && value !== null ? value : {}),
        }));
        setTheatres(data);
      }
    });

    // Fetch news (unchanged)
    get(ref(db, "news")).then((snapshot) => {
      if (snapshot.exists()) {
        setNews(Object.values(snapshot.val()));
      }
    });
  }, []);

  // Callback for Table's "Actions" edit button
  const handleEditMovies = (row: any) => {
    // Open dialog with the theatre's movies (or an empty array if none)
    setMoviesEditData({
      theatreId: row.id,
      movies: row.movies || [],
    });
    setIsMoviesDialogOpen(true);
  };

  // Save the edited movies array back to Firebase for the theatre
  const handleSaveMovies = () => {
    if (moviesEditData) {
      const theatreRef = ref(db, `theatres/${moviesEditData.theatreId}`);
      update(theatreRef, { movies: moviesEditData.movies }).then(() => {
        setIsMoviesDialogOpen(false);
        setMoviesEditData(null);
      });
    }
  };

  // Render data for the Table.
  // We include the theatre id in the mapped data so that the edit callback receives it.
  const tableData = theatres.map((theatre) => ({
    id: theatre.id,
    image: theatre.image || "",
    address: theatre.address || "N/A",
    location: theatre.location || "N/A",
    map_url: theatre.map_url || "#",
    movies:
      theatre.movies?.map((movie: any) => ({
        name: movie.name || "N/A",
        link: movie.link || "",
      })) || [],
  }));

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Cinemas List</h1>

      <div>
        <Table
          headers={["Image", "Address", "Google Map", "Movies", "Actions"]}
          data={tableData}
          onEdit={handleEditMovies}
        />
      </div>

      {/* Movies Editing Dialog */}
      <Dialog
        isOpen={isMoviesDialogOpen}
        onClose={() => {
          setIsMoviesDialogOpen(false);
          setMoviesEditData(null);
        }}
        title="Edit Movies"
        footer={
          <>
            <Button variant="outline" onClick={() => {
              setIsMoviesDialogOpen(false);
              setMoviesEditData(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveMovies}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          {moviesEditData?.movies.map((movie, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Movie Name"
                value={movie.name}
                onChange={(e) => {
                  const newMovies = [...(moviesEditData?.movies || [])];
                  newMovies[index] = { ...newMovies[index], name: e.target.value };
                  setMoviesEditData({ ...moviesEditData!, movies: newMovies });
                }}
              />
              <Input
                type="text"
                placeholder="Poster Link"
                value={movie.link}
                onChange={(e) => {
                  const newMovies = [...(moviesEditData?.movies || [])];
                  newMovies[index] = { ...newMovies[index], link: e.target.value };
                  setMoviesEditData({ ...moviesEditData!, movies: newMovies });
                }}
              />
              <button
                onClick={() => {
                  const newMovies = [...(moviesEditData?.movies || [])];
                  newMovies.splice(index, 1);
                  setMoviesEditData({ ...moviesEditData!, movies: newMovies });
                }}
                className="text-red-600 hover:text-red-800"
              >
                {/* Trash icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a1 1 0 011 1v1H9V4a1 1 0 011-1z"
                  />
                </svg>
              </button>
            </div>
          ))}
          <Button
            variant="ghost"
            onClick={() => {
              const newMovies = [...(moviesEditData?.movies || [])];
              newMovies.push({ name: "", link: "" });
              setMoviesEditData({ ...moviesEditData!, movies: newMovies });
            }}
          >
            Add Movie
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
