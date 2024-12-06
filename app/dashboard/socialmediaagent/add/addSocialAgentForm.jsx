"use client"

import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSocialAgentContext } from '../SocialAgentContext';
import { useToast } from "@/hooks/use-toast";


const validationSchema = Yup.object({
    name: Yup.string()
        .required('Name is required')
        .min(3, 'Name must be at least 3 characters'),
    email: Yup.string()
        .email('Invalid email format')
        .required('Email is required'),
    contact: Yup.number()
        .min(11, 'Number must be 11 digits'),
    address: Yup.string()
        .min(3, 'Address must be at least 3 characters'),
});

const SocialAgentForm = () => {
    const { socialagent, updateSocialAgent } = useSocialAgentContext();
    const { toast } = useToast();
    const [isSuccess, setIsSuccess] = useState(false);
    const formik = useFormik({
        initialValues: {
            name: socialagent.name || '',
            email: socialagent.email || '',
            contact: socialagent.contact || '',
            address: socialagent.address || '',

        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            updateSocialAgent(values);
            try {
                const response = await fetch('/api/socialmediaperson', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values),
                });

                if (response.ok) {
                    toast({
                        title: "Agent added successfully",
                        description: '',
                        variant: 'success',
                    });
                    setIsSuccess(true);
                } else {
                    toast({
                        title: "Failed to add agent",
                        description: '',
                        variant: 'destructive',
                    });
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                toast({
                    title: "An error occurred while adding the agent",
                    description: '',
                    variant: 'destructive',
                });
            }
        },
    });

    if (isSuccess) {
        window.location.href = '/dashboard/socialmediaagent';
    }


    return (
        <div className='container'>
            <form onSubmit={formik.handleSubmit} className="max-w-7xl mx-auto p-6 bg-white shadow-sm rounded-lg space-y-6 border">
                <div>
                    <label htmlFor="name" className="block text-gray-700 text-sm font-medium">Name</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        onChange={formik.handleChange}
                        value={formik.values.name}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {formik.errors.name && formik.touched.name && <div className="text-red-600 text-sm mt-2">{formik.errors.name}</div>}
                </div>
                <div>
                    <label htmlFor="email" classpassword="block text-gray-700 text-sm font-medium">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        onChange={formik.handleChange}
                        value={formik.values.email}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {formik.errors.password && formik.touched.email && <div className="text-red-600 text-sm mt-2">{formik.errors.email}</div>}
                </div>
                <div>
                    <label htmlFor="contact" className="block text-gray-700 text-sm font-medium">Contact</label>
                    <input
                        id="contact"
                        name="contact"
                        type="text"
                        onChange={formik.handleChange}
                        value={formik.values.contact}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {formik.errors.contact && formik.touched.contact && <div className="text-red-600 text-sm mt-2">{formik.errors.contact}</div>}
                </div>

                <div>
                    <label htmlFor="address" classpassword="block text-gray-700 text-sm font-medium">Address</label>
                    <input
                        id="address"
                        name="address"
                        type="text"
                        onChange={formik.handleChange}
                        value={formik.values.address}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {formik.errors.password && formik.touched.address && <div className="text-red-600 text-sm mt-2">{formik.errors.address}</div>}
                </div>
                <div className='flex justify-end'>
                    <button
                        type="submit"
                        className="px-4 py-2 mt-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        Add Agent
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SocialAgentForm;
