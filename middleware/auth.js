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

      // 🔹 Debug log
      console.log("Decoded JWT payload:", decoded);

      // 🔹 Explicitly attach normalized fields
      req.user = {
        id: decoded.id || decoded._id, // handle both id and _id
        email: decoded.email,
        role: decoded.role || "user",
      };

      // 🔹 Role check
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ msg: "❌ Forbidden: insufficient role" });
      }

      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ msg: "❌ Token expired" });
      }
      console.error("❌ Auth error:", err);
      return res.status(401).json({ msg: "❌ Invalid or expired token" });
    }
  };
};

export default auth;
