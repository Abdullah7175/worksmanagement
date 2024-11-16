"use client"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { useEffect, useState } from "react";

export default function Page() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/agents', { method: 'GET' });

        if (response.ok) {
          const data = await response.json();
          console.log('Fetched Users:', data);
          setAgents(data);
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

    fetchAgents();
  }, []);

  
  return (
    <div className="container mx-auto px-4 py-10">
      <DataTable columns={columns} data={agents}>
        <h1 className="text-3xl font-semibold">Agents</h1>
      </DataTable>
    </div>
  )
}
