import jwt from "jsonwebtoken";

/* ===============================
   SIGN ERP TOKEN ✅ REQUIRED
=============================== */
export function signErpToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

/* ===============================
   VERIFY ERP TOKEN
=============================== */
export function verifyErpToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "ERP login required",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ STANDARDIZED USER OBJECT
    req.erpUser = {
      _id: decoded.id || decoded._id,
      role: decoded.role,
      email: decoded.email,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid ERP token",
    });
  }
}
