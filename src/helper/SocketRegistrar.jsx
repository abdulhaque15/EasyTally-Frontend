import { useEffect } from "react";
import { useAuthWrapper } from "./AuthWrapper";
import socket from "../config/socket.config";

const SocketRegistrar = () => {
  const { user } = useAuthWrapper();

  useEffect(() => {
    setTimeout(() => {
      if (user?.id) {
        if (!socket.connected) {
          socket.connect();
        }
        socket.emit("register_user", user.id);
        console.log("✅ Socket connected with user:", user.id);
      }
    }, 50)
  }, [user?.id]);

  return null;
};

export default SocketRegistrar;
