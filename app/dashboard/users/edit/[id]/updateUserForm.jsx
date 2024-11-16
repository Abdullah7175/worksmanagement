"use client"

import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useUserContext } from './UserContext';
import { useToast } from "@/hooks/use-toast"
import { useRouter, useParams } from 'next/navigation';

const validationSchema = Yup.object({
    name: Yup.string()
        .required('Name is required')
        .min(3, 'Name must be at least 3 characters'),
    email: Yup.string()
        .email('Invalid email format')
        .required('Email is required'),
    password: Yup.string()
        .required('Password is required')
        .min(3, 'Password must be at least 3 characters'),
    contact: Yup.string()
        .required('Number is required')
        .min(11, 'Number must be 11 digits'),
});

const UserForm = () => {
    const params = useParams()
    const userId = params.id;
    const { user, updateUser } = useUserContext();
    const { toast } = useToast();
    const [initialValues, setInitialValues] = useState({
        name: '',
        email: '',
        password: '',
        contact: ''
    });
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            if (userId) {
                try {
                    const response = await fetch(`/api/users?id=${userId}`);
                    if (response.ok) {
                        const data = await response.json();
                        setInitialValues({
                            name: data.name,
                            email: data.email,
                            password: data.password,
                            contact: data.contact_number
                        });
                    } else {
                        toast({
                            title: "Failed to fetch user data",
                            description: '',
                            variant: 'destructive'
                        });
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    toast({
                        title: "Error fetching user data",
                        description: '',
                        variant: 'destructive'
                    });
                }
            }
        };

        fetchUser();
    }, [userId, toast]);

    const formik = useFormik({
        initialValues,
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            try {
                const response = userId
                    ? await fetch(`/api/users`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ ...values, id: userId }),
                    })
                    : await fetch('/api/users', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(values),
                    });

                if (response.ok) {
                    toast({
                        title: userId ? "User updated successfully" : "User added successfully",
                        description: '',
                        variant: 'success',
                    });
                    router.push('/dashboard/users'); 
                } else {
                    toast({
                        title: userId ? "Failed to update user" : "Failed to add user",
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
                    <label htmlFor="email" className="block text-gray-700 text-sm font-medium">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        onChange={formik.handleChange}
                        value={formik.values.email}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {formik.errors.email && formik.touched.email && <div className="text-red-600 text-sm mt-2">{formik.errors.email}</div>}
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
                    <label htmlFor="password" className="block text-gray-700 text-sm font-medium">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        onChange={formik.handleChange}
                        value={formik.values.password}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {formik.errors.password && formik.touched.password && <div className="text-red-600 text-sm mt-2">{formik.errors.password}</div>}
                </div>

                <div className='flex justify-end'>
                    <button
                        type="submit"
                        className="px-4 py-2 mt-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {userId ? "Update User" : "Add User"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserForm;
