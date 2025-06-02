"use client"
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { DataTable } from './data-table';
import { columns } from './columns';

const RequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const token = localStorage.getItem('jwtToken');
                const res = await fetch('/api/requests', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!res.ok) {
                    throw new Error('Failed to fetch requests');
                }
                
                const data = await res.json();
                setRequests(data);
            } catch (error) {
                console.error('Error fetching requests:', error);
                setError(error.message);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [router]);

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
            <div className="bg-white rounded-lg shadow">
                <DataTable columns={columns} data={requests} />
            </div>
        </div>
    );
};

export default RequestsPage;