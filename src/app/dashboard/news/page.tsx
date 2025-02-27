"use client";

import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/Table";
import { db } from "@/lib/firebase";

interface NewsItem {
  id: string;
  title: string;
  source: string;
  date: string;
  amount: string;
  status: string;
  imageUrl?: string;
}

export default function DashboardPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const newsRef = ref(db, "news");

    onValue(newsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data: NewsItem[] = Object.entries(snapshot.val()).map(([id, value]) => {
          const newsItem = value as Omit<NewsItem, "id">; // Ensure it doesn't contain `id`
          return { id, ...newsItem }; // Explicitly assign `id`
        });
        const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setNews(sortedData);
      }
    });
  }, []);

  const filteredNews = news.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Invoices</h1>

      <div className="flex justify-between mb-4">
        <Input
          type="text"
          placeholder="Search invoices..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-1/3"
        />
        <Button className="bg-blue-500 text-white">Create Invoice +</Button>
      </div>

      <Table 
        headers={["Title", "Source", "Date"]}
        data={filteredNews} 
      />
    </div>
  );
}
