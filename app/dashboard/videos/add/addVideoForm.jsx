"use client"

import React, { useState,useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useVideoContext } from '../VideoContext';
import { useToast } from "@/hooks/use-toast";
import { MapPin } from 'lucide-react';
// import { Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
// import { SearchableDropdown } from '@/components/SearchableDropdown';
import { useRouter } from 'next/navigation'; // or 'next/router' if using pages router



const validationSchema = Yup.object({
    workRequestId: Yup.number().required('Work Request ID is required'),
    description: Yup.string().required('Description is required'),
    vid: Yup.mixed().required('Video file is required')
});

const VideoForm = () => {
    const { video, updateVideo } = useVideoContext();
    const { toast } = useToast();
    const [isSuccess, setIsSuccess] = useState(false);
    const [preview, setPreview] = useState(null);
    const [size, setSize] = useState(null);
    const [workRequests, setWorkRequests] = useState([]);
    const [loadingWorkRequests, setLoadingWorkRequests] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchWorkRequests = async () => {
            try {
                const response = await fetch('/api/videos/work-request');
                if (response.ok) {
                    const data = await response.json();
                    setWorkRequests(data.map(request => ({
                        value: Number(request.id),
                        label: `${request.id}`
                        // - ${request.address} (${new Date(request.request_date).toLocaleDateString()})
                    })));
                }
            } catch (error) {
                console.error('Error fetching work requests:', error);
                toast({
                    title: 'Failed to load work requests',
                    description: 'Please try again later',
                    variant: 'destructive',
                });
            } finally {
                setLoadingWorkRequests(false);
            }
        };

        fetchWorkRequests();
    }, [toast]);

    const formik = useFormik({
        initialValues: {
            workRequestId: video?.workRequestId || '',
            description: video?.description || '',
            vid: null, // always reset to null for new uploads
            geo_tag: video?.geo_tag || '',
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            const formData = new FormData();
            formData.append('workRequestId', values.workRequestId);
            formData.append('description', values.description);
            formData.append('geo_tag', values.geo_tag || '');

            if (!values.vid) {
                formik.setFieldTouched('vid', true, false);
                return; // prevent submission
            }
            formData.append('vid', values.vid);


            try {
                const response = await fetch('/api/videos/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    toast({
                        title: 'Video uploaded successfully',
                        description: `Video added to work request ${values.workRequestId}`,
                        variant: 'success',
                    });
                    setIsSuccess(true);
                } else {
                    const errorData = await response.json();
                    toast({
                        title: 'Failed to upload video',
                        description: errorData.error || 'Please try again.',
                        variant: 'destructive',
                    });
                }
            } catch (error) {
                console.error('Error uploading video:', error);
                toast({
                    title: 'An error occurred',
                    description: 'Unable to upload video.',
                    variant: 'destructive',
                });
            }
        },        
    });

    useEffect(() => {
    if (isSuccess) {
        router.push('/dashboard/videos');
    }
}, [isSuccess, router]);


    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            formik.setFieldValue('vid', file);
            setPreview(file);
            
            const sizeInMB = file.size / (1024 * 1024);
            const formattedSize = Math.round(sizeInMB * 100) / 100;
            setSize(formattedSize);
        }
    };

    return (
        <div className='container'>
            <form onSubmit={formik.handleSubmit} className="max-w-7xl mx-auto p-6 bg-white shadow-sm rounded-lg space-y-6 border">
                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8">
                                       
                    <div>
                        <label htmlFor="workRequestId" className="block text-gray-700 text-sm font-medium">
                            Work Request
                        </label>
                        <select
                            id="workRequestId"
                            name="workRequestId"
                            value={formik.values.workRequestId}
                            onChange={e => formik.setFieldValue('workRequestId', Number(e.target.value))}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                            >
                            <option value="">Select a work request...</option>
                            {workRequests.map((req) => (
                                <option key={req.value} value={req.value}>
                                {req.label}
                                </option>
                            ))}
                            </select>
                        {formik.errors.workRequestId && formik.touched.workRequestId && (
                            <div className="text-red-600 text-sm mt-2">{formik.errors.workRequestId}</div>
                        )}
                    </div>
                    
                    <div>
                        <label htmlFor="description" className="block text-gray-700 text-sm font-medium">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            onChange={formik.handleChange}
                            value={formik.values.description}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            rows="3"
                        />
                        {formik.errors.description && formik.touched.description && (
                            <div className="text-red-600 text-sm mt-2">{formik.errors.description}</div>
                        )}
                    </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                <label htmlFor="geo_tag" className="block text-gray-700 text-sm font-medium">
                    Location (Geo Tag)
                </label>
                <div className="mt-1 flex items-center gap-2">
                    <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => {
                        // Implement your geotagging functionality here
                        // This could open a map modal or use browser geolocation
                        navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const { latitude, longitude } = position.coords;
                            formik.setFieldValue(
                            'geo_tag',
                            `POINT(${longitude} ${latitude})`
                            );
                            toast({
                            title: 'Location captured',
                            description: `Lat: ${latitude}, Lng: ${longitude}`,
                            variant: 'success',
                            });
                        },
                        (error) => {
                            toast({
                            title: 'Geolocation error',
                            description: error.message,
                            variant: 'destructive',
                            });
                        }
                        );
                    }}
                    >
                    <MapPin className="h-4 w-4" />
                    Capture Location
                    </Button>
                    {formik.values.geo_tag && (
                    <span className="text-sm text-gray-600">
                        Location captured
                    </span>
                    )}
                </div>
                {formik.errors.geo_tag && formik.touched.geo_tag && (
                    <div className="text-red-600 text-sm mt-2">{formik.errors.geo_tag}</div>
                )}
                </div>
                
                <div>
                    <label htmlFor="vid" className="block text-gray-700 text-sm font-medium">Upload Video</label>
                    <div className="mt-1">
                        <input
                            id="vid"
                            name="vid"
                            type="file"
                            accept="video/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <label htmlFor="vid" className="cursor-pointer inline-block bg-gray-100 text-gray-500 border-3 font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            Choose a video
                        </label>
                        {formik.values.vid && (
                            <div className="mt-2 text-gray-700 text-sm">
                                <span className="font-medium">Selected File:</span> {formik.values.vid.name}
                                <div className="font-medium">Size: {size} MB</div>
                            </div>
                        )}
                    </div>
                    {formik.errors.vid && formik.touched.vid && (
                        <div className="text-red-600 text-sm mt-2">{formik.errors.vid}</div>
                    )}
                </div>

                <div className='flex justify-end'>
                    <button
                        type="submit"
                        className="px-4 py-2 mt-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        Add Video
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VideoForm;