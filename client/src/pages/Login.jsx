import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Divider,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import GoogleIcon from "@mui/icons-material/Google";
import { useForm } from "react-hook-form";
import Cookies from "js-cookie";
import { useEffect } from "react";
import axios from "axios";
import useThinkify from "../hooks/useThinkify";
import AlertBox from "../../components/common/AlertBox";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

const Login = () => {
  const navigate = useNavigate();
  // alert message and auth context
  const { setAlertBoxOpenStatus, setAlertMessage, setAlertSeverity, setLoadingStatus, setUser, setIsAuthenticated } =
    useThinkify();
  // form validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: yupResolver(schema),
  });

  // form submit
  const onSubmit = async (data) => {
    try {
      // Show loading state during login
      setLoadingStatus(true);
      
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_ENDPOINT}/users/login`,
        data
      );
      
      if (response.data.status) {
        // Store tokens synchronously with multiple path configurations
        const tokenKey = import.meta.env.VITE_TOKEN_KEY;
        const userRoleKey = import.meta.env.VITE_USER_ROLE;
        const expires = Number(import.meta.env.VITE_COOKIE_EXPIRES);
        
        // Set cookies with different path configurations to ensure they work
        Cookies.set(tokenKey, response.data.token, { expires, path: "" });
        Cookies.set(userRoleKey, response.data.user.role, { expires, path: "" });
        Cookies.set(tokenKey, response.data.token, { expires, path: "/" });
        Cookies.set(userRoleKey, response.data.user.role, { expires, path: "/" });
        
        // Update Provider context immediately
        setUser({ role: response.data.user.role });
        setIsAuthenticated(true);
        
        // Add delay to ensure cookies are set and context is updated
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Navigate based on role with replace to prevent back button issues
        const role = response.data.user.role;
        if (role === "student") {
          navigate("/profile", { replace: true });
        } else if (role === "teacher") {
          navigate("/teacher/dashboard", { replace: true });
        } else if (role === "admin") {
          navigate("/dashboard", { replace: true });
        } else {
          setAlertBoxOpenStatus(true);
          setAlertSeverity("error");
          setAlertMessage("Invalid user role");
        }
      } else {
        setAlertBoxOpenStatus(true);
        setAlertSeverity("error");
        setAlertMessage(response.data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      setAlertBoxOpenStatus(true);
      setAlertSeverity("error");
      
      // Better error handling
      if (error.response?.data?.message) {
        setAlertMessage(error.response.data.message);
      } else if (error.message) {
        setAlertMessage(error.message);
      } else {
        setAlertMessage("Login failed. Please try again.");
      }
    } finally {
      setLoadingStatus(false);
    }
  };

  // check if user is already logged in
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        // Add delay to ensure any logout cleanup is complete
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const token = Cookies.get(import.meta.env.VITE_TOKEN_KEY);
        const role = Cookies.get(import.meta.env.VITE_USER_ROLE);
        
        if (token && role) {
          // Update context state
          setUser({ role });
          setIsAuthenticated(true);
          
          // Add small delay to prevent race conditions
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Navigate based on role
          if (role === "student") {
            navigate("/profile", { replace: true });
          } else if (role === "teacher") {
            navigate("/teacher/dashboard", { replace: true });
          } else if (role === "admin") {
            navigate("/dashboard", { replace: true });
          }
        } else {
          // Clean up any invalid cookies with multiple path configurations
          const tokenKey = import.meta.env.VITE_TOKEN_KEY;
          const roleKey = import.meta.env.VITE_USER_ROLE;
          
          Cookies.remove(tokenKey, { path: "" });
          Cookies.remove(roleKey, { path: "" });
          Cookies.remove(tokenKey, { path: "/" });
          Cookies.remove(roleKey, { path: "/" });
          Cookies.remove(tokenKey);
          Cookies.remove(roleKey);
          
          // Ensure context is cleared
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        // Clear everything on error
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    checkAuthAndRedirect();
  }, [navigate, setUser, setIsAuthenticated]);

  return (
    <>
      <Box height="100vh" sx={{ display: "flex" }}>
        <Box
          sx={{
            flex: "1",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box>
            <img src="/images/auth.jpg" alt="" />
          </Box>
        </Box>
        <Box
          sx={{
            flex: 1,
            backgroundColor: "#1b2e35",
            display: "flex",
            alignItems: "center",
          }}
        >
          <AlertBox />
          <Box width={1 / 2} mx="auto" my="auto">
            <Typography
              variant="h2"
              component="h2"
              sx={{ color: "white", fontSize: "2.25rem", fontWeight: "bold" }}
            >
              Welcome Back
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              sx={{ mt: 4 }}
            >
              <TextField
                fullWidth
                placeholder="Enter Email"
                sx={{
                  mb: 1,
                  color: "white",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "white",
                    },
                    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "white",
                    },
                  },
                  "& .MuiInputLabel-outlined": {
                    color: "white",
                  },
                  "& .MuiInputBase-input": {
                    "&::placeholder": {
                      color: "white",
                    },
                  },
                }}
                {...register("email", { required: true })}
              />
              {errors.email && (
                <Typography
                  variant="p"
                  component="p"
                  sx={{ color: "red", mb: 2 }}
                >
                  {errors.email.message}
                </Typography>
              )}
              <TextField
                fullWidth
                placeholder="Enter Password"
                type="password"
                sx={{
                  mb: 1,
                  color: "white",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "white",
                    },
                    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "white",
                    },
                  },
                  "& .MuiInputLabel-outlined": {
                    color: "white",
                  },
                  "& .MuiInputBase-input": {
                    "&::placeholder": {
                      color: "white",
                    },
                  },
                }}
                {...register("password", { required: true })}
              />
              {errors.password && (
                <Typography variant="p" component="p" sx={{ color: "red" }}>
                  {errors.password.message}
                </Typography>
              )}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <FormControlLabel
                  control={<Checkbox color="primary" />}
                  label="Remember me"
                  sx={{ mt: 1, color: "gray" }}
                />
                <Link style={{ color: "white" }} to="/forgot-password">
                  <Typography variant="body2">Forgot Password</Typography>
                </Link>
              </Box>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mt: 4 }}
              >
                Log In
              </Button>
            </Box>
            <Divider sx={{ my: 1, color: "white" }}>OR</Divider>
            <Box>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                startIcon={<GoogleIcon />}
              >
                Continue With Google
              </Button>
            </Box>
            <Box>
              <Typography variant="body2" color="white" sx={{ mt: 4 }}>
                {`Don't`} Have an Account?
                <Link
                  to="/registration"
                  style={{ color: "white", marginLeft: "5px" }}
                >
                  Join Now
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Login;
