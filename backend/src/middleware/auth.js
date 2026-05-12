const jwt = require("jsonwebtoken");
const env = require("../config/env");

function auth(requiredRoles = []) {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
      const payload = jwt.verify(token, env.jwtSecret);
      if (requiredRoles.length && !requiredRoles.includes(payload.role)) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
      req.user = payload;
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
  };
}

module.exports = auth;
