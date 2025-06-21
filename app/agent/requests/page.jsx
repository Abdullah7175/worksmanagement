"use client"
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { DataTable } from './data-table';
import { columns, getAgentRequestColumns } from './columns';
import { useSession } from 'next-auth/react';
import ImageForm from '../images/add/addImageForm';
import VideoForm from '../videos/add/addVideoForm';

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>
      {children}
    </div>
  </div>
);

const RequestsPage = () => {
    const { data: session } = useSession();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [showImageForm, setShowImageForm] = useState(false);
    const [showVideoForm, setShowVideoForm] = useState(false);

    useEffect(() => {
        if (!session?.user?.id) return;
        const fetchRequests = async () => {
            try {
                const res = await fetch(`/api/requests?creator_id=${session.user.id}&creator_type=agent&limit=1000`);
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
    }, [router, session?.user?.id]);

    if (loading) {
        return <div className="container mx-auto py-6">Loading requests...</div>;
    }

    if (error) {
        return <div className="container mx-auto py-6">Error: {error}</div>;
    }

    const columns = getAgentRequestColumns({
        onAddImage: (id) => {
            setSelectedRequestId(id);
            setShowImageForm(true);
        },
        onAddVideo: (id) => {
            setSelectedRequestId(id);
            setShowVideoForm(true);
        },
    });

    const closeForms = () => {
        setShowImageForm(false);
        setShowVideoForm(false);
        setSelectedRequestId(null);
    };

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Work Requests</h1>
                <Button onClick={() => router.push('/agent/requests/new')}>
                    Create New Request
                </Button>
            </div>
            <div className="bg-white rounded-lg shadow">
                <DataTable columns={columns} data={requests} />
            </div>
            {showImageForm && selectedRequestId && (
                <Modal onClose={closeForms}>
                  <ImageForm workRequestId={selectedRequestId} onClose={closeForms} />
                </Modal>
            )}
            {showVideoForm && selectedRequestId && (
                <Modal onClose={closeForms}>
                  <VideoForm workRequestId={selectedRequestId} onClose={closeForms} />
                </Modal>
            )}
        </div>
    );
};

export default RequestsPage;