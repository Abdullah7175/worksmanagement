"use client"

import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import Image from 'next/image';
import * as Yup from 'yup';
import { useImageContext } from '../ImageContext';
import { useToast } from "@/hooks/use-toast";
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const validationSchema = Yup.object({
    workRequestId: Yup.number().required('Work Request ID is required'),
    description: Yup.string().required('Description is required'),
    img: Yup.mixed().required('Image file is required')
});

const ImageForm = () => {
    const { image, updateImage } = useImageContext();
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
                const response = await fetch('/api/images/work-request');
                if (response.ok) {
                    const data = await response.json();
                    setWorkRequests(data.map(request => ({
                        value: Number(request.id),
                        label: `${request.id}`
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
            workRequestId: image?.workRequestId || '',
            description: image?.description || '',
            img: null,
            latitude: '',
            longitude: '',
            geo_tag: image?.geo_tag || '',
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            let geoTag = values.geo_tag;
            if (values.latitude && values.longitude) {
                geoTag = `POINT(${values.longitude} ${values.latitude})`;
            }
            const formData = new FormData();
            formData.append('workRequestId', values.workRequestId);
            formData.append('description', values.description);
            formData.append('geo_tag', geoTag || '');

            if (!values.img) {
                formik.setFieldTouched('img', true, false);
                return;
            }
            formData.append('img', values.img);

            try {
                const response = await fetch('/api/images', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    toast({
                        title: 'Image uploaded successfully',
                        description: `Image added to work request ${values.workRequestId}`,
                        variant: 'success',
                    });
                    setIsSuccess(true);
                } else {
                    const errorData = await response.json();
                    toast({
                        title: 'Failed to upload image',
                        description: errorData.error || 'Please try again.',
                        variant: 'destructive',
                    });
                }
            } catch (error) {
                console.error('Error uploading image:', error);
                toast({
                    title: 'An error occurred',
                    description: 'Unable to upload image.',
                    variant: 'destructive',
                });
            }
        },        
    });

    useEffect(() => {
        if (isSuccess) {
            router.push('/dashboard/images');
        }
    }, [isSuccess, router]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            formik.setFieldValue('img', file);
            setPreview(URL.createObjectURL(file));
            
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
                        navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const { latitude, longitude } = position.coords;
                            formik.setFieldValue('latitude', latitude);
                            formik.setFieldValue('longitude', longitude);
                            formik.setFieldValue('geo_tag', `POINT(${longitude} ${latitude})`);
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
                    <MapPin className="w-4 h-4" /> Get Location
                    </Button>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="latitude" className="block text-xs text-gray-600">Latitude</label>
                        <input
                            id="latitude"
                            name="latitude"
                            type="number"
                            step="any"
                            value={formik.values.latitude}
                            onChange={formik.handleChange}
                            className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md"
                            placeholder="Enter latitude"
                        />
                    </div>
                    <div>
                        <label htmlFor="longitude" className="block text-xs text-gray-600">Longitude</label>
                        <input
                            id="longitude"
                            name="longitude"
                            type="number"
                            step="any"
                            value={formik.values.longitude}
                            onChange={formik.handleChange}
                            className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md"
                            placeholder="Enter longitude"
                        />
                    </div>
                </div>
                </div>
                
                <div>
                    <label htmlFor="img" className="block text-gray-700 text-sm font-medium">Upload Image</label>
                    <div className="mt-1">
                        <input
                            id="img"
                            name="img"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <label htmlFor="img" className="cursor-pointer inline-block bg-gray-100 text-gray-500 border-3 font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            Choose an image
                        </label>
                        {formik.values.img && (
                            <div className="mt-2 text-gray-700 text-sm">
                                <span className="font-medium">Selected File:</span> {formik.values.img.name}
                                <div className="font-medium">Size: {size} MB</div>
                                {preview && (
                                    <div className="mt-2">
                                        <Image
                                            src={preview}
                                            alt="Preview"
                                            width={300}
                                            height={200}
                                            className="max-h-60 rounded-md border object-contain"
                                            />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    {formik.errors.img && formik.touched.img && (
                        <div className="text-red-600 text-sm mt-2">{formik.errors.img}</div>
                    )}
                </div>

                <div className='flex justify-end'>
                    <button
                        type="submit"
                        className="px-4 py-2 mt-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        Add Image
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ImageForm;