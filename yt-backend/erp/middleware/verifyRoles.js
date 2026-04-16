// erp/middleware/verifyRoles.js

export default function verifyRoles(...allowedRoles) {
  return (req, res, next) => {
    // req.erpUser is set by verifyErpToken middleware
    if (!req.erpUser) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { role } = req.erpUser;

    // Admin override (admin can access everything)
    if (role === "admin") {
      return next();
    }

    // Check allowed roles
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        message: "Access denied for this role",
      });
    }

    next();
  };
}
