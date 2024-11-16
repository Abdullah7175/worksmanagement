"use client"

import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useUserContext } from './VideoContext';

const validationSchema = Yup.object({
    name: Yup.string()
        .required('Name is required')
        .min(3, 'Name must be at least 3 characters'),
    email: Yup.string()
        .email('Invalid email format')
        .required('Email is required'),
    password: Yup.string()
        .required('Email is required')
        .min(3, 'Name must be at least 3 characters'),
    contact: Yup.number()
        .required('Age is required')
        .positive('Age must be a positive number'),
    });

const UserForm = () => {
    const { user, updateUser } = useUserContext();
    const formik = useFormik({
        initialValues: {
            name: user.name || '',
            email: user.email || '',
            password: user.password || '',
            contact: user.age || '',
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            updateUser(values);

            try {
                const response = await fetch('/api/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values),
                });

                if (response.ok) {
                    alert('User added successfully');
                } else {
                    alert('Failed to add user');
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                alert('An error occurred while adding the user');
            }
        },
    });

    return (
        <div className='container p-3'>
            <form onSubmit={formik.handleSubmit} className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg space-y-6">
                <div>
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
                <div>
                    <button
                        type="submit"
                        className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        Add Video
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserForm;
