'use client'
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

const Page = () => {
    const [data, setData] = useState([]);
    const { toast } = useToast();
    const params = useParams();
    const complaintId = params.id;

    useEffect(() => {
        const Getdata = async () => {
            if (complaintId) {
                try {
                    const response = await fetch(`/api/complaints/getcomplaint?id=${complaintId}`);
                    const data = await response.json();
                    const objectArray = Object.entries(data).map(([key, value]) => ({ key, value }));
                    setData(objectArray);
                } catch (error) {
                    console.error('Error fetching complaint data:', error);
                    toast({
                        title: "Error fetching complaint data",
                        description: '',
                        variant: 'destructive'
                    });
                }
            }
        };
        Getdata();
    }, [complaintId, toast]);

    return (
        <div className='justify-center w-11/12 m-auto my-10 border rounded-2xl bg-gray-50 py-5'>
            <div className='flex justify-between px-5 mt-2'>
                <div>
                    <h1 className='font-bold text-lg'>KW&SC Works Video Record Performance (Form-B)</h1>
                    <p className='font-medium'>Social Media Wing</p>
                    <p className='font-medium'>For The Repair & Maintenance</p>
                    <div className='flex gap-4 font-bold'>Assign to: <p className='font-light'>Social Media Wing</p></div>
                    <div className='flex gap-4 font-bold'>Date: <p className='font-light'>2-Sept-24</p></div>
                    <div className='flex gap-4 font-bold'>Case No: <p className='font-light'>{complaintId}</p></div>
                </div>
                <div className="gap-2 justify-center">
                    <Image src="/logo.png" className="py-2 px-1" width="90" height="90" alt="logo" />
                    <div className='w-40 flex items-start justify-start'>
                        <div className='items-start flex'>Ref:</div><div className='items-center gap-2'>_______</div>
                    </div>
                </div>
            </div>

            <h1 className='flex items-center justify-center font-bold text-2xl my-4'>Work Particulars</h1>

            <div className='flex px-5 gap-8'>
                <table className='table-auto w-1/2 border border-gray-300 rounded-lg shadow-md'>
                    <tbody>
                        {[
                            ["Town", data[3]?.value || 'N/A'],
                            ["ExEn", data[3]?.value || 'N/A'],
                            ["Nature of Work", data[3]?.value || 'N/A'],
                            ["Start Date of Work", data[3]?.value || 'N/A'],
                            ["Videographer", data[3]?.value || 'N/A'],
                            ["Shoot Date", data[3]?.value || 'N/A'],
                            ["Status", data[3]?.value || 'N/A'],
                            ["Video Link", data[3]?.value || 'N/A'],
                            ["B.G #", data[3]?.value || 'N/A'],
                        ].map(([label, value], index) => (
                            <tr key={index} className={index % 2 === 0 ? "bg-gray-100" : ""}>
                                <td className='px-4 py-2 font-medium border border-gray-300'>{label}:</td>
                                <td className="px-4 py-2 border border-gray-300">{value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <table className='table-auto w-1/2 border border-gray-300 rounded-lg shadow-md'>
                    <tbody>
                        {[
                            ["Work Location", data[3]?.value || 'N/A'],
                            ["Contact", data[3]?.value || 'N/A'],
                            ["Department", data[3]?.value || 'N/A'],
                            ["Completion Date", data[3]?.value || 'N/A'],
                            ["Assistant", data[3]?.value || 'N/A'],
                            ["Geo Tag", data[3]?.value || 'N/A'],
                            ["Contractor", data[3]?.value || 'N/A'],
                            ["QR Code", data[3]?.value || 'N/A'],
                        ].map(([label, value], index) => (
                            <tr key={index} className={index % 2 === 0 ? "bg-gray-100" : ""}>
                                <td className='px-4 py-2 font-medium border border-gray-300'>{label}:</td>
                                <td className="px-4 py-2 border border-gray-300">{value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Page;
