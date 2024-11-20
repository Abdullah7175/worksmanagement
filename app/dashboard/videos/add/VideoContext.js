"use client"
import React, { createContext, useState, useContext } from 'react';

// Create a context
const VideoContext = createContext();

// Create a provider component
export const VideoProvider = ({ children }) => {
  const [video, setVideo] = useState({ id: '', link: '' });

  // Function to update the user data
  const updateVideo = (newVideoData) => {
    setVideo((prevVideo) => ({
      ...prevVideo,
      ...newVideoData,
    }));
  };

  return (
    <VideoContext.Provider value={{ video, updateVideo }}>
      {children}
    </VideoContext.Provider>
  );
};

// Custom hook to use the user context
export const useVideoContext = () => useContext(VideoContext);
