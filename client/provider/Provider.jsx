import { PropTypes } from "prop-types";
import { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";

export const ThinkifyContext = createContext(null);

const Provider = ({ children }) => {
    const [alertBoxOpenStatus, setAlertBoxOpenStatus] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState("");
    const [alertMessage, setAlertMessage] = useState("")
    const [loadingStatus, setLoadingStatus] = useState(false);
    
    // Authentication state
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false); // Start with false to prevent initial flash

    // Check authentication status on mount
    useEffect(() => {
        const checkAuth = () => {
            try {
                // Remove delay - check immediately to prevent flashing
                const token = Cookies.get(import.meta.env.VITE_TOKEN_KEY);
                const role = Cookies.get(import.meta.env.VITE_USER_ROLE);
                
                if (token && role) {
                    // For now, trust the cookies without backend verification to avoid conflicts
                    // You can add backend verification later if needed
                    setUser({ role: role });
                    setIsAuthenticated(true);
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                setUser(null);
                setIsAuthenticated(false);
            }
            // No need to set loading to false since we start with false
        };

        checkAuth();
    }, []);

    // Logout function to clear all auth state
    const logout = async () => {
        try {
            // Clear auth state immediately
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
            
            // Clear cookies with proper cleanup
            Cookies.remove(import.meta.env.VITE_TOKEN_KEY, { path: "" });
            Cookies.remove(import.meta.env.VITE_USER_ROLE, { path: "" });
            
            // Also try removing with different path configurations to ensure cleanup
            Cookies.remove(import.meta.env.VITE_TOKEN_KEY, { path: "/" });
            Cookies.remove(import.meta.env.VITE_USER_ROLE, { path: "/" });
            Cookies.remove(import.meta.env.VITE_TOKEN_KEY);
            Cookies.remove(import.meta.env.VITE_USER_ROLE);
            
            // CRITICAL FIX: Clear localStorage and sessionStorage
            // This was the missing piece causing session persistence!
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            localStorage.removeItem(import.meta.env.VITE_TOKEN_KEY);
            localStorage.removeItem(import.meta.env.VITE_USER_ROLE);
            
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('userRole');
            sessionStorage.removeItem(import.meta.env.VITE_TOKEN_KEY);
            sessionStorage.removeItem(import.meta.env.VITE_USER_ROLE);
            
            // Clear all localStorage and sessionStorage to be absolutely sure
            localStorage.clear();
            sessionStorage.clear();
            
            // Remove delay to prevent flashing - all storage cleared synchronously
            // await new Promise(resolve => setTimeout(resolve, 100));
            
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const contextValue = {
        alertBoxOpenStatus,
        setAlertBoxOpenStatus,
        alertSeverity,
        setAlertSeverity,
        loadingStatus,
        setLoadingStatus,
        alertMessage,
        setAlertMessage,
        // Authentication context
        user,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
        loading,
        setLoading,
        // Logout function
        logout
    }

    return (
        <ThinkifyContext.Provider value={contextValue}>{children}</ThinkifyContext.Provider>
    )
}

Provider.propTypes = {
    children: PropTypes.node.isRequired
}

export default Provider
