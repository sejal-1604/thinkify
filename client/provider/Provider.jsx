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
    const [loading, setLoading] = useState(true);

    // Check authentication status on mount
    useEffect(() => {
        const checkAuth = () => {
            try {
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
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

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
        setLoading
    }

    return (
        <ThinkifyContext.Provider value={contextValue}>{children}</ThinkifyContext.Provider>
    )
}

Provider.propTypes = {
    children: PropTypes.node.isRequired
}

export default Provider
