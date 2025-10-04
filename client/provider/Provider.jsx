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
        const checkAuth = async () => {
            try {
                const token = Cookies.get(import.meta.env.VITE_TOKEN_KEY);
                const role = Cookies.get(import.meta.env.VITE_USER_ROLE);
                
                if (token && role) {
                    // Verify token with backend
                    const response = await axios.get(
                        `${import.meta.env.VITE_SERVER_ENDPOINT}/users/profile`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );
                    
                    if (response.data.status) {
                        setUser(response.data.user);
                        setIsAuthenticated(true);
                    } else {
                        // Invalid token, clear cookies
                        Cookies.remove(import.meta.env.VITE_TOKEN_KEY, { path: "" });
                        Cookies.remove(import.meta.env.VITE_USER_ROLE, { path: "" });
                        setUser(null);
                        setIsAuthenticated(false);
                    }
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                // Clear invalid cookies
                Cookies.remove(import.meta.env.VITE_TOKEN_KEY, { path: "" });
                Cookies.remove(import.meta.env.VITE_USER_ROLE, { path: "" });
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
