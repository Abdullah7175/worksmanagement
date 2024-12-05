'use client'
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import QRCode from 'react-qr-code';

const Page = () => {
    const [data, setData] = useState([]);
    const { toast } = useToast();
    const params = useParams();
    const complaintId = params.id;

    
    useEffect(() => {
        const Getdata = async () => {
            if (complaintId) {
                try {
                    const response = await fetch(`/api/complaints/performa?id=${complaintId}`);
                    const data = await response.json();
                    const objectArray = Object.entries(data).map(([key, value]) => ({ key, value }));
                    console.log(objectArray);
                    
                    setData(objectArray);
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
    }, [complaintId, toast]);

    return (
        <div className='justify-center w-11/12 m-auto my-10 border rounded-2xl bg-gray-50 py-5'>
            <div className='lg:flex items-center lg:justify-between px-5 mt-2'>
                <div className='w-[90%] m-auto'>
                    <h1 className='font-bold text-lg'>KW&SC Works Video Record Performance (Form-B)</h1>
                    <p className='font-medium'>Social Media Wing</p>
                    <p className='font-medium'>For The Repair & Maintenance</p>
                    <div className='flex gap-4 font-bold'>Assign to: <p className='font-light'>Social Media Wing</p></div>
                    <div className='flex gap-4 font-bold'>Date: <p className='font-light'>2-Sept-24</p></div>
                    <div className='flex gap-4 font-bold'>Case No: <p className='font-light'>{complaintId}</p></div>
                </div>
                <div className="gap-2 justify-center">
                    <Image src="/logo.png" className="sm:m-auto py-2 px-1" width="90" height="90" alt="logo" />
                    <div className='w-40 flex items-start justify-start'>
                        <div className='items-start flex'>Ref:</div><div className='items-center gap-2 border-b-4 border-black'></div>
                    </div>
                </div>
            </div>

            <h1 className='flex items-center justify-center font-bold text-2xl my-4'>Work Particulars</h1>

            <div className='lg:flex px-5 gap-8'>
                <table className='table-auto sm:w-full lg:w-1/2 border border-gray-300 rounded-lg shadow-md'>
                    <tbody>
                        {[
                            ["Town", data[2]?.value || 'N/A'],
                            ["ExEn", data[8]?.value || 'N/A'],
                            ["Nature of Work", data[15]?.value || 'N/A'],
                            ["District", data[3]?.value || 'N/A'],
                            ["Videographer", data[11]?.value || 'N/A'],
                            ["Shoot Date", data[5]?.value || 'N/A'],
                            ["Status", data[17]?.value==1?'Completed':'In Progress' || 'N/A'],
                            ["Video Link", data[13]?.value || 'N/A'],
                            ["B.G #", data[14]?.value || 'N/A'],
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
                            ["Work Location", data[4]?.value || 'N/A'],
                            ["Contact", data[10]?.value || 'N/A'],
                            ["Department", data[9]?.value || 'N/A'],
                            ["Completion Date", data[6]?.value || 'N/A'],
                            ["Assistant", 'Ayaan' || 'N/A'],
                            ["Geo Tag", data[7]?.value || 'N/A'],
                            ["Contractor", data[22]?.value || 'N/A'],
                            ["QR Code",
                            <QRCode
                            style={{ height: "auto", maxWidth: "35%", }}
                            viewBox={`0 0 150 150`}
                             value={'link'}></QRCode> || 'N/A'],
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
