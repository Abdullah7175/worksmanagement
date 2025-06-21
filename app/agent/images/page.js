"use client"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function Page() {
  const { data: session } = useSession();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchImages = async () => {
      try {
        const response = await fetch(`/api/images?creator_id=${session.user.id}&creator_type=agent`, { method: 'GET' });
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
  }, [session?.user?.id]);

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