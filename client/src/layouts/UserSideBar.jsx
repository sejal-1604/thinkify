import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";

import DashboardIcon from "@mui/icons-material/Dashboard";
import AddBoxIcon from "@mui/icons-material/AddBox";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";

import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";

import NavBar from "./NavBar";
import Footer from "./Footer";
import Cookies from "js-cookie";
import useThinkify from "../hooks/useThinkify";
import AlertBox from "../../components/common/AlertBox";
import { useEffect } from "react";


const UserSideBar = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAlertBoxOpenStatus, setAlertMessage, setAlertSeverity, setLoadingStatus, logout } =
    useThinkify();

  const listData = [
    {
      label: "My Profile",
      url: "/profile",
      icon: <DashboardIcon />,
    },
    {
      label: "My Post",
      url: "/my-post",
      icon: <ListAltIcon />,
    },
    {
      label: "Add Post",
      url: "/add-post",
      icon: <AddBoxIcon />,
    },

    {
      label: "Task Manager",
      url: "/task-management",
      icon: <PlaylistAddCheckIcon />,
    },
    {
      label: "Setting",
      url: "/setting",
      icon: <SettingsIcon />,
    },
  ];

  const handleLogOut = async () => {
    try {
      // Show loading state
      setLoadingStatus(true);
      
      // Use the centralized logout function from Provider
      await logout();
      
      // Show success message
      setAlertBoxOpenStatus(true);
      setAlertSeverity("success");
      setAlertMessage("Logged Out Successfully");
      
      // Navigate to login after cleanup
      navigate("/login", { replace: true });
      
    } catch (error) {
      console.error("Logout failed:", error);
      setAlertBoxOpenStatus(true);
      setAlertSeverity("error");
      setAlertMessage("Logout failed. Please try again.");
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    const token = Cookies.get(import.meta.env.VITE_TOKEN_KEY);
    const role = Cookies.get(import.meta.env.VITE_USER_ROLE);
    if (token && role) {
      // Only redirect if user is not student or not already on student routes
      if (role === "admin") {
        navigate("/dashboard");
      } else if (role === "teacher") {
        navigate("/teacher/dashboard");
      }
      // Don't redirect student users - they're already where they should be
    } else {
      Cookies.remove(import.meta.env.VITE_TOKEN_KEY, { path: "" });
      Cookies.remove(import.meta.env.VITE_USER_ROLE, { path: "" });
      navigate("/login");
    }
  }, []);

  return (
    <div>
      <NavBar />
      <AlertBox />
      <Box sx={{ display: "flex", minHeight: "620px" }}>
        <Drawer
          variant="persistent"
          open
          sx={{
            width: "240px",
            "& .MuiDrawer-paper": {
              position: "static",
            },
          }}
        >
          <List sx={{ p: "0" }}>
            {listData.map(({ label, url, icon }, index) => (
              <ListItem
                key={label + "_" + index}
                sx={{ borderBottom: "1px solid lightgray" }}
                component="div"
              >
                <NavLink
                  to={url}
                  style={{
                    width: "100%",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    color: location.pathname === url ? "#59e3a7" : "inherit",
                  }}
                  activestyle={{ color: "#59e3a7" }}
                >
                  <ListItemIcon
                    sx={{
                      color: location.pathname === url ? "#59e3a7" : "inherit",
                    }}
                  >
                    {icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={label}
                    sx={{
                      color: location.pathname === url ? "#59e3a7" : "inherit",
                    }}
                  />
                </NavLink>
              </ListItem>
            ))}
            <ListItem
              sx={{ borderBottom: "1px solid lightgray" }}
              component="div"
            >
              <NavLink
                onClick={handleLogOut}
                component="button"
                style={{
                  width: "100%",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  color: "inherit",
                }}
              >
                <ListItemIcon sx={{ color: "inherit" }}>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary={"Sign Out"} />
              </NavLink>
            </ListItem>
          </List>
        </Drawer>
        <Box sx={{ width: "100%", margin: "10px" }}>{children}</Box>
      </Box>
      <Footer />
    </div>
  );
};

UserSideBar.propTypes = {
  children: PropTypes.node.isRequired,
};

export default UserSideBar;
