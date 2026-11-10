import axios from "axios";
import { createContext, useEffect, useState } from "react";
import socket from "../Socket.js"; // adjust path if needed

const UserContext = createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  // Restore session on page load
  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/auth/me`,
          { withCredentials: true }
        );
        setUser(response.data.user);
      } catch (err) {
        setUser(null); // not logged in
      }
    };
    getUser();
  }, []);

  // Connect the socket only while logged in
  useEffect(() => {
    if (user) {
      if (!socket.connected) socket.connect();
    } else {
      socket.disconnect();
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export { UserContext, UserProvider };