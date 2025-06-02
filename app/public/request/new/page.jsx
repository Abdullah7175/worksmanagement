"use client"

import { RequestForm } from '@/components/RequestForm';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

const PublicRequestPage = () => {
    const router = useRouter();
    const { toast } = useToast();

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Submit a Work Request</h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Please fill out the form below to submit your request
                    </p>
                </div>
                
                <div className="bg-white shadow rounded-lg p-6">
                    <RequestForm isPublic={true} />
                </div>
                
                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>Already have an account? 
                        <button 
                            onClick={() => router.push('/login')}
                            className="ml-1 text-indigo-600 hover:text-indigo-500 font-medium"
                        >
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PublicRequestPage;