// app/dashboard/requests/[id]/edit/page.jsx
"use client"

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { RequestForm } from "@/app/dashboard/requests/add/RequestForm";
import { Button } from '@/components/ui/button';

const EditRequestPage = () => {
    const { id } = useParams();
    const [requestData, setRequestData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const fetchRequest = async () => {
            try {
                const res = await fetch(`/api/requests?id=${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setRequestData(data);
                } else {
                    throw new Error('Failed to fetch request');
                }
            } catch (error) {
                console.error('Error fetching request:', error);
                toast({
                    title: "Error",
                    description: "Failed to load request data",
                    variant: "destructive"
                });
                router.push('/dashboard/requests');
            } finally {
                setLoading(false);
            }
        };

        fetchRequest();
    }, [id, router, toast]);

    const handleSubmit = async (values) => {
        try {
            const response = await fetch(`/api/requests`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id,
                    ...values
                }),
            });

            if (response.ok) {
                toast({
                    title: "Request updated successfully",
                    variant: 'success',
                });
                router.push('/dashboard/requests');
            } else {
                throw new Error('Failed to update request');
            }
        } catch (error) {
            console.error('Error updating request:', error);
            toast({
                title: "Error",
                description: "Failed to update request",
                variant: 'destructive',
            });
        }
    };

    if (loading) {
        return <div className="container mx-auto py-6">Loading request data...</div>;
    }

    if (!requestData) {
        return <div className="container mx-auto py-6">Request not found</div>;
    }

    return (
        <div className="container mx-auto py-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Edit Work Request</h1>
                <Button 
                    variant="outline" 
                    onClick={() => router.push('/dashboard/requests')}
                >
                    Back to Requests
                </Button>
            </div>
            <RequestForm 
                initialValues={{
                    town_id: requestData.town_id,
                    subtown_id: requestData.subtown_id || '',
                    complaint_type_id: requestData.complaint_type_id,
                    complaint_subtype_id: requestData.complaint_subtype_id || '',
                    contact_number: requestData.contact_number,
                    address: requestData.address,
                    description: requestData.description,
                    latitude: requestData.latitude,
                    longitude: requestData.longitude,
                }}
                onSubmit={handleSubmit}
                isEditMode={true}
            />
        </div>
    );
};

export default EditRequestPage;