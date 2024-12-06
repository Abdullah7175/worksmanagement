"use client"
import React, { createContext, useState, useContext } from 'react';

// Create a context
export const UserDataContext = createContext();

// Create a provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({ name: '', email: ''});

  // Function to update the user data
  const updateUser = (newUserData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...newUserData,
    }));
  };

  return (
    <UserDataContext.Provider value={{ user, setUser }}>
      {children}
    </UserDataContext.Provider>
  );
};

// Custom hook to use the user context
export const useUserContext = () => useContext(UserDataContext);
