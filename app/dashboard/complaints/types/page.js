"use client"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { useEffect, useState } from "react";

export default function Page() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await fetch('/api/complaints/types', { method: 'GET' });

        if (response.ok) {
          const data = await response.json();
          console.log('Fetched Users:', data);
          setTypes(data);
        } else {
          setError('Failed to fetch users');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Error fetching users');
      } finally {
        setLoading(false);
      }
    };

    fetchTypes();
  }, []);

  
  return (
    <div className="container mx-auto px-4 py-10">
      <DataTable columns={columns} data={types}>
        <h1 className="text-3xl font-semibold">Types</h1>
      </DataTable>
    </div>
  )
}
