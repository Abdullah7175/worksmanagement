"use client"
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { DataTable } from './data-table';
import { columns } from './columns';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';

const RequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const token = localStorage.getItem('jwtToken');
                let url = '/api/requests';
                const params = [];
                if (search) params.push(`filter=${encodeURIComponent(search)}`);
                if (dateFrom) params.push(`date_from=${dateFrom}`);
                if (dateTo) params.push(`date_to=${dateTo}`);
                if (params.length) url += '?' + params.join('&');
                const res = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!res.ok) {
                    throw new Error('Failed to fetch requests');
                }
                
                const data = await res.json();
                setRequests(data.data || []);
            } catch (error) {
                console.error('Error fetching requests:', error);
                setError(error.message);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [router, search, dateFrom, dateTo]);

    if (loading) {
        return <div className="container mx-auto py-6">Loading requests...</div>;
    }

    if (error) {
        return <div className="container mx-auto py-6">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Work Requests</h1>
                <Button onClick={() => router.push('/dashboard/requests/new')}>
                    Create New Request
                </Button>
            </div>
            <div className="flex flex-wrap gap-4 mb-4 items-end">
                <Input
                    placeholder="Search by ID, address, town, type, status, creator..."
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
            <div className="bg-white rounded-lg shadow">
                <DataTable columns={columns} data={requests} />
            </div>
        </div>
    );
};

export default RequestsPage;