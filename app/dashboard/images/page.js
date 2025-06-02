"use client"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { useEffect, useState } from "react";

export default function Page() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('/api/images', { method: 'GET' });
        if (response.ok) {
          const data = await response.json();
          setImages(data);
        } else {
          setError('Failed to fetch images');
        }
      } catch (error) {
        console.error('Error fetching images:', error);
        setError('Error fetching images');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-10">
      <DataTable columns={columns} data={images}>
        <h1 className="text-3xl font-semibold">Images</h1>
      </DataTable>
    </div>
  )
}