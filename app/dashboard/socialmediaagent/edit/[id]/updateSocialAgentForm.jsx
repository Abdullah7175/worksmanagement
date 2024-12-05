"use client"

import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSocialAgentContext } from '../../SocialAgentContext';
import { useToast } from "@/hooks/use-toast"
import { useRouter, useParams } from 'next/navigation';

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
    const params = useParams()
    const socialagentId = params.id;
    const { socialagent, updateSocialAgent } = useSocialAgentContext();
    const { toast } = useToast();
    const [initialValues, setInitialValues] = useState({
        name: '',
        designation: '',
        contact: '',
        address: '',
        department: '',
        email: '',
    });
    const router = useRouter();

    useEffect(() => {
        const fetchAgent = async () => {
            if (socialagentId) {
                try {
                    const response = await fetch(`/api/socialmediaperson?id=${socialagentId}`);
                    if (response.ok) {
                        const data = await response.json();
                        setInitialValues({
                            name: data.name,
                            email: data.email,
                            contact: data.contact_number,
                            address: data.address,
                        });
                    } else {
                        toast({
                            title: "Failed to fetch Videographer data",
                            description: '',
                            variant: 'destructive'
                        });
                    }
                } catch (error) {
                    console.error('Error fetching Videographer  data:', error);
                    toast({
                        title: "Error fetching Videographer  data",
                        description: '',
                        variant: 'destructive'
                    });
                }
            }
        };

        fetchAgent();
    }, [socialagentId, toast]);

    const formik = useFormik({
        initialValues,
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            try {
                const response = socialagentId
                    ? await fetch(`/api/socialmediaperson`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ ...values, id: socialagentId }),
                    })
                    : await fetch('/api/socialmediaperson', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(values),
                    });

                if (response.ok) {
                    toast({
                        title: socialagentId ? "Videographer updated successfully" : "Videographer added successfully",
                        description: '',
                        variant: 'success',
                    });
                    router.push('/dashboard/socialmediaagent');
                } else {
                    toast({
                        title: socialagentId ? "Failed to update Videographer" : "Failed to add Videographer",
                        description: '',
                        variant: 'destructive',
                    });
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                toast({
                    title: "An error occurred while processing the Videographer",
                    description: '',
                    variant: 'destructive'
                });
            }
        },
    });

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
                        Update Social Agent
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SocialAgentForm;
