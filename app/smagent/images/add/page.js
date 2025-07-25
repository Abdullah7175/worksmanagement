"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Upload, ArrowLeft, MapPin, X } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

function AddImagePage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const requestId = searchParams.get('requestId');
  
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [formData, setFormData] = useState({
    workRequestId: requestId || "",
    description: "",
    latitude: "",
    longitude: "",
    images: []
  });

  // Get current location
  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          }));
          setGettingLocation(false);
          toast({
            title: "Location obtained",
            description: "Current location has been set",
            variant: "success"
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setGettingLocation(false);
          toast({
            title: "Location error",
            description: "Could not get current location. Please enter manually.",
            variant: "destructive"
          });
        }
      );
    } else {
      setGettingLocation(false);
      toast({
        title: "Location not supported",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive"
      });
    }
  };

  const handleAddImages = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = true;
    
    fileInput.onchange = (e) => {
      const files = Array.from(e.target.files);
      const newImages = files.map(file => ({
        file,
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        preview: URL.createObjectURL(file)
      }));
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    };
    
    fileInput.click();
  };

  const handleRemoveImage = (imageId) => {
    setFormData(prev => {
      const imageToRemove = prev.images.find(img => img.id === imageId);
      if (imageToRemove?.preview) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return {
        ...prev,
        images: prev.images.filter(img => img.id !== imageId)
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.workRequestId || !formData.description || formData.images.length === 0) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields and select at least one image file.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      toast({
        title: "Location required",
        description: "Please provide location coordinates (auto or manual).",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const uploadPromises = formData.images.map(async (image) => {
        const data = new FormData();
        data.append("workRequestId", formData.workRequestId);
        data.append("description", formData.description);
        data.append("img", image.file);
        data.append("latitude", formData.latitude);
        data.append("longitude", formData.longitude);
        data.append("creator_id", session.user.id);
        data.append("creator_type", "socialmedia");

        const response = await fetch("/api/images", {
          method: "POST",
          body: data
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || `Failed to upload ${image.name}`);
        }

        return response.json();
      });

      await Promise.all(uploadPromises);
      
      toast({
        title: "Success",
        description: `${formData.images.length} image(s) uploaded successfully!`,
        variant: "success"
      });
      
      setFormData({
        workRequestId: "",
        description: "",
        latitude: "",
        longitude: "",
        images: []
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload images",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      formData.images.forEach(image => {
        if (image.preview) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, [formData.images]);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/smagent" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-2">Upload Images</h1>
        <p className="text-gray-600">
          Upload images for work requests with location data
        </p>
      </div>

      <Card className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="workRequestId" className="block text-sm font-medium text-gray-700 mb-2">
                Work Request ID *
              </label>
              <input
                type="number"
                id="workRequestId"
                value={formData.workRequestId}
                onChange={(e) => setFormData(prev => ({ ...prev, workRequestId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter work request ID"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Coordinates *
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={gettingLocation}
                  className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  {gettingLocation ? "Getting..." : "Get Location"}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">
                Latitude *
              </label>
              <input
                type="number"
                id="latitude"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter latitude"
                required
              />
            </div>

            <div>
              <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-2">
                Longitude *
              </label>
              <input
                type="number"
                id="longitude"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter longitude"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Describe the images"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image Files * ({formData.images.length} selected)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <button
                type="button"
                onClick={handleAddImages}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Click to select image files
              </button>
              <p className="text-sm text-gray-500 mt-2">
                JPG, PNG, GIF, or other image formats (multiple files supported)
              </p>
            </div>
            
            {formData.images.length > 0 && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {formData.images.map((image) => (
                  <div key={image.id} className="relative bg-gray-50 rounded-lg p-3">
                    <Image
                      src={image.preview}
                      alt={image.name}
                      width={400}
                      height={128}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{image.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(image.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(image.id)}
                        className="text-red-600 hover:text-red-800 ml-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Creator Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Creator ID:</span>
                <span className="ml-2 font-medium">{session?.user?.id || "Loading..."}</span>
              </div>
              <div>
                <span className="text-gray-600">Creator Name:</span>
                <span className="ml-2 font-medium">{session?.user?.name || "Loading..."}</span>
              </div>
              <div>
                <span className="text-gray-600">Role:</span>
                <span className="ml-2 font-medium">{session?.user?.role || "Loading..."}</span>
              </div>
              <div>
                <span className="text-gray-600">Creator Type:</span>
                <span className="ml-2 font-medium">mediacell</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link href="/smagent">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={loading || formData.images.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Uploading..." : `Upload ${formData.images.length} Image(s)`}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function PageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddImagePage />
    </Suspense>
  );
}

export default PageWrapper; 