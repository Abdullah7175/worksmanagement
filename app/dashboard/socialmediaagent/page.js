"use client"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { useEffect, useState } from "react";

export default function Page() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/socialmediaperson', { method: 'GET' });
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched Videographer:', data);
          setVideos(data);
        } else {
          setError('Failed to fetch Videographer');
        }
      } catch (error) {
        console.error('Error fetching Videographer:', error);
        setError('Error fetching Videographer');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  
  return (
    <div className="container mx-auto px-4 py-10">
      <DataTable columns={columns} data={videos}>
        <h1 className="text-3xl font-semibold">Social Media Agent</h1>
      </DataTable>
    </div>
  )
}
