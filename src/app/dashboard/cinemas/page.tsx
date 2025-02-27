"use client";

import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { Table } from "@/components/Table";

export default function CinemaPage() {
  const [theatres, setTheatres] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    // Fetch theatres
    get(ref(db, "theatres")).then((snapshot) => {
      if (snapshot.exists()) {
        setTheatres(Object.values(snapshot.val()));
      }
    });

    // Fetch news
    get(ref(db, "news")).then((snapshot) => {
      if (snapshot.exists()) {
        setNews(Object.values(snapshot.val()));
      }
    });
  }, []);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Cinema Management</h1>

      {/* Theatres Table */}
      <div>
        <h2 className="text-xl font-medium mb-4">Theatres</h2>
        <Table
          headers={["Image", "Address", "Location", "Google Map", "Movies"]}
          data={theatres.map((theatre) => ({
            image: theatre.image || "",
            address: theatre.address || "N/A",
            location: theatre.location || "N/A",
            map_url: theatre.map_url || "#",
            movies: theatre.movies?.map((movie: any) => ({
              name: movie.name || "N/A",
              link: movie.link || "",
            })) || [], // ✅ If movies is undefined, return an empty array
          }))}
        />
      </div>

      {/* News Table */}
      <div>
        <h2 className="text-xl font-medium mb-4">News</h2>
        <Table
          headers={["Title", "Source", "Date", "Status"]}
          data={news.map((article) => ({
            title: article.title || "N/A",
            source: article.source || "N/A",
            date: article.date ? new Date(article.date).toLocaleDateString() : "N/A",
            status: article.status || "N/A",
          }))}
        />
      </div>
    </div>
  );
}
