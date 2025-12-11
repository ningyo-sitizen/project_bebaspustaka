import { createContext, useState, useContext, useEffect } from "react";
import Notif from "./notif_success";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notif, setNotif] = useState(null);
  
  const showNotif = (type, message) => {
    setNotif({ type, message });
    setTimeout(() => setNotif(null), 2500);
  };
  
  
  return (
    <NotificationContext.Provider value={{ showNotif }}>
      {children}
      {notif && (
        <Notif
          type={notif.type}
          message={notif.message}
          onClose={() => setNotif(null)}
        />
      )}
    </NotificationContext.Provider>
  );
}

export function useNotif() {
  return useContext(NotificationContext);
}