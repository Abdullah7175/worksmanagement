"use client"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { useEffect, useState } from "react";
import { Input } from '@/components/ui/input';

export default function Page() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        let url = '/api/videos';
        const params = [];
        if (search) params.push(`filter=${encodeURIComponent(search)}`);
        if (dateFrom) params.push(`date_from=${dateFrom}`);
        if (dateTo) params.push(`date_to=${dateTo}`);
        if (params.length) url += '?' + params.join('&');
        const response = await fetch(url, { method: 'GET' });
        if (response.ok) {
          const data = await response.json();
          setVideos(data.data || data || []);
        } else {
          setError('Failed to fetch videos');
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
        setError('Error fetching videos');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [search, dateFrom, dateTo]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <Input
          placeholder="Search by ID, address, description..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-64"
        />
        <div>
          <label className="block text-xs text-gray-500 mb-1">From</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">To</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="border rounded px-2 py-1" />
        </div>
      </div>
      <DataTable columns={columns} data={videos}>
        <h1 className="text-3xl font-semibold">Videos</h1>
      </DataTable>
    </div>
  )
}