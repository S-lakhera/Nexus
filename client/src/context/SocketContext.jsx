import { createContext, useContext, useEffect } from "react";
import { useSelector } from "react-redux";
import { socket } from "../services/socket.js";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  // Watch the auth state
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      socket.connect();

      // 2. Setup the personal room once connected
      socket.on("connect", () => {
        socket.emit("setup", user);
      });

      return () => {
        // Cleanup when the user logs out or the app unmounts
        socket.off("connect");
        socket.disconnect(); 
      };
    } else {
      // If the user logs out, kill the connection immediately
      socket.disconnect();
    }
  }, [user]);

  // We pass the imported socket instance down to the rest of the app
  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};