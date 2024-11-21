"use client"

import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useVideoContext } from '../../VideoContext';
import { useToast } from "@/hooks/use-toast"
import { useRouter, useParams } from 'next/navigation';

const validationSchema = Yup.object({
    link: Yup.string()
    .min(3, 'Link must be at least 3 characters'),
});

const VideoForm = () => {
    const params = useParams()
    const videoId = params.id;
    const { video, updateVideo } = useVideoContext();
    const { toast } = useToast();
    const [initialValues, setInitialValues] = useState({
        link: '',
    });
    const router = useRouter();
    
    useEffect(() => {
        const fetchVideo = async () => {
            if (videoId) {
                try {
                    const response = await fetch(`/api/videos?id=${videoId}`);
                    if (response.ok) {
                        const data = await response.json();
                        
                        setInitialValues({
                            link: data.link,
                        });
                        
                    } else {
                        toast({
                            title: "Failed to fetch video data",
                            description: '',
                            variant: 'destructive'
                        });
                    }
                } catch (error) {
                    console.error('Error fetching video data:', error);
                    toast({
                        title: "Error fetching video data",
                        description: '',
                        variant: 'destructive'
                    });
                }
            }
        };

        fetchVideo();
    }, [videoId, toast]);

    const formik = useFormik({
        initialValues,
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            try {
                const response = videoId
                    ? await fetch(`/api/videos`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ ...values, id: videoId }),
                    })
                    : await fetch('/api/videos', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(values),
                    });

                if (response.ok) {
                    toast({
                        title: videoId ? "Video updated successfully" : "Video added successfully",
                        description: '',
                        variant: 'success',
                    });
                    router.push('/dashboard/videos');
                } else {
                    toast({
                        title: videoId ? "Failed to update video" : "Failed to add video",
                        description: '',
                        variant: 'destructive',
                    });
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                toast({
                    title: "An error occurred while processing the user",
                    description: '',
                    variant: 'destructive'
                });
            }
        },
    });

    return (
        <div className='container'>
             <form onSubmit={formik.handleSubmit} className="max-w-7xl mx-auto p-6 bg-white shadow-sm rounded-lg space-y-6 border">
                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8">
                <div className="col-span-1 md:col-span-2">
                        <label htmlFor="link" className="block text-gray-700 text-sm font-medium">Link</label>
                        <input
                            id="link"
                            name="link"
                            type="text"
                            onChange={formik.handleChange}
                            value={formik.values.link}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {formik.errors.link && formik.touched.link && <div className="text-red-600 text-sm mt-2">{formik.errors.link}</div>}
                    </div>
                </div>

                <div>
                    <label htmlFor="video" className="block text-gray-700 text-sm font-medium">Upload Video</label>
                    <div className="mt-1">
                        <input
                            id="video"
                            name="video"
                            type="file"
                            onChange={(e) => {
                                formik.setFieldValue("video", e.target.files[0]);
                            }}
                            className="hidden"
                        />
                        <label htmlFor="video" className="cursor-pointer inline-block bg-gray-100 text-gray-500 border-3 font-semibold py-2 px-4 rounded-md  focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            Choose a video
                        </label>
                        {formik.values.video && formik.values.video.name && (
                            <div className="mt-2 text-gray-700 text-sm">
                                <span className="font-medium">Selected File:</span> {formik.values.video.name}
                            </div>
                        )}
                    </div>
                    {formik.errors.video && formik.touched.video && <div className="text-red-600 text-sm mt-2">{formik.errors.video}</div>}
                </div>

                <div className='flex justify-end'>
                    <button
                        type="submit"
                        className="px-4 py-2 mt-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        Update Video
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VideoForm;
