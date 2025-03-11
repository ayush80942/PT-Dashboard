"use client";

import { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/Table";
import { Dialog } from "@/components/Dialog";
import { db } from "@/lib/firebase";

interface Lead {
  id: string;
  category: string;
  company: string;
  email: string;
  message: string;
  name: string;
  phone: string;
  status?: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    const leadsRef = ref(db, "inquiries");

    onValue(leadsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data: Lead[] = Object.entries(snapshot.val()).map(([id, value]) => {
          const lead = value as Omit<Lead, "id">;
          // If status is not provided, default to "New"
          return { id, ...lead, status: lead.status || "New" };
        });

        // Sort by timestamp (assuming id format is DD-MM-YYYYHH-MM-SS)
        const sortedData = data.sort((a, b) => b.id.localeCompare(a.id));
        setLeads(sortedData);
      }
    });
  }, []);

  const filteredLeads = leads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update lead status in Firebase when Save is clicked in the dialog.
  const handleSaveLeadStatus = () => {
    if (selectedLead) {
      const leadRef = ref(db, `inquiries/${selectedLead.id}`);
      update(leadRef, { status: selectedLead.status }).then(() => {
        setSelectedLead(null);
      });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Leads List</h1>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search Leads..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-1/3"
        />
      </div>

      <Table
        headers={["Name", "Email", "Category", "Company", "Phone", "Message", "Status"]}
        data={filteredLeads}
        onRowClick={(row) => setSelectedLead(row)}
      />

      {/* Full Data Dialog with Status Update */}
      <Dialog
        isOpen={selectedLead !== null}
        onClose={() => setSelectedLead(null)}
        title="Lead Details"
        footer={
          <>
            <Button variant="outline" onClick={() => setSelectedLead(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveLeadStatus}>Save</Button>
          </>
        }
      >
        {selectedLead && (
          <div className="space-y-2">
            <p>
              <strong>Name:</strong> {selectedLead.name}
            </p>
            <p>
              <strong>Email:</strong> {selectedLead.email}
            </p>
            <p>
              <strong>Category:</strong> {selectedLead.category}
            </p>
            <p>
              <strong>Company:</strong> {selectedLead.company}
            </p>
            <p>
              <strong>Phone:</strong> {selectedLead.phone}
            </p>
            <p>
              <strong>Message:</strong> {selectedLead.message}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <select
                value={selectedLead.status}
                onChange={(e) =>
                  setSelectedLead({ ...selectedLead, status: e.target.value })
                }
                className="border p-1 rounded"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Nurturing">Nurturing</option>
                <option value="Closed">Closed</option>
              </select>
            </p>
          </div>
        )}
      </Dialog>
    </div>
  );
}
