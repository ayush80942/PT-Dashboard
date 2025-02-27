"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/Table";
import { db } from "@/lib/firebase";

interface Lead {
  id: string;
  category: string;
  company: string;
  email: string;
  message: string;
  name: string;
  phone: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const leadsRef = ref(db, "inquiries");

    onValue(leadsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data: Lead[] = Object.entries(snapshot.val()).map(([id, value]) => {
          const lead = value as Omit<Lead, "id">;
          return { id, ...lead };
        });

        // Sort by timestamp (id is in format DD-MM-YYYYHH-MM-SS)
        const sortedData = data.sort((a, b) => b.id.localeCompare(a.id));
        setLeads(sortedData);
      }
    });
  }, []);

  // Filter leads based on search query
  const filteredLeads = leads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Leads</h1>

      <div className="flex justify-between mb-4">
        <Input
          type="text"
          placeholder="Search leads..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-1/3"
        />
        <Button className="bg-blue-500 text-white">Add Lead +</Button>
      </div>

      <Table 
  headers={["Name", "Email", "Category", "Company", "Phone", "Message"]}
  data={leads} 
/>
    </div>
  );
}
