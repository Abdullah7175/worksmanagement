"use client"

import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useVideoContext } from '../VideoContext';
import { useToast } from "@/hooks/use-toast";
import { Image } from 'lucide-react';



const validationSchema = Yup.object({
    link: Yup.string().required('Link Feild Cannot be empty')
        .min(3, 'Link must be at least 3 characters'),
    vid: Yup.string()
});

const VideoForm = () => {
    const { video, updateVideo } = useVideoContext();
    const { toast } = useToast();
    const [isSuccess, setIsSuccess] = useState(false);
    const [preview, Setpreview] = useState(null);
    const [size, Setsize] = useState(null);
    const [message, setMessage] = useState('');

    const formik = useFormik({
        initialValues: {
            link: video.link || '',
            vid: video.vid || '',

        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            const formData = new FormData();
        
            // Append the file to the FormData object
            if (values.vid) {
                formData.append('vid', values.vid); // 'vid' matches your server-side field name
            }
        
            try {
                const response = await fetch('/api/videos/upload', {
                    method: 'POST',
                    body: formData,
                });
        
                if (response.ok) {
                    const data = await response.json();
                    console.log('Video available at:', data.path); // e.g., /uploads/1234567890-video.mp4
                    toast({
                        title: 'Video uploaded successfully',
                        description: `File saved at: ${data.path}`,
                        variant: 'success',
                    });
                } else {
                    toast({
                        title: 'Failed to upload video',
                        description: 'Please try again.',
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

    if (isSuccess) {
        window.location.href = '/dashboard/videos';
    };
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            formik.setFieldValue('vid', file); // Properly set the file
            Setpreview(file); // Optional: Save the file for preview or further processing
    
            // Calculate file size for display
            const sizeInMB = file.size / (1024 * 1024);
            const formattedSize = Math.round(sizeInMB * 100) / 100; // Round to 2 decimals
            Setsize(formattedSize);
    
            console.log('Selected file:', file);
        }
    };
    return (
        <div className='container'>
            <form action={'/upload'} method='POST' encType="multipart/form-data" onSubmit={formik.handleSubmit} className="max-w-7xl mx-auto p-6 bg-white shadow-sm rounded-lg space-y-6 border">
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
                    <label htmlFor="vid" className="block text-gray-700 text-sm font-medium">Upload Video</label>
                    <div className="mt-1">
                        <input
                            id="vid"
                            name="vid"
                            type="file"
                            accept="video/*"
                            onChange={(e) => handleFileChange(e)}
                            className="hidden"
                        />
                        <label htmlFor="vid" className="cursor-pointer inline-block bg-gray-100 text-gray-500 border-3 font-semibold py-2 px-4 rounded-md  focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            Choose a video
                        </label>
                        {formik.values.vid && formik.values.vid.name && (
                            <div className="mt-2 text-gray-700 text-sm">
                                <span className="font-medium">Selected File:</span> {formik.values.vid.name}
                                <div className="font-medium">Size: {size} MB</div>
                                {message ? (
                                    <div className="mt-4">
                                        <span className="font-medium">Preview:</span>
                                        <Image src={message} alt="Video preview" className="mt-2 border rounded-md" />
                                    </div>
                                ) : (
                                    <div className="mt-4">
                                        <span className="font-medium">Preview:</span>
                                        <p>No preview available.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    {formik.errors.vid && formik.touched.vid && <div className="text-red-600 text-sm mt-2">{formik.errors.vid}</div>}
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
