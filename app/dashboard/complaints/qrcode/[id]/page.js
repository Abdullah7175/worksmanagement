'use client'
import React from 'react';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Separator } from '@radix-ui/react-dropdown-menu';

const Page = () => {
    const [data, setData] = useState([]);
    const { toast } = useToast();
    const params = useParams();
    const complaintId = params.id;

    const chunkData = (array, chunkSize) => {
        const result = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            result.push(array.slice(i, i + chunkSize));
        }
        return result;
    };
    const chunkedData = chunkData(data, 10);
    useEffect(() => {
        const Getdata = async () => {
            if (complaintId) {
                try {
                    const response = await fetch(`/api/complaints/getcomplaint?id=${complaintId}`);
                    const data = await response.json();
                    const objectArray = Object.entries(data).map(([key, value]) => ({ key, value }));
                    console.log(objectArray);
                    setData(objectArray)


                } catch (error) {
                    console.error('Error fetching complaint data:', error);
                    toast({
                        title: "Error fetching complaint data",
                        description: '',
                        variant: 'destructive'
                    });
                }
            }
        }
        Getdata();
    }, [complaintId, toast])

    const HandleSubmit = () => {


    }

    return (
        <>
            <div className='justify-center w-11/12  m-auto mt-10 border rounded-2xl'>
                <div className='flex justify-between px-5 mt-10'>
                    <div>
                        <h1 className='font-bold'>KW&SC Works Video Record Performance (Form-B)</h1>
                        <p className='font-bold'>Social Media Wing</p>
                        <p className='font-bold'>For The Repair & Maintainance</p>
                        <div className='flex gap-4 font-bold'>Assign to:<p className='font-light'>Social Media Wing</p></div>
                        <div className='flex gap-4 font-bold'>Date:<p className='font-light'>2-Sept-24</p></div>
                        <div className='flex gap-4 font-bold'>Case No:<p className='font-light'>{complaintId}</p></div>

                    </div>
                    <div className=" gap-2 justify-center">
                        <Image src="/logo.png" className="py-2 px-1" width="90" height="90" alt="logo" />
                        <div className='w-40 flex items-start justify-start'>
                            <div className='items-start flex gap-5'>Ref:</div><div className='items-center'>_______</div>
                        </div>
                    </div>
                </div>
                <div className='flex px-5'>
                    <div className=' w-1/2'>
                        {chunkedData.map((chunk, columnIndex) => (
                            <div key={columnIndex} className="flex flex-col gap-2">
                                {chunk.map((item, index) => (
                                    <div key={index} className="flex">
                                        <strong className="pr-2">{item.key}:</strong>
                                        <span>{item.value ? item.value : 'N/A'}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className='bg-green-50 w-1/2'>
                        <p>Hello</p>
                    </div>
                </div>
            </div>



        </>
    )
}

export default Page