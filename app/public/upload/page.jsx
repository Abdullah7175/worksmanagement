"use client"

import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useToast } from "@/hooks/use-toast";
import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const validationSchema = Yup.object({
    workRequestId: Yup.string().required('Work Request ID is required'),
    contactNumber: Yup.string()
        .required('Contact Number is required')
        .matches(/^[0-9]+$/, 'Must be only digits')
        .min(10, 'Must be at least 10 digits')
        .max(15, 'Must be 15 digits or less'),
});

export default function UploadLandingPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [verificationError, setVerificationError] = useState(null);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const formik = useFormik({
        initialValues: {
            workRequestId: '',
            contactNumber: ''
        },
        validationSchema,
        onSubmit: async (values) => {
            setIsLoading(true);
            setVerificationError(null);
            
            try {
                const response = await fetch('/api/verify-work-request', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        workRequestId: values.workRequestId,
                        contactNumber: values.contactNumber
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Verification failed');
                }

                if (data.valid) {
                    router.push(`/public/upload/${values.workRequestId}`);
                } else {
                    setVerificationError(data.message || 'Invalid work request ID or contact number');
                    toast({
                        title: 'Verification Failed',
                        description: data.message || 'The work request ID and contact number do not match our records.',
                        variant: 'destructive',
                        duration: 5000
                    });
                }
            } catch (error) {
                setVerificationError(error.message);
                toast({
                    title: 'Verification Error',
                    description: error.message || 'Failed to verify work request. Please try again.',
                    variant: 'destructive',
                    duration: 5000
                });
            } finally {
                setIsLoading(false);
            }
        },
    });

    return (
        <>
            <Head>
                <title>Upload Work Media | Works Management Portal</title>
                <meta name="description" content="Upload your work media for verification" />
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
                            className="text-gray-600 hover:text-blue-600"
                        >
                            Help
                        </button>
                        <Link href="/contact" className="text-gray-600 hover:text-blue-600">
                            Contact
                        </Link>
                    </nav>
                </div>
            </header>
            <main className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 pt-6 flex justify-end">
                        <Button onClick={() => router.push('/public/request/new')}>
                        + Add New Request
                        </Button>
                    </div>
                <div className="container mx-auto p-4 max-w-2xl py-4">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Upload Work Media</h1>
                                <p className="mt-2 text-gray-600">
                                    Please enter your work request details to begin uploading media
                                </p>
                            </div>
                            <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                Step 1 of 2
                            </div>
                        </div>

                        {/* Verification error banner */}
                        {verificationError && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">Verification Failed</h3>
                                        <div className="mt-2 text-sm text-red-700">
                                            <p>{verificationError}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={formik.handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="workRequestId" className="block text-sm font-medium text-gray-700 mb-1">
                                    Work Request ID *
                                </label>
                                <input
                                    id="workRequestId"
                                    name="workRequestId"
                                    type="text"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.workRequestId}
                                    className={`w-full p-3 border rounded-md ${formik.errors.workRequestId && formik.touched.workRequestId ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Enter your work request ID"
                                />
                                {formik.errors.workRequestId && formik.touched.workRequestId && (
                                    <p className="mt-1 text-sm text-red-600">{formik.errors.workRequestId}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                    Contact Number *
                                </label>
                                <input
                                    id="contactNumber"
                                    name="contactNumber"
                                    type="tel"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.contactNumber}
                                    className={`w-full p-3 border rounded-md ${formik.errors.contactNumber && formik.touched.contactNumber ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Enter contact number"
                                />
                                {formik.errors.contactNumber && formik.touched.contactNumber && (
                                    <p className="mt-1 text-sm text-red-600">{formik.errors.contactNumber}</p>
                                )}
                            </div>

                            <div className="flex justify-between items-center pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsHelpOpen(true)}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    Need help finding your Work Request ID?
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading || !formik.isValid}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Verifying...
                                        </span>
                                    ) : 'Continue to Media Upload'}
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
                    <div className="border-t border-gray-700 mt-4 pt-2 text-center text-gray-400 text-sm">
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
                            Finding Your Work Request ID
                        </Dialog.Title>
                        <div className="space-y-4 text-gray-600">
                            <p>
                                Your Work Request ID can be found in the confirmation email or SMS you received when your work was scheduled.
                            </p>
                            <p>
                                If you can't locate it, please contact our support team at <span className="text-blue-600">support@kwsc.gos.pk</span> or call <span className="text-blue-600"> 1334 </span>.
                            </p>
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
        </>
    );
}