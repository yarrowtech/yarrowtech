// export const getClientDashboard = async (req, res) => {
//   try {
//     const clientEmail = req.erpUser.email;

//     const projects = await ERPProject.find({ clientEmail });

//     res.json({
//       totalProjects: projects.length,
//       paymentsMade: 0,
//       pendingBills: 0,
//       tickets: 0,
//       monthlyWork: [],
//       progressTimeline: [],
//       projectStatus: [],
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Dashboard error" });
//   }
// };
