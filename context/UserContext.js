// import { createContext, useContext, useState, useEffect } from 'react';

// const UserContext = createContext();

// export const UserProvider = ({ children }) => {
//   const [username, setUsername] = useState('');

//   // 
//   useEffect(() => {
//     async function fetchUsername() {
//       try {
//         const response = await fetch('/api/users/me'); // ✅ Corrected API route

//         if (!response.ok) {
//           throw new Error('Failed to fetch user');
//         }

//         const data = await response.json();
//         setUsername(data.username);
//       } catch (error) {
//         console.error('Failed to fetch username:', error);
//       }
//     }

//     fetchUsername();
//   }, []);

//   return (
//     <UserContext.Provider value={{ username }}>
//       {children}
//     </UserContext.Provider>
//   );
// };

// export const useUser = () => useContext(UserContext);
// context/UserContext.js
// context/UserContext.js
"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: 'Guest',
    image: '/avatar.png',
    role: 0,
    userType: null
  });
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (status === 'authenticated') {
          const response = await fetch('/api/users/me', {
            credentials: 'include'
          });
          
          if (!response.ok) {
            throw new Error(response.statusText || 'Failed to fetch user');
          }

          const userData = await response.json();
          setUser(userData);
        } else if (status === 'unauthenticated') {
          setUser({
            name: 'Guest',
            image: '/avatar.png',
            role: 0,
            userType: null
          });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [status]);

  const login = async (token, userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      setUser({
        name: 'Guest',
        image: '/avatar.png',
        role: 0,
        userType: null
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, logout, login }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};