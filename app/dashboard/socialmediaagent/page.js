"use client"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { useEffect, useState } from "react";

export default function Page() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("");
  const limit = 20;

  useEffect(() => {
    const timeout = setTimeout(() => {
      const fetchAgents = async () => {
        setLoading(true);
        setError(null);
        try {
          let url = `/api/socialmediaperson?page=${page}&limit=${limit}`;
          if (filter) url += `&filter=${encodeURIComponent(filter)}`;
          
          const response = await fetch(url);
          if (response.ok) {
            const { data, total } = await response.json();
            setAgents(data);
            setTotal(total);
          } else {
            const errorData = await response.json().catch(() => ({}));
            setError(errorData.error || 'Failed to fetch social media agents');
          }
        } catch (error) {
          console.error('Error fetching social media agents:', error);
          setError('Error fetching social media agents: ' + error.message);
        } finally {
          setLoading(false);
        }
      };
      fetchAgents();
    }, 300);
    return () => clearTimeout(timeout);
  }, [page, filter]);

  const totalPages = Math.ceil(total / limit);

  if (loading && agents.length === 0) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading social media agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <DataTable columns={columns} data={agents}>
        <h1 className="text-3xl font-semibold">Social Media Agents</h1>
        <input
          placeholder="Filter agents..."
          value={filter}
          onChange={e => { setPage(1); setFilter(e.target.value); }}
          className="max-w-sm bg-gray-100 shadow-sm border px-2 py-1 rounded ml-4"
        />
      </DataTable>
      
      {!loading && !error && (
        <div className="flex justify-center mt-6 gap-2">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))} 
            disabled={page === 1} 
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-2 py-1">Page {page} of {totalPages || 1}</span>
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
            disabled={page === totalPages} 
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
      
      {loading && agents.length > 0 && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mx-auto"></div>
          <span className="ml-2 text-sm text-gray-600">Updating...</span>
        </div>
      )}
      
      {error && (
        <div className="text-center py-4">
          <div className="text-red-600 bg-red-50 border border-red-200 rounded p-4 max-w-md mx-auto">
            <p className="font-medium">Error loading social media agents</p>
            <p className="text-sm mt-1">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
