import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PollIcon from "@mui/icons-material/Poll";
import FolderIcon from "@mui/icons-material/Folder";
import GroupIcon from "@mui/icons-material/Group";
import LogoutIcon from "@mui/icons-material/Logout";

import NavBar from "./NavBar";
import useThinkify from "../hooks/useThinkify";
import Cookies from "js-cookie";
import { useEffect } from "react";
import AlertBox from "../../components/common/AlertBox";
import Footer from "./Footer";

const TeacherSideBar = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAlertBoxOpenStatus, setAlertMessage, setAlertSeverity, setLoadingStatus, logout } =
    useThinkify();
    
  const listData = [
    {
      label: "Dashboard",
      url: "/teacher/dashboard",
      icon: <DashboardIcon />,
    },
    {
      label: "Assignments",
      url: "/teacher/assignments",
      icon: <AssignmentIcon />,
    },
    {
      label: "Polls",
      url: "/teacher/polls",
      icon: <PollIcon />,
    },
    {
      label: "Resources",
      url: "/teacher/resources",
      icon: <FolderIcon />,
    },
    {
      label: "Students",
      url: "/teacher/students",
      icon: <GroupIcon />,
    }
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
    const userRole = Cookies.get(import.meta.env.VITE_USER_ROLE);
    if (userRole !== "teacher") {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <>
      <NavBar />
      <Box sx={{ display: "flex" }}>
        <Drawer
          variant="permanent"
          sx={{
            width: 240,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: 240,
              boxSizing: "border-box",
              top: "64px",
              height: "calc(100vh - 64px)",
              backgroundColor: "#f8f9fa",
              borderRight: "1px solid #e0e0e0",
            },
          }}
        >
          <Box sx={{ overflow: "auto", padding: "16px 0" }}>
            <List>
              {listData.map((item, index) => (
                <ListItem
                  key={index}
                  component={NavLink}
                  to={item.url}
                  sx={{
                    margin: "4px 8px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    color: "inherit",
                    "&.active": {
                      backgroundColor: "#e3f2fd",
                      color: "#1976d2",
                      "& .MuiListItemIcon-root": {
                        color: "#1976d2",
                      },
                    },
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: "40px",
                      color: location.pathname === item.url ? "#1976d2" : "inherit",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    sx={{
                      "& .MuiListItemText-primary": {
                        fontSize: "14px",
                        fontWeight: location.pathname === item.url ? 600 : 400,
                      },
                    }}
                  />
                </ListItem>
              ))}
              
              {/* Logout Button */}
              <ListItem
                onClick={handleLogOut}
                sx={{
                  margin: "4px 8px",
                  marginTop: "16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  color: "#d32f2f",
                  "&:hover": {
                    backgroundColor: "#ffebee",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: "40px", color: "#d32f2f" }}>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Logout"
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontSize: "14px",
                      fontWeight: 500,
                    },
                  }}
                />
              </ListItem>
            </List>
          </Box>
        </Drawer>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            padding: "24px",
            marginTop: "64px",
            minHeight: "calc(100vh - 64px)",
            backgroundColor: "#fafafa",
          }}
        >
          {children || <Outlet />}
        </Box>
      </Box>
      
      <AlertBox />
      <Footer />
    </>
  );
};

export default TeacherSideBar;
