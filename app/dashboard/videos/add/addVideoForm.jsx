"use client"

import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useVideoContext } from '../VideoContext';
import { useToast } from "@/hooks/use-toast";



const validationSchema = Yup.object({
    link: Yup.string()
        .min(3, 'Link must be at least 3 characters'),
});

const VideoForm = () => {
    const { video, updateVideo } = useVideoContext();
    const { toast } = useToast();
    const [isSuccess, setIsSuccess] = useState(false);
    const [uploadvideo, setuploadVideo] = useState(null);
    const [message, setMessage] = useState('');
    
    const formik = useFormik({
        initialValues: {
            link: video.link || '',
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            updateVideo(values);
            try {
                const response = await fetch('/api/videos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values),
                });

                if (response.ok) {
                    toast({
                        title: "Video added successfully",
                        description: '',
                        variant: 'success',
                    });
                    setIsSuccess(true);
                } else {
                    toast({
                        title: "Failed to add video",
                        description: '',
                        variant: 'destructive',
                    });
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                toast({
                    title: "An error occurred while adding the video",
                    description: '',
                    variant: 'destructive',
                });
            }
        },
    });

    if (isSuccess) {
        window.location.href = '/dashboard/videos';
    }
    const handleFileChange = (e) => {
        setuploadVideo(e.target.files[0]);
      };
    
      const uploadhandleSubmit = async (e) => {
        e.preventDefault();
        if (!uploadvideo) {
          setMessage('Please select a video file');
          return;
        }
    
        const formData = new FormData();
        formData.append('video', uploadvideo);
    
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
    
          const data = await res.json();
          if (res.ok) {
            setMessage(`Video uploaded successfully: ${data.videoPath}`);
          } else {
            setMessage(data.error || 'Video upload failed');
          }
        } catch (error) {
          setMessage('An error occurred while uploading the video');
        }
    };


    return (
        <div className='container'>
            <form encType="multipart/form-data" onSubmit={formik.handleSubmit} className="max-w-7xl mx-auto p-6 bg-white shadow-sm rounded-lg space-y-6 border">
                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <label htmlFor="link" className="block text-gray-700 text-sm font-medium">Link</label>
                        <input
                            id="link"
                            name="link"
                            type="text"
                            onChange={formik.handleChange}
                            value={formik.values.subject}
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
                        Add Video
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VideoForm;
