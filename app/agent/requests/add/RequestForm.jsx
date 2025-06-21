"use client"

import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useToast } from "@/hooks/use-toast";
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';

const Select = dynamic(() => import('react-select'), { ssr: false });

const validationSchema = Yup.object({
    town_id: Yup.string().required('Town is required'),
    subtown_id: Yup.string().nullable(),
    complaint_type_id: Yup.string().required('Complaint type is required'),
    complaint_subtype_id: Yup.string().nullable(),
    contact_number: Yup.string()
        .required('Contact number is required')
        .matches(/^[0-9]{10,15}$/, 'Must be a valid phone number'),
    address: Yup.string().required('Address is required'),
    description: Yup.string().required('Description is required'),
    latitude: Yup.number().nullable(),
    longitude: Yup.number().nullable(),
});

export const RequestForm = ({ isPublic = false, initialValues, onSubmit, isEditMode = false }) => {
    const { data: session } = useSession();
    const { toast } = useToast();
    const [towns, setTowns] = useState([]);
    const [subtowns, setSubtowns] = useState([]);
    const [filteredSubtowns, setFilteredSubtowns] = useState([]);
    const [complaintTypes, setComplaintTypes] = useState([]);
    const [complaintSubTypes, setComplaintSubTypes] = useState([]);
    const [filteredSubTypes, setFilteredSubTypes] = useState([]);
    const [agentInfo, setAgentInfo] = useState(null);
    const [loadingAgent, setLoadingAgent] = useState(true);

    useEffect(() => {
        // Fetch agent info
        const fetchAgentInfo = async () => {
            if (!session?.user?.id) return;
            setLoadingAgent(true);
            try {
                const res = await fetch(`/api/agents?id=${session.user.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setAgentInfo(data);
                }
            } catch (error) {
                console.error('Error fetching agent info:', error);
            } finally {
                setLoadingAgent(false);
            }
        };
        fetchAgentInfo();
    }, [session?.user?.id]);

    const formik = useFormik({
        initialValues: initialValues || {
            town_id: agentInfo?.town_id || '',
            subtown_id: '',
            complaint_type_id: agentInfo?.complaint_type_id || '',
            complaint_subtype_id: '',
            contact_number: '',
            address: '',
            description: '',
            latitude: null,
            longitude: null,
            creator_id: session?.user?.id || null,
            creator_type: session?.user?.userType || 'agent',
        },
        validationSchema: Yup.object({
            subtown_id: Yup.string().nullable(),
            complaint_subtype_id: Yup.string().nullable(),
            contact_number: Yup.string()
                .required('Contact number is required')
                .matches(/^[0-9]{10,15}$/, 'Must be a valid phone number'),
            address: Yup.string().required('Address is required'),
            description: Yup.string().required('Description is required'),
            latitude: Yup.number().nullable(),
            longitude: Yup.number().nullable(),
        }),
        enableReinitialize: true,
        onSubmit: async (values) => {
            if (onSubmit) {
                await onSubmit(values);
            } else {
            try {
                const response = await fetch('/api/requests', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values),
                });

                if (response.ok) {
                    toast({
                        title: "Request submitted successfully",
                        description: 'Your work request has been received.',
                        variant: 'success',
                    });
                    formik.resetForm();
                } else {
                    toast({
                        title: "Failed to submit request",
                        description: 'Please try again later.',
                        variant: 'destructive',
                    });
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                toast({
                    title: "An error occurred",
                    description: 'Please try again later.',
                    variant: 'destructive',
                });
            }
        }
        },
    });

    const getCurrentLocation = () => {
        setLocationLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    formik.setFieldValue('latitude', position.coords.latitude);
                    formik.setFieldValue('longitude', position.coords.longitude);
                    setLocationAccess(true);
                    setLocationLoading(false);
                    toast({
                        title: "Location captured successfully",
                        variant: 'success',
                    });
                },
                (error) => {
                    console.error('Error getting location:', error);
                    setLocationLoading(false);
                    toast({
                        title: "Location access denied",
                        description: 'Please enter coordinates manually or try again.',
                        variant: 'destructive',
                    });
                }
            );
        } else {
            setLocationLoading(false);
            toast({
                title: "Geolocation not supported",
                description: 'Please enter coordinates manually.',
                variant: 'destructive',
            });
        }
    };

    useEffect(() => {
        // Fetch towns
        const fetchTowns = async () => {
            try {
                const res = await fetch('/api/complaints/getinfo');
                if (res.ok) {
                    const data = await res.json();
                    setTowns(data.towns);
                }
            } catch (error) {
                console.error('Error fetching towns:', error);
            }
        };

        // Fetch subtowns
        const fetchSubtowns = async () => {
            try {
                const res = await fetch('/api/towns/subtowns');
                if (res.ok) {
                    const data = await res.json();
                    setSubtowns(data);
                }
            } catch (error) {
                console.error('Error fetching subtowns:', error);
            }
        };

        // Fetch complaint types
        const fetchComplaintTypes = async () => {
            try {
                const res = await fetch('/api/complaints/getalltypes');
                if (res.ok) {
                    const data = await res.json();
                    setComplaintTypes(data);
                }
            } catch (error) {
                console.error('Error fetching complaint types:', error);
            }
        };

        // Fetch complaint subtypes
        const fetchComplaintSubTypes = async () => {
            try {
                const res = await fetch('/api/complaints/subtypes');
                if (res.ok) {
                    const data = await res.json();
                    setComplaintSubTypes(data);
                }
            } catch (error) {
                console.error('Error fetching Nature of work:', error);
            }
        };

        fetchTowns();
        fetchSubtowns();
        fetchComplaintTypes();
        fetchComplaintSubTypes();
    }, []);

    // Handle initial values for edit mode
    useEffect(() => {
        if (initialValues && isEditMode) {
            // Set selected town
            if (initialValues.town_id) {
                const town = towns.find(t => t.id === initialValues.town_id);
                if (town) {
                    setSelectedTown({ value: town.id, label: town.town });
                    // Filter subtowns for this town
                    const filtered = subtowns.filter(subtown => subtown.town_id === town.id);
                    setFilteredSubtowns(filtered);
                }
            }

            // Set selected complaint type
            if (initialValues.complaint_type_id) {
                const complaintType = complaintTypes.find(ct => ct.id === initialValues.complaint_type_id);
                if (complaintType) {
                    setSelectedComplaintType({ value: complaintType.id, label: complaintType.type_name });
                    // Filter subtypes for this complaint type
                    const filtered = complaintSubTypes.filter(subtype => subtype.complaint_type_id === complaintType.id);
                    setFilteredSubTypes(filtered);
                }
            }
        }
    }, [initialValues, isEditMode, towns, subtowns, complaintTypes, complaintSubTypes]);

    const handleTownChange = (selectedOption) => {
        setSelectedTown(selectedOption);
        const filtered = subtowns.filter(subtown => subtown.town_id === selectedOption.value);
        setFilteredSubtowns(filtered);
        formik.setFieldValue('town_id', selectedOption ? selectedOption.value : '');
        formik.setFieldValue('subtown_id', '');
    };

    const handleComplaintTypeChange = (selectedOption) => {
        setSelectedComplaintType(selectedOption);
        const filtered = complaintSubTypes.filter(subtype => subtype.complaint_type_id === selectedOption.value);
        setFilteredSubTypes(filtered);
        formik.setFieldValue('complaint_type_id', selectedOption ? selectedOption.value : '');
        formik.setFieldValue('complaint_subtype_id', '');
    };

    // Options for select components
    const townOptions = towns.map(town => ({
        value: town.id,
        label: town.town
    }));

    const subtownOptions = filteredSubtowns.map(subtown => ({
        value: subtown.id,
        label: subtown.subtown
    }));

    const complaintTypeOptions = complaintTypes.map(type => ({
        value: type.id,
        label: type.type_name
    }));

    const complaintSubTypeOptions = filteredSubTypes.map(type => ({
        value: type.id,
        label: type.subtype_name
    }));

    if (loadingAgent) {
        return <div>Loading agent info...</div>;
    }

    // Find the town and complaint type names for display
    const townName = towns.find(t => t.id === agentInfo?.town_id)?.town || '';
    const complaintTypeName = complaintTypes.find(ct => ct.id === agentInfo?.complaint_type_id)?.type_name || '';

    return (
        <div className="container mx-auto p-4">
            <form onSubmit={formik.handleSubmit} className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                    {isEditMode ? 'Edit Work Request' : isPublic ? 'Submit Work Request' : 'Create New Work Request'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Fixed Town */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Town *</label>
                        <input
                            type="text"
                            value={townName}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                        />
                        <input type="hidden" name="town_id" value={agentInfo?.town_id || ''} />
                    </div>
                    {/* Sub Town */}
                    <div>
                        <label htmlFor="subtown_id" className="block text-sm font-medium text-gray-700 mb-1">Sub Town (Optional)</label>
                        <Select
                            id="subtown_id"
                            name="subtown_id"
                            options={subtowns.filter(st => st.town_id === agentInfo?.town_id).map(st => ({ value: st.id, label: st.subtown }))}
                            onChange={selectedOption => formik.setFieldValue('subtown_id', selectedOption ? selectedOption.value : '')}
                            value={subtowns.filter(st => st.town_id === agentInfo?.town_id).map(st => ({ value: st.id, label: st.subtown })).find(option => option.value === formik.values.subtown_id) || null}
                            className="basic-select"
                            classNamePrefix="select"
                        />
                    </div>
                    {/* Fixed Complaint Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Complaint Type *</label>
                        <input
                            type="text"
                            value={complaintTypeName}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                        />
                        <input type="hidden" name="complaint_type_id" value={agentInfo?.complaint_type_id || ''} />
                    </div>
                    {/* Complaint Subtype */}
                    <div>
                        <label htmlFor="complaint_subtype_id" className="block text-sm font-medium text-gray-700 mb-1">Complaint Subtype</label>
                        <Select
                            id="complaint_subtype_id"
                            name="complaint_subtype_id"
                            options={complaintSubTypes.filter(st => st.complaint_type_id === agentInfo?.complaint_type_id).map(st => ({ value: st.id, label: st.subtype_name }))}
                            onChange={selectedOption => formik.setFieldValue('complaint_subtype_id', selectedOption ? selectedOption.value : '')}
                            value={complaintSubTypes.filter(st => st.complaint_type_id === agentInfo?.complaint_type_id).map(st => ({ value: st.id, label: st.subtype_name })).find(option => option.value === formik.values.complaint_subtype_id) || null}
                            className="basic-select"
                            classNamePrefix="select"
                        />
                    </div>

                    {/* Contact Number */}
                    <div>
                        <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700 mb-1">
                            Contact Number *
                        </label>
                        <input
                            id="contact_number"
                            name="contact_number"
                            type="tel"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.contact_number}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {formik.errors.contact_number && formik.touched.contact_number && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.contact_number}</p>
                        )}
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                            Address *
                        </label>
                        <textarea
                            id="address"
                            name="address"
                            rows={3}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.address}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {formik.errors.address && formik.touched.address && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.address}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description of Work *
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={5}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.description}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {formik.errors.description && formik.touched.description && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.description}</p>
                        )}
                    </div>
                </div>

                <div className="md:col-span-2">
                    <h3 className="text-lg font-medium mb-2">Location Details</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                                Latitude
                            </label>
                            <input
                                id="latitude"
                                name="latitude"
                                type="number"
                                step="any"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.latitude || ''}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Enter latitude"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                                Longitude
                            </label>
                            <input
                                id="longitude"
                                name="longitude"
                                type="number"
                                step="any"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.longitude || ''}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Enter longitude"
                            />
                        </div>
                    </div>
                    
                    <div className="mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={getCurrentLocation}
                            disabled={locationLoading}
                            className="flex items-center gap-2"
                        >
                            {locationLoading ? (
                                <span>Getting Location...</span>
                            ) : (
                                <>
                                    <span>Get Current Location</span>
                                </>
                            )}
                        </Button>
                        {locationAccess && (
                            <p className="mt-2 text-sm text-green-600">Location access granted</p>
                        )}
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Submit Request
                    </button>
                </div>
            </form>
        </div>
    );
};