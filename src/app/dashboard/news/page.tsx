"use client";

import { useState, useEffect } from "react";
import { ref, onValue, update, remove, set } from "firebase/database";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/Table";
import { Dialog } from "@/components/Dialog";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface NewsItem {
  id: string;
  title: string;
  source: string;
  date: string;
  amount: string;
  status: string;
  image?: string;
  link?: string;
}

export default function DashboardPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [newsToDelete, setNewsToDelete] = useState<NewsItem | null>(null);
  const [newNews, setNewNews] = useState<Partial<NewsItem>>({
    title: "",
    source: "",
    date: new Date().toISOString().split("T")[0],
    image: "",
    link: "",
  });

  // If the dateString is already in YYYY-MM-DD, return as is; otherwise, build it.
  const formatDateForInput = (dateString: string) => {
    if (dateString.length === 10) {
      return dateString;
    }
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Convert the input date (YYYY-MM-DD) to display format "Nov 07, 2024"
  const formatDateForSave = (inputDate: string): string => {
    const date = new Date(inputDate);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const newsRef = ref(db, "news");
    onValue(newsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data: NewsItem[] = Object.entries(snapshot.val()).map(([id, value]) => {
          const newsItem = value as Omit<NewsItem, "id">;
          return { id, ...newsItem };
        });
        // Sort by numerical key so that key "0" (newest) comes first.
        // const sortedData = data.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        setNews(data);
      }
    });
  }, []);

  const filteredNews = news.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveNews = () => {
    if (!newNews.title || !newNews.source) return;

    // Format the input date to desired display format.
    const formattedDate = formatDateForSave(newNews.date as string);
    const newsItemToSave = { ...newNews, date: formattedDate };

    if (isEditMode && editingNewsId) {
      // Update the existing news item at its key.
      const newsRef = ref(db, `news/${editingNewsId}`);
      update(newsRef, newsItemToSave);
    } else {
      // For a new news item, shift existing keys and write the new item at key "0".
      const newsRef = ref(db, "news");
      const updates: Record<string, any> = {};
      updates["0"] = newsItemToSave;
      news.forEach((item) => {
        const newKey = (parseInt(item.id) + 1).toString();
        updates[newKey] = item;
      });
      set(newsRef, updates);
    }
    closeDialog();
  };

  const handleEdit = (row: NewsItem) => {
    setNewNews({
      title: row.title,
      source: row.source,
      date: row.date ? formatDateForInput(row.date) : new Date().toISOString().split("T")[0],
      image: row.image || "",
      link: row.link || "",
    });
    // setEditingNewsId(row.id);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (row: NewsItem) => {
    setNewsToDelete(row);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteNews = () => {
    if (!newsToDelete) return;
    const newsRef = ref(db, `news/${newsToDelete.id}`);
    remove(newsRef);
    setIsDeleteDialogOpen(false);
    setNewsToDelete(null);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setNewNews({
      title: "",
      source: "",
      date: new Date().toISOString().split("T")[0],
      image: "",
      link: "",
    });
    setEditingNewsId(null);
    setIsEditMode(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">News</h1>

      <div className="flex justify-between mb-4">
        <Input
          type="text"
          placeholder="Search News..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-1/3"
        />
        <Button
          className="bg-blue-500 text-white ml-4 flex w-48 justify-center text-lg"
          onClick={() => {
            setIsEditMode(false);
            setIsDialogOpen(true);
          }}
        >
          Create News +
        </Button>
      </div>

      <Table
        headers={["Date", "Article Link", "Title", "Article Image", "Actions"]}
        data={filteredNews}
        onEdit={handleEdit}
        onDelete={openDeleteDialog}
      />

      <Dialog
        isOpen={isDialogOpen}
        onClose={closeDialog}
        title={isEditMode ? "Edit News Item" : "Create News Item"}
        footer={
          <>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleSaveNews}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Title"
            value={newNews.title}
            onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
          />
          <Input
            type="text"
            placeholder="Source"
            value={newNews.source}
            onChange={(e) => setNewNews({ ...newNews, source: e.target.value })}
          />
          <Input
            type="date"
            value={newNews.date}
            onChange={(e) => setNewNews({ ...newNews, date: e.target.value })}
          />
          <Input
            type="text"
            placeholder="Article Link"
            value={newNews.link}
            onChange={(e) => setNewNews({ ...newNews, link: e.target.value })}
          />
          <Input
            type="text"
            placeholder="Image URL"
            value={newNews.image}
            onChange={(e) => setNewNews({ ...newNews, image: e.target.value })}
          />
        </div>
      </Dialog>

      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Confirm Delete"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteNews}>
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete this news item?</p>
      </Dialog>
    </div>
  );
}
