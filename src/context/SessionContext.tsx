// src/context/SessionContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

const SessionContext = createContext({});

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { logout, isAuthenticated } = useAuth();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = useCallback(() => {
    // console.log("Session timeout - logging out user");
    alert("You have been logged out due to inactivity.");
    logout();
  }, [logout]);

  const resetTimer = useCallback(() => {
    // Only track activity if user is authenticated
    if (!isAuthenticated) return;

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set new timer
    timerRef.current = setTimeout(handleLogout, SESSION_TIMEOUT);

    // console.log("Activity detected - timer reset");
  }, [isAuthenticated, handleLogout]);

  useEffect(() => {
    // Don't track if user is not authenticated
    if (!isAuthenticated) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Events that count as user activity
    const events = [
      "mousemove",
      "mousedown",
      "keypress",
      "touchstart",
      "scroll",
      "click",
    ];

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    // Start initial timer
    resetTimer();

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      //   console.log(" Session tracking cleanup completed");
    };
  }, [isAuthenticated, resetTimer]);

  // Handle visibility change (user switches tabs)
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched away - pause timer or track time away
        // console.log("User switched to another tab");
      } else {
        // User came back - reset timer
        // console.log("User returned to tab");
        resetTimer();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated, resetTimer]);

  return (
    <SessionContext.Provider value={{}}>{children}</SessionContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSession = () => useContext(SessionContext);
