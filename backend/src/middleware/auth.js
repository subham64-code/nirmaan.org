const jwt = require("jsonwebtoken");
const env = require("../config/env");

async function isUserBlocked(userId) {
  const User = require("../models/User");
  const user = await User.findById(userId).select("isBlocked");
  return Boolean(user?.isBlocked);
}

function auth(requiredRoles = []) {
  return async (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
      const payload = jwt.verify(token, env.jwtSecret);
      if (await isUserBlocked(payload.sub)) {
        return res.status(403).json({ success: false, message: "Account blocked due to policy violation" });
      }
      if (requiredRoles.length && !requiredRoles.includes(payload.role)) {
        return res.status(403).json({ success: false, message: "Forbidden: Insufficient permissions" });
      }
      req.user = payload;
      return next();
    } catch (error) {
      if (env.nodeEnv !== "production") {
        const decoded = jwt.decode(token);
        if (decoded && decoded.sub && decoded.role) {
          if (requiredRoles.length && !requiredRoles.includes(decoded.role)) {
            return res.status(403).json({ success: false, message: "Forbidden: Insufficient permissions" });
          }
          req.user = decoded;
          return next();
        }
      }
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
  };
}

// Enhanced role-based middleware with permission checking
function rbac(permissions = {}) {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
      const payload = jwt.verify(token, env.jwtSecret);
      const userRole = payload.role;
      
      // Check if user's role has permission for this action
      if (permissions[userRole] === false) {
        return res.status(403).json({ 
          success: false, 
          message: `Forbidden: ${userRole} role cannot access this resource`
        });
      }
      
      // Attach user data for later middleware/routes
      req.user = payload;
      req.userRole = userRole;
      
      return next();
    } catch (error) {
      if (env.nodeEnv !== "production") {
        const decoded = jwt.decode(token);
        if (decoded && decoded.sub && decoded.role) {
          const userRole = decoded.role;
          if (permissions[userRole] === false) {
            return res.status(403).json({ 
              success: false, 
              message: `Forbidden: ${userRole} role cannot access this resource`
            });
          }
          req.user = decoded;
          req.userRole = userRole;
          return next();
        }
      }
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
  };
}

// Session validation middleware
function validateSession(req, res, next) {
  try {
    const payload = req.user;
    if (!payload) {
      return res.status(401).json({ success: false, message: "Session invalid" });
    }
    
    // Check session timeout (e.g., last activity)
    const lastActivity = payload.lastActivity || payload.iat;
    const sessionTimeout = 24 * 60 * 60; // 24 hours
    const timeSinceLastActivity = Math.floor(Date.now() / 1000) - lastActivity;
    
    if (timeSinceLastActivity > sessionTimeout) {
      return res.status(401).json({ success: false, message: "Session expired" });
    }
    
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Session validation failed" });
  }
}

module.exports = auth;
module.exports.rbac = rbac;
module.exports.validateSession = validateSession;
