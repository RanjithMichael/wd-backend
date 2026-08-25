import jwt from "jsonwebtoken";

const auth = (roles = []) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({ msg: "❌ No token provided" });
      }

      const parts = authHeader.split(" ");
      if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({ msg: "❌ Malformed authorization header" });
      }

      const token = parts[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach decoded payload to request
      req.user = decoded;

      // Role check (optional)
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ msg: "❌ Forbidden: insufficient role" });
      }

      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ msg: "❌ Token expired" });
      }
      return res.status(401).json({ msg: "❌ Invalid or expired token" });
    }
  };
};

export default auth;
