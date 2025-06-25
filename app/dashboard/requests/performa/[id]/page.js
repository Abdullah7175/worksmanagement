"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import QRCode from 'react-qr-code';
import { useSession } from 'next-auth/react';

const Page = () => {
    const [data, setData] = useState(null);
    const [performaDate, setPerformaDate] = useState('');
    const [showDateModal, setShowDateModal] = useState(true);
    const [shootDate, setShootDate] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();
    const params = useParams();
    const router = useRouter();
    const requestId = params.id;
    const { data: session } = useSession();
    const currentUserName = session?.user?.name || 'N/A';

    useEffect(() => {
        const Getdata = async () => {
            if (requestId) {
                try {
                    const response = await fetch(`/api/requests?id=${requestId}`);
                    const data = await response.json();
                    setData(data);
                    setShootDate(data.shoot_date || '');
                } catch (error) {
                    console.error('Error fetching performa data:', error);
                    toast({
                        title: "Error fetching performa data",
                        description: '',
                        variant: 'destructive'
                    });
                }
            }
        };
        Getdata();
    }, [requestId, toast]);

    useEffect(() => {
        if (data && !performaDate) {
            setPerformaDate(new Date().toISOString().slice(0, 10));
        }
    }, [data]);

    const handleDateSelect = (e) => {
        setPerformaDate(e.target.value);
    };

    const handleShootDateChange = (e) => {
        setShootDate(e.target.value);
    };

    const handleSaveShootDate = async () => {
        setIsSaving(true);
        try {
            const response = await fetch(`/api/requests`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: requestId, shoot_date: shootDate })
            });
            if (response.ok) {
                toast({ title: 'Shoot date updated', variant: 'success' });
            } else {
                toast({ title: 'Failed to update shoot date', variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: 'Error updating shoot date', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    if (!data) return <div>Loading...</div>;

    // Helper functions to get videographer, assistant, etc. (mocked for now)
    const videographer = data.videographer_name || 'N/A'; // You may need to fetch this from related tables
    const assistant = data.assistant_name || 'N/A'; // You may need to fetch this from related tables
    const videoLink = data.final_video_link || 'N/A'; // You may need to fetch this from final_videos

    // Modal for selecting performa date
    if (showDateModal) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <h2 className="text-lg font-bold mb-4">Select Performa Date</h2>
                    <input
                        type="date"
                        value={performaDate}
                        onChange={handleDateSelect}
                        className="border px-3 py-2 rounded-md mb-4"
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md"
                            onClick={() => setShowDateModal(false)}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='justify-center w-11/12 m-auto my-10 border rounded-2xl bg-gray-50 py-5 print:w-full print:m-0 print:rounded-none print:border-0'>
            <div className='lg:flex items-center lg:justify-between px-5 mt-2'>
                <div className='w-[90%] m-auto'>
                    <h1 className='font-bold text-lg'>KW&SC Works Video Record Performance (Form-B)</h1>
                    <p className='font-medium'>For The Repair & Maintenance</p>
                    <div className='flex gap-4 font-bold'>Assign to: <p className='font-light'>Media Cell</p></div>
                    <div className='flex gap-4 font-bold'>Date: <p className='font-light'>{performaDate}</p></div>
                    <div className='flex gap-4 font-bold'>Case No: <p className='font-light'>{requestId}</p></div>
                </div>
                <div className="gap-2 justify-center">
                    <Image src="/logo.png" className="sm:m-auto py-2 px-1" width="90" height="90" alt="logo" />
                    <div className='w-40 flex items-start justify-start'>
                        <div className='items-start flex'>Ref:</div><div className="border-t-2 ml-2 mt-4 border-black w-full mx-auto"></div>
                    </div>
                </div>
            </div>

            <h1 className='flex items-center justify-center font-bold text-2xl my-4'>Work Particulars</h1>

            <div className='lg:flex px-5 gap-8'>
                <table className='table-auto sm:w-full lg:w-1/2 border border-gray-300 rounded-lg shadow-md'>
                    <tbody>
                        {[
                            ["Town", data.town_name || 'N/A'],
                            ["ExEn", data.executive_engineer_name || 'N/A'],
                            ["Nature of Work", data.nature_of_work || 'N/A'],
                            ["District", data.district_name || 'N/A'],
                            ["Videographer", videographer],
                            ["Shoot Date",
                                <div className="flex items-center gap-2">
                                    <input
                                        type="date"
                                        value={shootDate}
                                        onChange={handleShootDateChange}
                                        className="border px-2 py-1 rounded-md"
                                    />
                                    <button
                                        className="px-2 py-1 bg-indigo-600 text-white rounded-md text-xs"
                                        onClick={handleSaveShootDate}
                                        disabled={isSaving}
                                    >
                                        Save
                                    </button>
                                </div>
                            ],
                            ["Status", data.status_name || 'N/A'],
                            ["Video Link", videoLink],
                            ["B.G #", data.budget_code || 'N/A'],
                        ].map(([label, value], index) => (
                            <tr key={index} className={index % 2 === 0 ? "bg-gray-100" : ""}>
                                <td className='px-4 py-2 font-medium border border-gray-300'>{label}:</td>
                                <td className="px-4 py-2 border border-gray-300">{value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <table className='table-auto sm:w-full lg:w-1/2 border border-gray-300 rounded-lg shadow-md'>
                    <tbody>
                        {[
                            ["Work Location", data.address || 'N/A'],
                            ["Contact", data.contact_number || 'N/A'],
                            ["Department", data.complaint_type || 'N/A'],
                            ["Completion Date", performaDate],
                            // ["Completion Date", data.completion_date ? new Date(data.completion_date).toLocaleDateString() : 'N/A'],
                            ["Assistant", currentUserName],
                            ["Geo Tag", data.latitude && data.longitude ? `${data.latitude}, ${data.longitude}` : 'N/A'],
                            ["Contractor", data.contractor_name || 'N/A'],
                            ["QR Code",
                                <QRCode
                                    style={{ height: "auto", maxWidth: "35%", }}
                                    viewBox={`0 0 150 150`}
                                    value={window.location.href}></QRCode> || 'N/A'],
                        ].map(([label, value], index) => (
                            <tr key={index} className={index % 2 === 0 ? "bg-gray-100" : ""}>
                                <td className='px-4 py-2 font-medium border border-gray-300'>{label}:</td>
                                <td className="px-4 py-2 border border-gray-300">{value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className='flex items-center justify-center gap-[23rem] mt-12'>
                <div className="text-center">
                    <div className="inline-block text-center mt-2">
                        <div className="border-t-2 border-black w-full mx-auto mb-2"></div>
                        <p className="text-sm mt-2 font-bold">Issued By</p>
                    </div>
                </div>

                <div className="text-center">
                    <div className="inline-block text-center mt-2">
                    <div className="border-t-2 border-black w-full mx-auto mb-2"></div>
                        <p className="text-sm mt-2 font-bold">Incharge(SWMC)</p>
                    </div>
                </div>
                <div className="text-center">
                    <div className="inline-block text-center mt-2">
                    <div className="border-t-2 border-black w-full mx-auto mb-2"></div>
                        <p className="text-sm mt-2 font-bold">ExEn (Name & Sign)</p>
                    </div>
                </div>
                {/* <div className="text-center">
                    <div className="inline-block text-center mt-2">
                        <div className="border-t-2 border-black w-full mx-auto mb-2"></div>
                        <p className="text-sm mt-2 font-bold">Assistant: {currentUserName}</p>
                    </div>
                </div> */}
            </div>
        </div>
        
    );
};

export default Page; 