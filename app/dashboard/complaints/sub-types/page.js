"use client"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { useEffect, useState } from "react";

export default function Page() {
  const [subtypes, setSubtypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchSubtypes = async () => {
      try {
        const response = await fetch('/api/complaints/subtypes', { method: 'GET' });

        if (response.ok) {
          const data = await response.json();
          console.log('Fetched Subtypes:', data);
          setSubtypes(data);
        } else {
          setError('Failed to fetch subtypes');
        }
      } catch (error) {
        console.error('Error fetching subtypes:', error);
        setError('Error fetching users');
      } finally {
        setLoading(false);
      }
    };

    fetchSubtypes();
  }, []);

  
  return (
    <div className="container mx-auto px-4 py-10">
      <DataTable columns={columns} data={subtypes}>
        <h1 className="text-3xl font-semibold">Add Subtypes</h1>
      </DataTable>
    </div>
  )
}
