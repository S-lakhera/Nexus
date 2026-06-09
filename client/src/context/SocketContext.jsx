import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      // 1. Initialize connection (without the query parameter we used earlier)
      const socketInstance = io("http://localhost:3000");

      setSocket(socketInstance);

      // 2. MATCHING YOUR BACKEND: Wait for connection, then emit the "setup" event
      socketInstance.on("connect", () => {
        socketInstance.emit("setup", user);
      });

      // 3. Optional: Listen for the "connected" confirmation from backend
      socketInstance.on("connected", () => {
        console.log("Socket setup complete and connected!");
      });

      return () => {
        socketInstance.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user]);

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