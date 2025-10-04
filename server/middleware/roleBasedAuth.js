import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import UserModel from "../models/userSchema.js";

/**
 * Flexible role-based authentication middleware
 * @param {Array} allowedRoles - Array of roles that can access the route
 * @param {Array} requiredPermissions - Optional array of specific permissions required
 * @returns {Function} Express middleware function
 */
const roleBasedAuth = (allowedRoles = [], requiredPermissions = []) => {
    return async (req, res, next) => {
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

            // Check if user role is allowed
            if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
                return res.status(403).json({ 
                    "status": false, 
                    "message": `Access denied. Required roles: ${allowedRoles.join(', ')}`,
                    "userRole": user.role,
                    "allowedRoles": allowedRoles
                });
            }

            // Check specific permissions if required
            if (requiredPermissions.length > 0) {
                // Admin has all permissions
                if (user.role !== 'admin') {
                    const hasAllPermissions = requiredPermissions.every(permission => 
                        user.permissions && user.permissions.includes(permission)
                    );
                    
                    if (!hasAllPermissions) {
                        return res.status(403).json({ 
                            "status": false, 
                            "message": `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
                            "userPermissions": user.permissions || [],
                            "requiredPermissions": requiredPermissions
                        });
                    }
                }
            }

            // Attach user to request object
            req.user = user;
            next();

        } catch (error) {
            console.error('Role-based auth error:', error);
            
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
    }
};

/**
 * Convenience functions for common role combinations
 */
export const studentOnly = () => roleBasedAuth(['student']);
export const teacherOnly = () => roleBasedAuth(['teacher']);
export const adminOnly = () => roleBasedAuth(['admin']);
export const teacherOrAdmin = () => roleBasedAuth(['teacher', 'admin']);
export const studentOrTeacher = () => roleBasedAuth(['student', 'teacher']);
export const allRoles = () => roleBasedAuth(['student', 'teacher', 'admin']);

/**
 * Permission-based middleware
 */
export const requirePermissions = (permissions) => roleBasedAuth([], permissions);

export default roleBasedAuth;
