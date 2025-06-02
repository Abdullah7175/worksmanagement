"use client"

import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useImageContext } from '../../ImageContext';
import { useToast } from "@/hooks/use-toast"
import { useRouter, useParams } from 'next/navigation';

const validationSchema = Yup.object({
    workRequestId: Yup.number().required('Work Request ID is required'),
    description: Yup.string().required('Description is required'),
});

const ImageForm = () => {
    const params = useParams()
    const imageId = params.id;
    const { image, updateImage } = useImageContext();
    const { toast } = useToast();
    const [initialValues, setInitialValues] = useState({
        workRequestId: '',
        description: '',
    });
    const router = useRouter();
    
    useEffect(() => {
        const fetchImage = async () => {
            if (imageId) {
                try {
                    const response = await fetch(`/api/images?id=${imageId}`);
                    if (response.ok) {
                        const data = await response.json();
                        setInitialValues({
                            workRequestId: data.work_request_id,
                            description: data.description,
                        });
                    } else {
                        toast({
                            title: "Failed to fetch image data",
                            variant: 'destructive'
                        });
                    }
                } catch (error) {
                    console.error('Error fetching image data:', error);
                    toast({
                        title: "Error fetching image data",
                        variant: 'destructive'
                    });
                }
            }
        };

        fetchImage();
    }, [imageId, toast]);

    const formik = useFormik({
        initialValues,
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            try {
                const response = await fetch(`/api/images`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        id: imageId,
                        workRequestId: values.workRequestId,
                        description: values.description 
                    }),
                });

                if (response.ok) {
                    toast({
                        title: "Image updated successfully",
                        variant: 'success',
                    });
                    router.push('/dashboard/images');
                } else {
                    toast({
                        title: "Failed to update image",
                        variant: 'destructive',
                    });
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                toast({
                    title: "An error occurred",
                    variant: 'destructive'
                });
            }
        },
    });

    return (
        <div className='container'>
            <form onSubmit={formik.handleSubmit} className="max-w-7xl mx-auto p-6 bg-white shadow-sm rounded-lg space-y-6 border">
                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label htmlFor="workRequestId" className="block text-gray-700 text-sm font-medium">
                            Work Request ID
                        </label>
                        <input
                            id="workRequestId"
                            name="workRequestId"
                            type="number"
                            onChange={formik.handleChange}
                            value={formik.values.workRequestId}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {formik.errors.workRequestId && formik.touched.workRequestId && (
                            <div className="text-red-600 text-sm mt-2">{formik.errors.workRequestId}</div>
                        )}
                    </div>
                    
                    <div>
                        <label htmlFor="description" className="block text-gray-700 text-sm font-medium">
                            Description
                        </label>
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

                <div className='flex justify-end'>
                    <button
                        type="submit"
                        className="px-4 py-2 mt-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        Update Image
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ImageForm;