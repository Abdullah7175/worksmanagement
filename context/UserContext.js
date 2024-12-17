import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [username, setUsername] = useState('');

  useEffect(() => {
    async function fetchUsername() {
      try {
        const response = await fetch('/api/user/login'); // Replace with dynamic ID
        const data = await response.json();
        if (response.ok) {
          setUsername(data.username);
        }
      } catch (error) {
        console.error('Failed to fetch username:', error);
      }
    }

    fetchUsername();
  }, []);

  return (
    <UserContext.Provider value={{ username }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
