"use client"

import { useState, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { MapPin, Image as ImageIcon, Video, Plus, X, HelpCircle } from 'lucide-react';
import Image from 'next/image';
import { Dialog } from '@headlessui/react';
import Head from 'next/head';
import Link from 'next/link';

const validationSchema = Yup.object({
    workRequestId: Yup.string().required('Work Request ID is required'),
    geo_tag: Yup.string().nullable(),
});

export default function PublicUploadPage() {
    const params = useParams();
    const { toast } = useToast();
    const router = useRouter();
    const [previews, setPreviews] = useState({
        images: [],
        videos: []
    });
    const [location, setLocation] = useState(null);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const fileInputRef = useRef({
        images: null,
        videos: null
    });

    const formik = useFormik({
        initialValues: {
            workRequestId: params.requestId || '',
            geo_tag: '',
            images: [],
            videos: [],
            imageDescriptions: [],
            videoDescriptions: []
        },
        validationSchema,
        onSubmit: async (values) => {
            setIsConfirmOpen(false);
            const formData = new FormData();
            formData.append('workRequestId', values.workRequestId);
            if (location) {
                formData.append('geo_tag', `POINT(${location.lng} ${location.lat})`);
            }

            values.images.forEach((file, index) => {
                formData.append('images', file);
                formData.append('imageDescriptions', values.imageDescriptions[index] || '');
            });

            values.videos.forEach((file, index) => {
                formData.append('videos', file);
                formData.append('videoDescriptions', values.videoDescriptions[index] || '');
            });

            try {
                const response = await fetch('/api/media', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    toast({
                        title: 'Media uploaded successfully',
                        description: 'Your images and videos have been submitted.',
                        variant: 'success',
                    });
                    router.push(`/public/upload/confirmation?requestId=${values.workRequestId}`);
                } else {
                    throw new Error('Failed to upload media');
                }
            } catch (error) {
                toast({
                    title: 'Upload failed',
                    description: error.message,
                    variant: 'destructive',
                });
            }
        },
    });

    const handleFileChange = (type, e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        const newFiles = [...formik.values[type], ...files];
        formik.setFieldValue(type, newFiles);

        if (type === 'images') {
            const newPreviews = files.map(file => ({
                type: 'image',
                url: URL.createObjectURL(file),
                name: file.name
            }));
            setPreviews(prev => ({ ...prev, images: [...prev.images, ...newPreviews] }));
            // Initialize descriptions for new files
            const newDescriptions = [...formik.values.imageDescriptions];
            files.forEach(() => newDescriptions.push(''));
            formik.setFieldValue('imageDescriptions', newDescriptions);
        } else {
            const newPreviews = files.map(file => ({
                type: 'video',
                url: URL.createObjectURL(file),
                name: file.name
            }));
            setPreviews(prev => ({ ...prev, videos: [...prev.videos, ...newPreviews] }));
            // Initialize descriptions for new files
            const newDescriptions = [...formik.values.videoDescriptions];
            files.forEach(() => newDescriptions.push(''));
            formik.setFieldValue('videoDescriptions', newDescriptions);
        }
    };

    const handleRemoveFile = (type, index) => {
        const updatedFiles = [...formik.values[type]];
        updatedFiles.splice(index, 1);
        formik.setFieldValue(type, updatedFiles);

        const updatedPreviews = [...previews[type]];
        URL.revokeObjectURL(updatedPreviews[index].url);
        updatedPreviews.splice(index, 1);
        setPreviews(prev => ({ ...prev, [type]: updatedPreviews }));

        const updatedDescriptions = [...formik.values[`${type}Descriptions`]];
        updatedDescriptions.splice(index, 1);
        formik.setFieldValue(`${type}Descriptions`, updatedDescriptions);
    };

    const handleDescriptionChange = (type, index, value) => {
        const descriptions = [...formik.values[`${type}Descriptions`]];
        descriptions[index] = value;
        formik.setFieldValue(`${type}Descriptions`, descriptions);
    };

    const captureLocation = () => {
        if (!navigator.geolocation) {
            toast({
                title: 'Geolocation not supported',
                description: 'Your browser does not support geolocation.',
                variant: 'destructive',
            });
            return;
        }

        toast({
            title: 'Capturing location...',
            description: 'Please allow location access in your browser.',
            variant: 'default',
        });

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ lat: latitude, lng: longitude });
                toast({
                    title: 'Location captured',
                    description: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`,
                    variant: 'success',
                });
            },
            (error) => {
                toast({
                    title: 'Geolocation error',
                    description: error.message,
                    variant: 'destructive',
                });
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    return (
        <>
            <Head>
                <title>Upload Media | Works Management Portal</title>
                <meta name="description" content="Upload your work media documentation" />
            </Head>

            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link href="/login" className="text-xl font-bold text-blue-600">
                        W M P
                    </Link>
                    <nav className="flex items-center space-x-6">
                        <button 
                            onClick={() => setIsHelpOpen(true)}
                            className="text-gray-600 hover:text-blue-600 flex items-center"
                        >
                            <HelpCircle className="mr-1 h-4 w-4" />
                            Help
                        </button>
                        <Link href="/contact" className="text-gray-600 hover:text-blue-600">
                            Contact
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="min-h-screen bg-gray-50">
                <div className="container mx-auto p-4 max-w-4xl py-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Upload Work Media</h1>
                                <p className="mt-2 text-gray-600">
                                    Add images and videos for work request ID: <span className="font-medium">{formik.values.workRequestId}</span>
                                </p>
                            </div>
                            <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                Step 2 of 2
                            </div>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            setIsConfirmOpen(true);
                        }} className="space-y-6">
                            {/* Location Capture */}
                            <div className="border rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-medium text-gray-800">
                                        Location Information
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={captureLocation}
                                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        <MapPin className="mr-2 h-4 w-4" />
                                        {location ? 'Update Location' : 'Capture Location'}
                                    </button>
                                </div>
                                {location && (
                                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                                        <p className="text-sm font-medium text-gray-700">Current Location:</p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Latitude: {location.lat.toFixed(6)}<br />
                                            Longitude: {location.lng.toFixed(6)}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Location helps verify the work was completed at the correct site.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Image Upload Section */}
                            <div className="border rounded-lg p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-medium text-gray-800 flex items-center">
                                        <ImageIcon className="mr-2 h-5 w-5" />
                                        Images
                                    </h2>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="file"
                                            ref={el => fileInputRef.current.images = el}
                                            onChange={(e) => handleFileChange('images', e)}
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current.images.click()}
                                            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        >
                                            <Plus className="mr-1 h-4 w-4" />
                                            Add Images
                                        </button>
                                    </div>
                                </div>

                                {previews.images.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {previews.images.map((preview, index) => (
                                            <div key={index} className="border rounded-md p-3 relative group">
                                                <div className="relative aspect-square mb-2 rounded-md overflow-hidden">
                                                    <Image
                                                        src={preview.url}
                                                        alt={`Preview ${index}`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFile('images', index)}
                                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-700">
                                                        Description (optional)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="Describe this image"
                                                        value={formik.values.imageDescriptions[index] || ''}
                                                        onChange={(e) => handleDescriptionChange('images', index, e.target.value)}
                                                        className="w-full p-2 border rounded text-sm"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-md">
                                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="mt-2">No images added yet</p>
                                        <p className="text-sm text-gray-400 mt-1">Upload images of the completed work</p>
                                    </div>
                                )}
                            </div>

                            {/* Video Upload Section */}
                            <div className="border rounded-lg p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-medium text-gray-800 flex items-center">
                                        <Video className="mr-2 h-5 w-5" />
                                        Videos
                                    </h2>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="file"
                                            ref={el => fileInputRef.current.videos = el}
                                            onChange={(e) => handleFileChange('videos', e)}
                                            accept="video/*"
                                            multiple
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current.videos.click()}
                                            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        >
                                            <Plus className="mr-1 h-4 w-4" />
                                            Add Videos
                                        </button>
                                    </div>
                                </div>

                                {previews.videos.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {previews.videos.map((preview, index) => (
                                            <div key={index} className="border rounded-md p-3 relative group">
                                                <div className="relative aspect-video mb-2 bg-black rounded-md overflow-hidden">
                                                    <video
                                                        src={preview.url}
                                                        controls
                                                        className="w-full h-full object-contain"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFile('videos', index)}
                                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-700">
                                                        Description (optional)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="Describe this video"
                                                        value={formik.values.videoDescriptions[index] || ''}
                                                        onChange={(e) => handleDescriptionChange('videos', index, e.target.value)}
                                                        className="w-full p-2 border rounded text-sm"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-md">
                                        <Video className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="mt-2">No videos added yet</p>
                                        <p className="text-sm text-gray-400 mt-1">Upload videos of the completed work</p>
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-between items-center pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={formik.isSubmitting || (previews.images.length === 0 && previews.videos.length === 0)}
                                    className={`px-6 py-3 rounded-md text-white ${(previews.images.length === 0 && previews.videos.length === 0) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} transition-colors duration-200`}
                                >
                                    {formik.isSubmitting ? 'Uploading...' : 'Submit All Media'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-4 md:mb-0">
                            <h3 className="text-xl font-bold">Works Management Portal</h3>
                            <p className="text-gray-400 mt-2">Karachi Water & Sewerage Corporation</p>
                        </div>
                        <div className="flex space-x-6">
                            <Link href="/privacy" className="text-gray-400 hover:text-white">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="text-gray-400 hover:text-white">
                                Terms of Service
                            </Link>
                            <Link href="/contact" className="text-gray-400 hover:text-white">
                                Contact Us
                            </Link>
                        </div>
                    </div>
                    <div className="border-t border-gray-700 mt-6 pt-6 text-center text-gray-400 text-sm">
                        © {new Date().getFullYear()} W M P. All rights reserved.
                    </div>
                </div>
            </footer>

            {/* Help Popup */}
            <Dialog open={isHelpOpen} onClose={() => setIsHelpOpen(false)} className="relative z-50">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <Dialog.Title className="text-xl font-bold text-gray-800 mb-4">
                            Media Upload Help
                        </Dialog.Title>
                        <div className="space-y-4 text-gray-600">
                            <div>
                                <h3 className="font-medium text-gray-800">Image Requirements:</h3>
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>Minimum resolution: 1024x768 pixels</li>
                                    <li>Accepted formats: JPG, PNG, HEIC</li>
                                    <li>Maximum file size: 10MB per image</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-800">Video Requirements:</h3>
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>Maximum duration: 2 minutes</li>
                                    <li>Accepted formats: MP4, MOV</li>
                                    <li>Maximum file size: 100MB per video</li>
                                </ul>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-md">
                                <p className="text-blue-800">
                                    For technical support, please contact us at <span className="font-medium">support@kwsc.gos.pk</span> or call <span className="font-medium">  1334  </span>.
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setIsHelpOpen(false)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Close
                            </button>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>

            {/* Confirmation Popup */}
            <Dialog open={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} className="relative z-50">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <Dialog.Title className="text-xl font-bold text-gray-800 mb-4">
                            Confirm Submission
                        </Dialog.Title>
                        <div className="space-y-4 text-gray-600">
                            <p>
                                You are about to submit {previews.images.length} image(s) and {previews.videos.length} video(s) for Work Request ID: <span className="font-medium">{formik.values.workRequestId}</span>.
                            </p>
                            {location && (
                                <p>
                                    Location data will be included: <span className="font-medium">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</span>
                                </p>
                            )}
                            <p className="font-medium text-gray-800">
                                Are you sure you want to proceed?
                            </p>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => setIsConfirmOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => formik.handleSubmit()}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                                Confirm Submission
                            </button>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </>
    );
}