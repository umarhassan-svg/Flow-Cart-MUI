// src/context/SessionContext.tsx
import React, { createContext, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext"; // your auth context

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 mins

const SessionContext = createContext({});

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { logout } = useAuth(); // function to clear token/session

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        alert("You have been logged out due to inactivity.");
        logout();
      }, SESSION_TIMEOUT);
    };

    // events that count as activity
    const events = [
      "mousemove",
      "mousedown",
      "keypress",
      "touchstart",
      "scroll",
    ];
    events.forEach((e) => window.addEventListener(e, resetTimer));

    resetTimer(); // start initial timer

    return () => {
      if (timer) clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [logout]);

  return (
    <SessionContext.Provider value={{}}>{children}</SessionContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSession = () => useContext(SessionContext);
