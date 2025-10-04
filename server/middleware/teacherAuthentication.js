import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import UserModel from "../models/userSchema.js";

/**
 * Teacher-specific authentication middleware
 * Ensures only users with 'teacher' role can access protected routes
 */
const teacherAuthentication = async (req, res, next) => {
    try {
        const authorization = req.headers['authorization'];
        
        if (!authorization || !authorization.startsWith("Bearer ")) {
            return res.status(401).json({ 
                "status": false, 
                "message": "Authorization token required" 
            });
        }

        const authorizationToken = authorization.split(" ")[1];
        
        if (!authorizationToken || authorizationToken === "null" || authorizationToken === "undefined") {
            return res.status(401).json({ 
                "status": false, 
                "message": "Invalid authorization token" 
            });
        }

        // Verify JWT token
        const { userId } = jwt.verify(authorizationToken, process.env.JWT_SECRET_KEY);
        
        if (!Types.ObjectId.isValid(userId)) {
            return res.status(403).json({ 
                "status": false, 
                "message": "Invalid user ID in token" 
            });
        }

        // Get user from database
        const user = await UserModel.findById(userId).select("-password");
        
        if (!user) {
            return res.status(403).json({ 
                "status": false, 
                "message": "User not found" 
            });
        }

        // Check if user has teacher role
        if (user.role !== "teacher") {
            return res.status(403).json({ 
                "status": false, 
                "message": "Teacher access required",
                "userRole": user.role
            });
        }

        // Attach teacher to request object
        req.teacher = user;
        req.user = user; // Also attach as user for consistency
        next();

    } catch (error) {
        console.error('Teacher authentication error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                "status": false, 
                "message": "Invalid token" 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                "status": false, 
                "message": "Token expired" 
            });
        }
        
        res.status(500).json({ 
            "status": false, 
            "message": "Internal Server Error", 
            "error": process.env.NODE_ENV === 'development' ? error.message : 'Authentication failed'
        });
    }
};

export default teacherAuthentication;
