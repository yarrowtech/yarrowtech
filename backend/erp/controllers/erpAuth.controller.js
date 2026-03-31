
// import ERPUser from "../models/User.js";
// import ERPClient from "../models/Client.js";
// import { signErpToken } from "../middleware/erpAuth.js";

// /* ============================================================
//    ERP LOGIN
// ============================================================ */
// export const erpLogin = async (req, res) => {
//   try {
//     /* 🔍 DEBUG (REMOVE AFTER FIX IS CONFIRMED) */
//     console.log("🔥 ERP LOGIN BODY:", req.body);

//     /* ================= SAFE BODY DESTRUCTURE ================= */
//     const body = req.body || {};
//     const email = body.email?.toLowerCase()?.trim();
//     const password = body.password;

//     /* ================= VALIDATION ================= */
//     if (!email || !password) {
//       return res.status(400).json({
//         message: "Email and password are required",
//       });
//     }

//     /* ============================================================
//        ADMIN / MANAGER / TECH LEAD LOGIN
//     ============================================================ */
//     const user = await ERPUser.findOne({ email });

//     if (user) {
//       if (user.status !== "active") {
//         return res.status(403).json({
//           message: "Account is disabled. Contact administrator.",
//         });
//       }

//       const isMatch = await user.matchPassword(password);
//       if (!isMatch) {
//         return res.status(401).json({
//           message: "Invalid credentials",
//         });
//       }

//       return res.status(200).json({
//         token: signErpToken({
//           id: user._id,
//           email: user.email,
//           role: user.role,
//           name: user.name || user.email.split("@")[0],
//         }),
//         role: user.role,
//         name: user.name || user.email.split("@")[0],
//       });
//     }

//     /* ============================================================
//        CLIENT LOGIN
//     ============================================================ */
//     const client = await ERPClient.findOne({ email });

//     if (!client) {
//       return res.status(404).json({
//         message: "User not found",
//       });
//     }

//     if (!client.password) {
//       return res.status(400).json({
//         message: "Client account has no password. Contact support.",
//       });
//     }

//     const isMatch = await client.matchPassword(password);
//     if (!isMatch) {
//       return res.status(401).json({
//         message: "Invalid credentials",
//       });
//     }

//     return res.status(200).json({
//       token: signErpToken({
//         id: client._id,
//         email: client.email,
//         role: "client",
//         name: client.name,
//       }),
//       role: "client",
//       name: client.name,
//     });

//   } catch (err) {
//     console.error("❌ ERP LOGIN ERROR:", err);
//     return res.status(500).json({
//       message: "Server error during login",
//     });
//   }
// };

// /* ============================================================
//    ERP LOGOUT (JWT – STATELESS)
// ============================================================ */
// export const erpLogout = async (req, res) => {
//   try {
//     return res.status(200).json({
//       success: true,
//       message: "Logged out successfully",
//     });
//   } catch (err) {
//     console.error("❌ ERP LOGOUT ERROR:", err);
//     return res.status(500).json({
//       message: "Logout failed",
//     });
//   }
// };







// 30.03 - client login


import ERPUser from "../models/User.js";
import ERPClient from "../models/Client.js";
import { signErpToken } from "../middleware/erpAuth.js";

/* ============================================================
   ERP LOGIN
============================================================ */
export const erpLogin = async (req, res) => {
  try {
    /* 🔍 DEBUG (remove in production) */
    console.log("🔥 ERP LOGIN BODY:", req.body);

    /* ================= SAFE BODY ================= */
    const body = req.body || {};
    const email = body.email?.toLowerCase()?.trim();
    const password = body.password;

    /* ================= VALIDATION ================= */
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    /* ============================================================
       USER LOGIN (ADMIN / MANAGER / TECH LEAD)
    ============================================================ */
    const user = await ERPUser.findOne({ email });

    if (user) {
      /* 🔒 STATUS CHECK */
      if (user.status !== "active") {
        return res.status(403).json({
          message: "Account is disabled. Contact administrator.",
        });
      }

      /* 🔐 PASSWORD CHECK */
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          message: "Invalid credentials",
        });
      }

      /* 🎟 TOKEN RESPONSE */
      return res.status(200).json({
        token: signErpToken({
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.name || user.email.split("@")[0],
        }),
        role: user.role,
        name: user.name || user.email.split("@")[0],
      });
    }

    /* ============================================================
       CLIENT LOGIN
    ============================================================ */
    const client = await ERPClient.findOne({ email });

    /* ❌ DO NOT reveal user existence */
    if (!client) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    /* 🔒 STATUS CHECK */
    if (client.status && client.status !== "active") {
      return res.status(403).json({
        message: "Client account is inactive",
      });
    }

    /* ⚠️ PASSWORD EXIST CHECK */
    if (!client.password) {
      return res.status(400).json({
        message: "Client account has no password. Contact support.",
      });
    }

    /* 🔐 PASSWORD CHECK */
    const isMatch = await client.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    /* 🎟 TOKEN RESPONSE */
    return res.status(200).json({
      token: signErpToken({
        id: client._id,
        email: client.email,
        role: "client",
        name:
          client.name ||
          client.clientName ||
          client.email.split("@")[0],
      }),
      role: "client",
      name:
        client.name ||
        client.clientName ||
        client.email.split("@")[0],
    });

  } catch (err) {
    console.error("❌ ERP LOGIN ERROR:", err);
    return res.status(500).json({
      message: "Server error during login",
    });
  }
};

/* ============================================================
   ERP LOGOUT (JWT – STATELESS)
============================================================ */
export const erpLogout = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    console.error("❌ ERP LOGOUT ERROR:", err);
    return res.status(500).json({
      message: "Logout failed",
    });
  }
};