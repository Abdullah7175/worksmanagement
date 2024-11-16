"use client"

import { useEffect, useState } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default function Page() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users', { method: 'GET' });
        console.log(response)
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched Users:', data);
          setUsers(data);
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

    fetchUsers();
  }, []);

  

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <DataTable columns={columns} data={users}>
        <h1 className="text-3xl font-semibold">Users</h1>
      </DataTable>
    </div>

  );
}
