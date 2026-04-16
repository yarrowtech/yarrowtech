// import Client from "../models/Client.js";
// import Project from "../models/Project.js";
// import { Contact } from "../../models/contact.js";
// import RequestDemo from "../../models/RequestDemo.js";

// // ⭐ GET ADMIN DASHBOARD STATS
// export const getAdminStats = async (req, res) => {
//   try {
//     const totalClients = await Client.countDocuments();
//     const totalProjects = await Project.countDocuments();
//     const totalContacts = await Contact.countDocuments();
//     const totalDemoRequests = await RequestDemo.countDocuments();

//     const demoChart = [
//       { month: "Jan", requests: 12 },
//       { month: "Feb", requests: 18 },
//       { month: "Mar", requests: 30 },
//       { month: "Apr", requests: 20 },
//       { month: "May", requests: 27 },
//     ];

//     const userGrowth = [
//       { date: "Jun", users: 1100 },
//       { date: "Jul", users: 1120 },
//       { date: "Aug", users: 1150 },
//       { date: "Sep", users: 1170 },
//       { date: "Oct", users: 1250 },
//     ];

//     const projectDistribution = [
//       { name: "Completed", value: await Project.countDocuments({ status: "completed" }) },
//       { name: "Ongoing", value: await Project.countDocuments({ status: "ongoing" }) },
//       { name: "On Hold", value: await Project.countDocuments({ status: "pending" }) },
//     ];

//     res.json({
//       topCards: [
//         { label: "Total Clients", value: totalClients },
//         { label: "Total Projects", value: totalProjects },
//         { label: "Demo Requests", value: totalDemoRequests },
//         { label: "Contacts Received", value: totalContacts },
//       ],
//       demoChart,
//       userGrowth,
//       projectDistribution,
//     });

//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Failed to fetch admin stats" });
//   }
// };


// // ⭐ GET ERP USERS (Admin Only)
// export const getERPUsers = async (req, res) => {
//   try {
//     // These users come from ENV
//     const managers = process.env.MANAGERS?.split(",") || [];
//     const techleads = process.env.TECHLEADS?.split(",") || [];

//     const managerUsers = managers.map((m) => ({
//       email: m.split(":")[0],
//       role: "manager",
//     }));

//     const techLeadUsers = techleads.map((t) => ({
//       email: t.split(":")[0],
//       role: "techlead",
//     }));

//     const adminUser = {
//       email: process.env.ADMIN_EMAIL,
//       role: "admin",
//     };

//     res.json({
//       users: [adminUser, ...managerUsers, ...techLeadUsers],
//     });

//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Failed to fetch ERP users" });
//   }
// };





import Client from "../models/Client.js";
import Project from "../models/Project.js";
import ERPUser from "../models/User.js";           // ✅ NEW
import { Contact } from "../../models/contact.js";
import RequestDemo from "../../models/RequestDemo.js";

/* ============================================================
   ⭐ ADMIN DASHBOARD STATS
============================================================ */
export const getAdminStats = async (req, res) => {
  try {
    const totalClients = await Client.countDocuments();
    const totalProjects = await Project.countDocuments();
    const totalContacts = await Contact.countDocuments();
    const totalDemoRequests = await RequestDemo.countDocuments();
    const totalUsers = await ERPUser.countDocuments(); // ✅ NEW

    const demoChart = [
      { month: "Jan", requests: 12 },
      { month: "Feb", requests: 18 },
      { month: "Mar", requests: 30 },
      { month: "Apr", requests: 20 },
      { month: "May", requests: 27 },
    ];

    const userGrowth = [
      { date: "Jun", users: 1100 },
      { date: "Jul", users: 1120 },
      { date: "Aug", users: 1150 },
      { date: "Sep", users: 1170 },
      { date: "Oct", users: 1250 },
    ];

    const projectDistribution = [
      { name: "Completed", value: await Project.countDocuments({ status: "completed" }) },
      { name: "Ongoing", value: await Project.countDocuments({ status: "ongoing" }) },
      { name: "On Hold", value: await Project.countDocuments({ status: "pending" }) },
    ];

    res.json({
      topCards: [
        { label: "Total Clients", value: totalClients },
        { label: "Total Projects", value: totalProjects },
        { label: "ERP Users", value: totalUsers },            // ✅ NEW
        { label: "Demo Requests", value: totalDemoRequests },
        { label: "Contacts Received", value: totalContacts },
      ],
      demoChart,
      userGrowth,
      projectDistribution,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch admin stats" });
  }
};

/* ============================================================
   ⭐ GET ALL ERP USERS (Admin Only)
============================================================ */
export const getERPUsers = async (req, res) => {
  try {
    const users = await ERPUser.find().select("-password");

    res.json({
      success: true,
      users,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch ERP users" });
  }
};

/* ============================================================
   ⭐ CREATE ERP USER (Manager / TechLead)
============================================================ */
export const createERPUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (!["manager", "techlead", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const exists = await ERPUser.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await ERPUser.create({
      email: email.toLowerCase(),
      password,
      role,
      status: "active",
    });

    res.json({
      success: true,
      message: "User created successfully",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create user" });
  }
};

/* ============================================================
   ⭐ TOGGLE USER STATUS (Active / Inactive)
============================================================ */
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await ERPUser.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.status = user.status === "active" ? "inactive" : "active";
    await user.save();

    res.json({
      success: true,
      status: user.status,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update user status" });
  }
};

/* ============================================================
   ⭐ RESET USER PASSWORD (Admin)
============================================================ */
export const resetUserPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password required" });
    }

    const user = await ERPUser.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = password; // hashed by model middleware
    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to reset password" });
  }
};
